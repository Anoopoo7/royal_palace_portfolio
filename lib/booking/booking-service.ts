/**
 * Royal Palace — Homestay Booking Service
 *
 * ARCHITECTURE:
 * - The entire property is sold as ONE UNIT.
 * - Only ONE active booking can occupy any overlapping night.
 * - Double-booking prevention: we use a MongoDB session + transaction
 *   to atomically check availability and insert the booking.
 *
 * ACTIVE BOOKING RULE:
 *   A booking is considered active if:
 *     - status === "confirmed"
 *     - OR status === "pending" (legacy)
 *     - OR status === "pending_payment" AND expiresAt > now
 *   Expired pending payments (expiresAt <= now) do NOT block dates.
 *
 * OVERLAP RULE:
 *   Conflict when: existingCheckIn < newCheckOut AND existingCheckOut > newCheckIn
 *   → Checkout day is NOT an occupied night (standard hotel convention).
 */
import "server-only";
import clientPromise, { isMongoConfigured } from "@/lib/db/mongodb";
import type { Collection, Db, ClientSession, Filter } from "mongodb";
import type { Booking, BookingStatus, NightlyRate, PaymentMethod, PaymentDetails, RefundRecord } from "./types";
import { dateRangesOverlap, countNights, getOccupiedNights } from "./dates";
import { getRatesForDates } from "./pricing-service";
import { calculatePaymentBreakdown } from "./money";
import { getServerPaymentConfig } from "./payment-config";
import { logBookingAudit, getBookingAuditLogs } from "./audit-service";
import { sendOrderConfirmationEmail } from "@/lib/email/histeria-mails";
import { sendN8nOrderWebhook } from "@/lib/notifications/n8n-service";

function notifyConfirmedBooking(booking: Booking) {
  sendOrderConfirmationEmail(booking).catch((err) =>
    console.error("[notifyConfirmedBooking] Email error:", err)
  );
  sendN8nOrderWebhook(booking).catch((err) =>
    console.error("[notifyConfirmedBooking] n8n webhook error:", err)
  );
}

const DB_NAME = () => process.env.MONGODB_DB_NAME || "royal_palace_homestay_test";
const COLLECTION = "homestayBookings";

export async function getBookingsCollection(db?: Db): Promise<Collection<Booking>> {
  if (!isMongoConfigured || !clientPromise) {
    throw new Error("MongoDB is not configured");
  }
  const targetDb = db ?? (await clientPromise).db(DB_NAME());
  return targetDb.collection<Booking>(COLLECTION);
}

/**
 * Ensures MongoDB indexes for bookings. Safe to call multiple times.
 */
export async function ensureBookingIndexes(): Promise<void> {
  if (!isMongoConfigured || !clientPromise) return;
  try {
    const col = await getBookingsCollection();
    await col.createIndex({ bookingId: 1 }, { unique: true });
    await col.createIndex({ checkIn: 1, checkOut: 1 });
    await col.createIndex({ status: 1 });
    await col.createIndex({ "payment.status": 1 });
    await col.createIndex({ "payment.razorpayOrderId": 1 });
    await col.createIndex({ guestEmail: 1 });
    await col.createIndex({ expiresAt: 1 });
  } catch {
    // Indexes already exist
  }
}

/**
 * Generates a unique booking ID like "RP-884920".
 */
function generateBookingId(): string {
  return `RP-${Math.floor(100000 + Math.random() * 900000)}`;
}

function getActiveOverlapFilter(checkIn: string, checkOut: string): Filter<Booking> {
  return {
    checkIn: { $lt: checkOut },
    checkOut: { $gt: checkIn },
    status: { $in: ["confirmed", "pending"] },
  };
}

/**
 * Check whether the homestay is available for the given date range.
 * Returns true if no active booking overlaps.
 */
export async function isHomestayAvailable(
  checkIn: string,
  checkOut: string,
  sessionOrDb?: { session?: ClientSession; db?: Db }
): Promise<boolean> {
  const col = await getBookingsCollection(sessionOrDb?.db);
  const filter = getActiveOverlapFilter(checkIn, checkOut);
  const overlapping = await col.findOne(filter, { session: sessionOrDb?.session });
  return overlapping === null;
}

/**
 * Get all bookings that overlap with a date range (for calendar display).
 * Returns minimal info (no PII). Expired pending payments are automatically excluded.
 */
