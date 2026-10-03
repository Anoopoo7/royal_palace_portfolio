import { NextResponse } from "next/server";
import { z } from "zod";
import { isHomestayAvailable, getBookingById, updateBookingRazorpayOrder } from "@/lib/booking/booking-service";
import { getServerPaymentConfig } from "@/lib/booking/payment-config";
import { calculatePaymentBreakdown, rupeesToPaise } from "@/lib/booking/money";
import { createRazorpayOrder } from "@/lib/booking/razorpay-server";
import { getOccupiedNights, countNights } from "@/lib/booking/dates";
import { getRatesForDates } from "@/lib/booking/pricing-service";
import type { PaymentMethod } from "@/lib/booking/types";

const CreateOrderSchema = z.object({
  bookingId: z.string().optional(),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  guestName: z.string().min(2).optional(),
  guestEmail: z.string().email().optional(),
  guestPhone: z.string().min(8).optional(),
  numberOfGuests: z.number().int().min(1).optional(),
  specialRequests: z.string().optional(),
  paymentMethod: z.enum(["advance", "full"]),
});

export async function POST(request: Request) {
  try {
    const config = getServerPaymentConfig();
    if (!config.paymentsEnabled) {
      return NextResponse.json(
        { success: false, message: "Online payments are currently disabled." },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const parse = CreateOrderSchema.safeParse(body);

    if (!parse.success) {
      return NextResponse.json(
        { success: false, message: "Validation error", errors: parse.error.flatten() },
        { status: 400 }
      );
    }

    const { paymentMethod, bookingId, checkIn, checkOut, guestName, guestEmail, guestPhone, numberOfGuests, specialRequests } = parse.data;

    // 1. Verify payment method is enabled
    if (!config.effectiveMethods.includes(paymentMethod)) {
      return NextResponse.json(
        { success: false, message: `Payment method ${paymentMethod} is not enabled.` },
        { status: 400 }
      );
    }

    let totalAmount = 0;
    let receiptId = "";
    let notesData: Record<string, string> = { paymentMethod };

    // SCENARIO A: Stay details passed directly (NO PRE-HOLD)
    if (checkIn && checkOut && guestName && guestEmail && guestPhone && numberOfGuests) {
      if (checkIn >= checkOut) {
        return NextResponse.json(
          { success: false, message: "Check-out must be after check-in." },
          { status: 400 }
        );
      }

      // Check current availability
      const available = await isHomestayAvailable(checkIn, checkOut);
      if (!available) {
        return NextResponse.json(
          {
            success: false,
            code: "DATES_UNAVAILABLE",
            message: "The requested dates are no longer available.",
          },
          { status: 409 }
        );
      }

      // Calculate authoritative total from MongoDB rates
      const occupiedNights = getOccupiedNights(checkIn, checkOut);
      const ratesMap = await getRatesForDates(occupiedNights);
      const missingPrices = occupiedNights.filter((d) => !ratesMap.has(d));
      if (missingPrices.length > 0) {
        return NextResponse.json(
          {
            success: false,
            code: "PRICE_NOT_CONFIGURED",
            message: "Pricing is not configured for one or more requested nights.",
          },
          { status: 422 }
        );
      }

      totalAmount = occupiedNights.reduce((sum, d) => sum + ratesMap.get(d)!.price, 0);
      receiptId = `ORDER-${Date.now().toString().slice(-6)}`;

      notesData = {
        checkIn,
        checkOut,
        guestName,
        guestEmail,
        guestPhone,
        numberOfGuests: String(numberOfGuests),
        specialRequests: specialRequests || "",
        paymentMethod,
        totalAmount: String(totalAmount),
      };
    } else if (bookingId) {
      // SCENARIO B: Existing booking ID passed
      const booking = await getBookingById(bookingId);
      if (!booking) {
        return NextResponse.json({ success: false, message: "Booking not found." }, { status: 404 });
      }
      totalAmount = booking.totalAmount;
      receiptId = booking.bookingId;
      notesData = {
        bookingId: booking.bookingId,
        guestEmail: booking.guestEmail,
        guestName: booking.guestName,
        guestPhone: booking.guestPhone,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        numberOfGuests: String(booking.numberOfGuests),
        paymentMethod,
        totalAmount: String(booking.totalAmount),
      };
    } else {
      return NextResponse.json(
        { success: false, message: "Missing stay details or booking ID." },
        { status: 400 }
      );
    }

    // Calculate required payment amount strictly on server
    const breakdown = calculatePaymentBreakdown(totalAmount, paymentMethod as PaymentMethod);
    const amountInPaise = breakdown.requiredPaise;

    if (amountInPaise <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid payment amount calculated." },
        { status: 400 }
      );
    }

    // Create Razorpay order server-side
    const razorpayOrder = await createRazorpayOrder({
      amountPaise: amountInPaise,
      currency: "INR",
      receipt: receiptId,
      notes: notesData,
    });

    if (bookingId) {
      await updateBookingRazorpayOrder(bookingId, razorpayOrder.id);
    }

    return NextResponse.json({
      success: true,
      orderId: razorpayOrder.id,
      amount: amountInPaise,
      currency: "INR",
      keyId: config.keyId,
    });
  } catch (error) {
    console.error("[POST /api/payments/create-order]", error);
    const message = error instanceof Error ? error.message : "Failed to create payment order";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
