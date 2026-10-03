import { NextResponse } from "next/server";
import { z } from "zod";
import {
  getBookingById,
  confirmBookingPayment,
  createPaidHomestayBooking,
} from "@/lib/booking/booking-service";
import { verifyPaymentSignature, fetchRazorpayPayment } from "@/lib/booking/razorpay-server";
import { calculatePaymentBreakdown, paiseToRupees } from "@/lib/booking/money";
import { getOccupiedNights } from "@/lib/booking/dates";
import { getRatesForDates } from "@/lib/booking/pricing-service";

const BookingDataSchema = z.object({
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  guestName: z.string().min(2),
  guestEmail: z.string().email(),
  guestPhone: z.string().min(8),
  numberOfGuests: z.number().int().min(1),
  specialRequests: z.string().optional(),
  paymentMethod: z.enum(["advance", "full"]),
});

const VerifySchema = z.object({
  razorpay_order_id: z.string().min(1, "razorpay_order_id is required"),
  razorpay_payment_id: z.string().min(1, "razorpay_payment_id is required"),
  razorpay_signature: z.string().min(1, "razorpay_signature is required"),
  bookingId: z.string().optional(),
  bookingData: BookingDataSchema.optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const parse = VerifySchema.safeParse(body);

    if (!parse.success) {
      return NextResponse.json(
        { success: false, message: "Invalid verification payload", errors: parse.error.flatten() },
        { status: 400 }
      );
    }

    const {
      bookingId,
      bookingData,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = parse.data;

    if (!bookingId && !bookingData) {
      return NextResponse.json(
        { success: false, message: "Either bookingId or bookingData must be provided." },
        { status: 400 }
      );
    }

    // 1. Cryptographically verify Razorpay signature server-side
    const isSignatureValid = verifyPaymentSignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });

    if (!isSignatureValid) {
      console.error(`[POST /api/payments/verify] Invalid signature for order ${razorpay_order_id}`);
      return NextResponse.json(
        { success: false, message: "Payment signature verification failed." },
        { status: 400 }
      );
    }

    // 2. Fetch the payment details from Razorpay to verify status and amount
    const payment = await fetchRazorpayPayment(razorpay_payment_id);

    // Verify payment status is captured or authorized
    if (payment.status !== "captured" && payment.status !== "authorized") {
      return NextResponse.json(
        { success: false, message: `Payment is not in captured status (current: ${payment.status}).` },
        { status: 400 }
      );
    }

    const paidPaise = typeof payment.amount === "number" ? payment.amount : Number(payment.amount);
    const paidRupees = paiseToRupees(paidPaise);

    // 3. CASE A: bookingData provided (dates are reserved ONLY NOW upon payment)
    if (bookingData) {
      // Calculate expected required amount strictly on server
      const occupiedNights = getOccupiedNights(bookingData.checkIn, bookingData.checkOut);
      const ratesMap = await getRatesForDates(occupiedNights);
      const totalAmount = occupiedNights.reduce((sum, d) => sum + (ratesMap.get(d)?.price ?? 0), 0);

      const breakdown = calculatePaymentBreakdown(totalAmount, bookingData.paymentMethod);

      if (paidPaise < breakdown.requiredPaise) {
        return NextResponse.json(
          { success: false, message: "Payment amount does not match required booking amount." },
          { status: 400 }
        );
      }

      // Atomically check availability and insert confirmed booking into MongoDB
      const confirmedBooking = await createPaidHomestayBooking({
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut,
        guestName: bookingData.guestName,
        guestEmail: bookingData.guestEmail,
        guestPhone: bookingData.guestPhone,
        numberOfGuests: bookingData.numberOfGuests,
        specialRequests: bookingData.specialRequests,
        paymentMethod: bookingData.paymentMethod,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        paidAmount: paidRupees,
      });

      return NextResponse.json({
        success: true,
        bookingId: confirmedBooking.bookingId,
        status: "confirmed",
        paymentStatus: confirmedBooking.payment?.status,
        paidAmount: paidRupees,
        remainingAmount: confirmedBooking.payment?.remainingAmount ?? 0,
        totalAmount: confirmedBooking.totalAmount,
      });
    }

    // CASE B: Pre-existing bookingId provided
    if (bookingId) {
      const booking = await getBookingById(bookingId);
      if (!booking) {
        return NextResponse.json({ success: false, message: "Booking not found" }, { status: 404 });
      }

      const confirmedBooking = await confirmBookingPayment({
        bookingId: booking.bookingId,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        paidAmount: paidRupees,
      });

      return NextResponse.json({
        success: true,
        bookingId: booking.bookingId,
        status: "confirmed",
        paymentStatus: confirmedBooking?.payment?.status,
        paidAmount: paidRupees,
        remainingAmount: confirmedBooking?.payment?.remainingAmount ?? 0,
        totalAmount: booking.totalAmount,
      });
    }

    return NextResponse.json({ success: false, message: "Invalid request" }, { status: 400 });
  } catch (error: any) {
    console.error("[POST /api/payments/verify]", error);
    if (error?.code === "DATES_UNAVAILABLE" || error?.message === "DATES_UNAVAILABLE") {
      return NextResponse.json(
        {
          success: false,
          code: "DATES_UNAVAILABLE",
          message:
            "Dates were booked by another customer before payment completed. Please contact support for an immediate refund or alternative dates.",
        },
        { status: 409 }
      );
    }
    const message = error instanceof Error ? error.message : "Verification error";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
