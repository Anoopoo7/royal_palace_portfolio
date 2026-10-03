/**
 * Royal Palace — Homestay Booking Service
 *
 * ARCHITECTURE:
 * - The entire property is sold as ONE UNIT.
 * - Only ONE active booking can occupy any overlapping night.
 * - Double-booking prevention: we use a MongoDB session + transaction
 *   to atomically check availability and insert the booking.
 *
 * OVERLAP RULE:
 *   Conflict when: existingCheckIn < newCheckOut AND existingCheckOut > newCheckIn
 *   → Checkout night is NOT an occupied night (standard hotel rule).
 */
import "server-only";
import clientPromise, { isMongoConfigured } from "@/lib/db/mongodb";
import type { Collection, Db, ClientSession } from "mongodb";
import type { Booking, BookingStatus, NightlyRate } from "./types";
import { dateRangesOverlap, countNights, getOccupiedNights } from "./dates";
import { getRatesForDates } from "./pricing-service";

const DB_NAME = () => process.env.MONGODB_DB_NAME || "royal_palace_homestay_test";
const COLLECTION = "homestayBookings";

async function getBookingsCollection(db?: Db): Promise<Collection<Booking>> {
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
    // Unique booking ID
    await col.createIndex({ bookingId: 1 }, { unique: true });
    // Support date-overlap queries quickly
    await col.createIndex({ checkIn: 1, checkOut: 1 });
    // Support status filtering
    await col.createIndex({ status: 1 });
    // Support lookups by email
    await col.createIndex({ guestEmail: 1 });
  } catch {
    // Already exist
  }
}

/**
 * Generates a unique booking ID like "RP-884920".
 */
function generateBookingId(): string {
  return `RP-${Math.floor(100000 + Math.random() * 900000)}`;
}

/**
 * Check whether the property is available for the given date range.
 * Returns true if no active (pending/confirmed) bookings overlap.
 */
export async function isHomestayAvailable(
  checkIn: string,
  checkOut: string,
  sessionOrDb?: { session?: ClientSession; db?: Db }
): Promise<boolean> {
  const col = await getBookingsCollection(sessionOrDb?.db);

  const overlapping = await col.findOne(
    {
      status: { $in: ["pending", "confirmed"] satisfies BookingStatus[] },
      checkIn: { $lt: checkOut },
      checkOut: { $gt: checkIn },
    },
    { session: sessionOrDb?.session }
  );

  return overlapping === null;
}

/**
 * Get all bookings that overlap with a date range (for calendar display).
 * Returns minimal info (no PII).
 */
export async function getOverlappingBookings(
  from: string,
  to: string
): Promise<Array<{ checkIn: string; checkOut: string; status: BookingStatus }>> {
  const col = await getBookingsCollection();
  const results = await col
    .find(
      {
        status: { $in: ["pending", "confirmed"] },
        checkIn: { $lt: to },
        checkOut: { $gt: from },
      },
      { projection: { checkIn: 1, checkOut: 1, status: 1 } }
    )
    .toArray();

  return results.map((r) => ({
    checkIn: r.checkIn,
    checkOut: r.checkOut,
    status: r.status,
  }));
}

/**
 * Creates a new booking with ATOMIC double-booking protection.
 *
 * Flow:
 * 1. Validate input.
 * 2. Fetch prices from MongoDB — NEVER from client.
 * 3. Start MongoDB session + transaction.
 * 4. Re-check availability inside the transaction.
 * 5. If conflict → abort with DATES_UNAVAILABLE.
 * 6. Insert booking.
 * 7. Commit.
 */
export async function createHomestayBooking(data: {
  checkIn: string;
  checkOut: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  numberOfGuests: number;
  specialRequests?: string;
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

  // Atomic transaction
  const mongoClient = await clientPromise;
  const session = mongoClient.startSession();

  try {
    let booking!: Booking;

    await session.withTransaction(async () => {
      const db = mongoClient.db(DB_NAME());
      const col = db.collection<Booking>(COLLECTION);

      // Re-check availability atomically
      const conflict = await col.findOne(
        {
          status: { $in: ["pending", "confirmed"] },
          checkIn: { $lt: checkOut },
          checkOut: { $gt: checkIn },
        },
        { session }
      );

      if (conflict) {
        throw Object.assign(new Error("DATES_UNAVAILABLE"), { code: "DATES_UNAVAILABLE" });
      }

      const now = new Date().toISOString();
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
        status: "confirmed",
        createdAt: now,
        updatedAt: now,
      };

      await col.insertOne(booking, { session });
    });

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
 * Cancel a booking by its bookingId.
 */
export async function cancelBooking(bookingId: string): Promise<boolean> {
  const col = await getBookingsCollection();
  const result = await col.updateOne(
    { bookingId, status: { $in: ["pending", "confirmed"] } },
    { $set: { status: "cancelled" as BookingStatus, updatedAt: new Date().toISOString() } }
  );
  return result.modifiedCount > 0;
}

// Re-export for compatibility
export { dateRangesOverlap };