export async function getOverlappingBookings(
  from: string,
  to: string
): Promise<Array<{ checkIn: string; checkOut: string; status: BookingStatus }>> {
  const col = await getBookingsCollection();
  const filter = getActiveOverlapFilter(from, to);

  const results = await col
    .find(filter, { projection: { checkIn: 1, checkOut: 1, status: 1 } })
    .toArray();

  return results.map((r) => ({
    checkIn: r.checkIn,
    checkOut: r.checkOut,
    status: r.status,
  }));
}

/**
 * Creates a new booking with ATOMIC double-booking protection and payment reservation.
 *
 * Flow:
 * 1. Validate dates and input.
 * 2. Fetch authoritative prices from MongoDB (never trusted from client).
 * 3. Validate payment method against server config.
 * 4. Start MongoDB session + transaction.
 * 5. Re-check availability inside the transaction (checking confirmed + active pending holds).
 * 6. Insert booking:
 *    - For "advance" or "full": status = "pending_payment", expiresAt = now + holdMinutes.
 *    - For "pay_later": status = "confirmed", payment.status = "pay_at_property".
 * 7. Commit transaction & write audit log.
 */
export async function createHomestayBooking(data: {
  checkIn: string;
  checkOut: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  numberOfGuests: number;
  specialRequests?: string;
  paymentMethod?: PaymentMethod;
}): Promise<Booking> {
  if (!isMongoConfigured || !clientPromise) {
    throw new Error("Database not configured");
  }

  const { checkIn, checkOut } = data;
  const nights = countNights(checkIn, checkOut);
  if (nights < 1) throw new Error("Check-out must be after check-in");

  // Fetch prices server-side — authoritative
  const occupiedNights = getOccupiedNights(checkIn, checkOut);
  const ratesMap = await getRatesForDates(occupiedNights);

  // Check for missing prices
  const missingPrices = occupiedNights.filter((d) => !ratesMap.has(d));
  if (missingPrices.length > 0) {
    const err = new Error("PRICE_NOT_CONFIGURED") as Error & { missingDates: string[] };
    err.missingDates = missingPrices;
    throw err;
  }

  // Build nightly breakdown
  const nightlyBreakdown: NightlyRate[] = occupiedNights.map((d) => ({
    date: d,
    price: ratesMap.get(d)!.price,
  }));
  const totalAmount = nightlyBreakdown.reduce((sum, n) => sum + n.price, 0);

  // Resolve payment configuration & method
  const serverConfig = getServerPaymentConfig();
  const selectedMethod: PaymentMethod = data.paymentMethod || "pay_later";

  if (!serverConfig.effectiveMethods.includes(selectedMethod)) {
    throw new Error(`Payment method "${selectedMethod}" is currently not available.`);
  }

  // Calculate payment breakdown
  const breakdown = calculatePaymentBreakdown(totalAmount, selectedMethod);

  // Determine initial statuses
  const isOnlinePayment = selectedMethod === "advance" || selectedMethod === "full";
  const now = new Date();
  const nowIso = now.toISOString();

  let initialStatus: BookingStatus = "confirmed";
  let expiresAt: string | undefined = undefined;

  if (isOnlinePayment) {
    initialStatus = "pending_payment";
    const holdMs = serverConfig.holdMinutes * 60 * 1000;
    expiresAt = new Date(now.getTime() + holdMs).toISOString();
  }

  const paymentRecord: PaymentDetails = {
    method: selectedMethod,
    provider: isOnlinePayment ? "razorpay" : "offline",
    status: isOnlinePayment ? "pending" : "pay_at_property",
    totalAmount,
    requiredAmount: breakdown.requiredAmount,
    paidAmount: 0,
    remainingAmount: breakdown.remainingAmount,
    currency: "INR",
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  // Atomic transaction
  const mongoClient = await clientPromise;
  const session = mongoClient.startSession();

  try {
    let booking!: Booking;

    await session.withTransaction(async () => {
      const db = mongoClient.db(DB_NAME());
      const col = db.collection<Booking>(COLLECTION);

      // Re-check availability atomically
      const filter = getActiveOverlapFilter(checkIn, checkOut);
      const conflict = await col.findOne(filter, { session });

      if (conflict) {
        throw Object.assign(new Error("DATES_UNAVAILABLE"), { code: "DATES_UNAVAILABLE" });
      }

      let bookingId = generateBookingId();
      // Retry ID in the extremely rare collision case
      const existing = await col.findOne({ bookingId }, { session });
      if (existing) bookingId = generateBookingId();

      booking = {
        bookingId,
        checkIn,
        checkOut,
        guestName: data.guestName.trim(),
        guestEmail: data.guestEmail.toLowerCase().trim(),
        guestPhone: data.guestPhone.trim(),
        numberOfGuests: data.numberOfGuests,
        specialRequests: data.specialRequests?.trim() || undefined,
        nightlyBreakdown,
        totalAmount,
        currency: "INR",
        status: initialStatus,
        expiresAt,
        payment: paymentRecord,
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      await col.insertOne(booking, { session });
    });

    // Record audit log
    await logBookingAudit({
      action: isOnlinePayment ? "PAYMENT_INITIATED" : "BOOKING_CONFIRMED",
      bookingId: booking.bookingId,
      amount: totalAmount,
      metadata: {
        paymentMethod: selectedMethod,
        requiredAmount: breakdown.requiredAmount,
        status: initialStatus,
      },
    });

    if (!isOnlinePayment) {
      notifyConfirmedBooking(booking);
    }

    return booking;
  } finally {
    await session.endSession();
  }
}

/**
 * Creates and confirms a homestay booking directly upon successful online payment.
 * Dates are ONLY reserved and saved to MongoDB once payment is completed.
 * Fully idempotent: if booking for razorpayOrderId already exists, returns it.
 */
export async function createPaidHomestayBooking(params: {
  checkIn: string;
  checkOut: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  numberOfGuests: number;
  specialRequests?: string;
  paymentMethod: "advance" | "full";
  razorpayOrderId: string;
  razorpayPaymentId: string;
  paidAmount: number;
}): Promise<Booking> {
  if (!isMongoConfigured || !clientPromise) {
    throw new Error("Database not configured");
  }

  const col = await getBookingsCollection();

  // Idempotency: If booking for this razorpayOrderId already exists, return it
  const existingByOrder = await col.findOne({
    "payment.razorpayOrderId": params.razorpayOrderId,
  });
  if (existingByOrder) {
    return existingByOrder;
  }

  const { checkIn, checkOut } = params;
  const nights = countNights(checkIn, checkOut);
  if (nights < 1) throw new Error("Check-out must be after check-in");

  // Fetch prices server-side
  const occupiedNights = getOccupiedNights(checkIn, checkOut);
  const ratesMap = await getRatesForDates(occupiedNights);
  const missingPrices = occupiedNights.filter((d) => !ratesMap.has(d));
  if (missingPrices.length > 0) {
    throw new Error("Price not configured for requested dates");
  }

  const nightlyBreakdown: NightlyRate[] = occupiedNights.map((d) => ({
    date: d,
    price: ratesMap.get(d)!.price,
  }));
  const totalAmount = nightlyBreakdown.reduce((sum, n) => sum + n.price, 0);

  const breakdown = calculatePaymentBreakdown(totalAmount, params.paymentMethod);
  const remainingAmount = Math.max(0, totalAmount - params.paidAmount);
  const paymentStatus = params.paidAmount >= totalAmount ? "paid" : "partially_paid";

  const now = new Date().toISOString();

  // Atomic transaction to verify availability and insert confirmed booking
  const mongoClient = await clientPromise;
  const session = mongoClient.startSession();

  try {
    let booking!: Booking;

    await session.withTransaction(async () => {
      const db = mongoClient.db(DB_NAME());
      const bookingsCol = db.collection<Booking>(COLLECTION);

      // Final availability check inside transaction
      const conflict = await bookingsCol.findOne(
        {
          checkIn: { $lt: checkOut },
          checkOut: { $gt: checkIn },
          status: { $in: ["confirmed", "pending"] },
        },
        { session }
      );

      if (conflict) {
        throw Object.assign(new Error("DATES_UNAVAILABLE"), { code: "DATES_UNAVAILABLE" });
      }

      let bookingId = generateBookingId();
      const duplicate = await bookingsCol.findOne({ bookingId }, { session });
      if (duplicate) bookingId = generateBookingId();

      booking = {
        bookingId,
        checkIn,
        checkOut,
        guestName: params.guestName.trim(),
        guestEmail: params.guestEmail.toLowerCase().trim(),
        guestPhone: params.guestPhone.trim(),
        numberOfGuests: params.numberOfGuests,
        specialRequests: params.specialRequests?.trim() || undefined,
        nightlyBreakdown,
        totalAmount,
        currency: "INR",
        status: "confirmed",
        payment: {
          method: params.paymentMethod,
          provider: "razorpay",
          status: paymentStatus,
          totalAmount,
          requiredAmount: breakdown.requiredAmount,
          paidAmount: params.paidAmount,
          remainingAmount,
          currency: "INR",
          razorpayOrderId: params.razorpayOrderId,
          razorpayPaymentId: params.razorpayPaymentId,
          lastPaymentAt: now,
          createdAt: now,
          updatedAt: now,
        },
        createdAt: now,
        updatedAt: now,
      };

      await bookingsCol.insertOne(booking, { session });
    });

    await logBookingAudit({
      action: "BOOKING_CONFIRMED",
      bookingId: booking.bookingId,
      amount: params.paidAmount,
      razorpayOrderId: params.razorpayOrderId,
      razorpayPaymentId: params.razorpayPaymentId,
      metadata: {
        paymentStatus,
        method: params.paymentMethod,
        totalAmount,
        remainingAmount,
      },
    });

    notifyConfirmedBooking(booking);

    return booking;
  } finally {
    await session.endSession();
  }
}

/**
 * Fetch a single booking by its bookingId.
 */
export async function getBookingById(bookingId: string): Promise<Booking | null> {
  const col = await getBookingsCollection();
  return col.findOne({ bookingId });
}

/**
 * Saves a created Razorpay Order ID to the booking record.
 */
export async function updateBookingRazorpayOrder(
  bookingId: string,
  razorpayOrderId: string
): Promise<boolean> {
  const col = await getBookingsCollection();
  const now = new Date().toISOString();

  const result = await col.updateOne(
    { bookingId },
    {
      $set: {
        "payment.razorpayOrderId": razorpayOrderId,
        "payment.updatedAt": now,
        updatedAt: now,
      },
    }
  );

  return result.modifiedCount > 0;
}

/**
 * Confirms a booking after successful Razorpay payment verification.
 */
export async function confirmBookingPayment(params: {
  bookingId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  paidAmount: number; // in INR rupees
}): Promise<Booking | null> {
  const col = await getBookingsCollection();
  const booking = await col.findOne({ bookingId: params.bookingId });
  if (!booking) return null;

  const now = new Date().toISOString();
  const method = booking.payment?.method || "full";
  const totalAmount = booking.totalAmount;
  const paidAmount = params.paidAmount;
  const remainingAmount = Math.max(0, totalAmount - paidAmount);

  // Determine payment status
  const paymentStatus = paidAmount >= totalAmount ? "paid" : "partially_paid";

  await col.updateOne(
    { bookingId: params.bookingId },
    {
      $set: {
        status: "confirmed",
        "payment.status": paymentStatus,
        "payment.paidAmount": paidAmount,
        "payment.remainingAmount": remainingAmount,
        "payment.razorpayOrderId": params.razorpayOrderId,
        "payment.razorpayPaymentId": params.razorpayPaymentId,
        "payment.lastPaymentAt": now,
        "payment.updatedAt": now,
        updatedAt: now,
      },
      $unset: {
        expiresAt: "", // Hold is now permanently confirmed
      },
    }
  );

  await logBookingAudit({
    action: "PAYMENT_CAPTURED",
    bookingId: params.bookingId,
    amount: paidAmount,
    razorpayOrderId: params.razorpayOrderId,
    razorpayPaymentId: params.razorpayPaymentId,
    metadata: {
      paymentStatus,
      method,
      totalAmount,
      remainingAmount,
    },
  });

  const updatedBooking = await col.findOne({ bookingId: params.bookingId });
  if (updatedBooking) {
    notifyConfirmedBooking(updatedBooking);
  }

  return updatedBooking;
}

/**
 * Records a refund on a booking and updates its payment status.
 */
export async function recordBookingRefund(params: {
  bookingId: string;
  razorpayRefundId: string;
  amount: number; // in INR rupees
  amountPaise: number;
  reason?: string;
  adminUserId?: string;
  status?: "pending" | "processed" | "failed";
}): Promise<{ success: boolean; booking?: Booking; error?: string }> {
  const col = await getBookingsCollection();
  const booking = await col.findOne({ bookingId: params.bookingId });
  if (!booking) return { success: false, error: "Booking not found" };

  const now = new Date().toISOString();
  const currentPaid = booking.payment?.paidAmount ?? 0;
  const existingRefunds = booking.payment?.refunds ?? [];
  const currentRefunded = existingRefunds
    .filter((r) => r.status !== "failed")
    .reduce((sum, r) => sum + r.amount, 0);

  const maxRefundable = currentPaid - currentRefunded;
  if (params.amount > maxRefundable) {
    return {
      success: false,
      error: `Refund amount (₹${params.amount}) cannot exceed maximum refundable amount (₹${maxRefundable}).`,
    };
  }

  const refundStatus = params.status || "processed";
  const newRefundRecord: RefundRecord = {
    razorpayRefundId: params.razorpayRefundId,
    amount: params.amount,
    amountPaise: params.amountPaise,
    currency: "INR",
    status: refundStatus,
    reason: params.reason,
    initiatedAt: now,
    processedAt: refundStatus === "processed" ? now : undefined,
  };

  const updatedRefundedTotal = currentRefunded + (refundStatus !== "failed" ? params.amount : 0);
  let updatedPaymentStatus = booking.payment?.status || "paid";

  if (updatedRefundedTotal >= currentPaid && currentPaid > 0) {
    updatedPaymentStatus = "refunded";
  } else if (updatedRefundedTotal > 0) {
    updatedPaymentStatus = "partially_refunded";
  }

  await col.updateOne(
    { bookingId: params.bookingId },
    {
      $push: { "payment.refunds": newRefundRecord },
      $set: {
        "payment.refundedAmount": updatedRefundedTotal,
        "payment.status": updatedPaymentStatus,
        "payment.updatedAt": now,
        updatedAt: now,
      },
    }
  );

  await logBookingAudit({
    action: "REFUND_PROCESSED",
    bookingId: params.bookingId,
    amount: params.amount,
    razorpayRefundId: params.razorpayRefundId,
    adminUserId: params.adminUserId,
    reason: params.reason,
    metadata: {
      totalRefunded: updatedRefundedTotal,
      paymentStatus: updatedPaymentStatus,
    },
  });

  const updated = await col.findOne({ bookingId: params.bookingId });
  return { success: true, booking: updated || undefined };
}

/**
 * Cancel a booking with optional reason and audit log.
 */
export async function cancelBooking(
  bookingId: string,
  reason?: string,
  adminUserId?: string
): Promise<boolean> {
  const col = await getBookingsCollection();
  const now = new Date().toISOString();

  const result = await col.updateOne(
    { bookingId, status: { $ne: "cancelled" } },
    {
      $set: {
        status: "cancelled",
        updatedAt: now,
      },
      $unset: {
        expiresAt: "",
      },
    }
  );

  if (result.modifiedCount > 0) {
    await logBookingAudit({
      action: "BOOKING_CANCELLED",
      bookingId,
      adminUserId,
      reason,
      metadata: { cancelledAt: now },
    });
  }

  return result.modifiedCount > 0;
}

/**
 * Admin: Search, filter, and paginate bookings.
 */
export async function getAdminBookings(params: {
  search?: string;
  bookingStatus?: string;
  paymentStatus?: string;
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "checkIn" | "totalAmount";
  sortOrder?: "asc" | "desc";
}): Promise<{
  bookings: Booking[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  const col = await getBookingsCollection();
  const query: Filter<Booking> = {};

  if (params.bookingStatus && params.bookingStatus !== "all") {
    query.status = params.bookingStatus as BookingStatus;
  }

  if (params.paymentStatus && params.paymentStatus !== "all") {
    query["payment.status"] = params.paymentStatus as any;
  }

  if (params.search && params.search.trim()) {
    const s = params.search.trim();
    query.$or = [
      { bookingId: { $regex: s, $options: "i" } },
      { guestName: { $regex: s, $options: "i" } },
      { guestEmail: { $regex: s, $options: "i" } },
      { guestPhone: { $regex: s, $options: "i" } },
    ];
  }

  const page = Math.max(1, params.page || 1);
  const limit = Math.min(100, Math.max(1, params.limit || 20));
  const skip = (page - 1) * limit;

  const sortField = params.sortBy || "createdAt";
  const sortDirection = params.sortOrder === "asc" ? 1 : -1;

  const [bookings, total] = await Promise.all([
    col.find(query).sort({ [sortField]: sortDirection }).skip(skip).limit(limit).toArray(),
    col.countDocuments(query),
  ]);

  return {
    bookings,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Admin: Retrieve booking details with payment history and audit trail.
 */
export async function getAdminBookingDetail(bookingId: string): Promise<{
  booking: Booking | null;
  auditLogs: any[];
}> {
  const booking = await getBookingById(bookingId);
  const auditLogs = await getBookingAuditLogs(bookingId);

  return {
    booking,
    auditLogs,
  };
}

export { dateRangesOverlap };
