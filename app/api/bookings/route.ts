/**
 * POST /api/bookings
 *
 * Creates a new homestay booking.
 * - Server calculates all prices (never trusted from client).
 * - Uses MongoDB transaction to prevent double-bookings.
 * - Returns 409 if dates become unavailable between check and submit.
 */
import { NextResponse } from "next/server";
import { z } from "zod";
import { createHomestayBooking } from "@/lib/booking/booking-service";

const BookingSchema = z.object({
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "checkIn must be YYYY-MM-DD"),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "checkOut must be YYYY-MM-DD"),
  guestName: z.string().min(2, "Full name is required").max(100),
  guestEmail: z.string().email("Valid email is required"),
  guestPhone: z.string().min(8, "Valid phone number is required").max(20),
  numberOfGuests: z.number().int().min(1).max(20),
  specialRequests: z.string().max(1000).optional(),
  paymentMethod: z.enum(["advance", "full", "pay_later"]).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const parse = BookingSchema.safeParse(body);

    if (!parse.success) {
      return NextResponse.json(
        { success: false, code: "VALIDATION_ERROR", message: parse.error.flatten() },
        { status: 400 }
      );
    }

    const { checkIn, checkOut } = parse.data;

    if (checkIn >= checkOut) {
      return NextResponse.json(
        { success: false, code: "INVALID_DATE_RANGE", message: "checkOut must be after checkIn" },
        { status: 400 }
      );
    }

    const booking = await createHomestayBooking(parse.data);

    return NextResponse.json({
      success: true,
      bookingId: booking.bookingId,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      nights: booking.nightlyBreakdown.length,
      nightlyBreakdown: booking.nightlyBreakdown,
      totalAmount: booking.totalAmount,
      currency: booking.currency,
      guestName: booking.guestName,
      guestEmail: booking.guestEmail,
      status: booking.status,
      expiresAt: booking.expiresAt,
      payment: booking.payment,
    });
  } catch (error: unknown) {
    console.error("[POST /api/bookings]", error);

    if (error instanceof Error) {
      if (error.message === "DATES_UNAVAILABLE" || (error as { code?: string }).code === "DATES_UNAVAILABLE") {
        return NextResponse.json(
          {
            success: false,
            code: "DATES_UNAVAILABLE",
            message: "The selected dates are no longer available. Please select different dates.",
          },
          { status: 409 }
        );
      }

      if (error.message === "PRICE_NOT_CONFIGURED") {
        return NextResponse.json(
          {
            success: false,
            code: "PRICE_NOT_CONFIGURED",
            message: "Pricing is not configured for one or more of the requested nights.",
            missingDates: (error as { missingDates?: string[] }).missingDates ?? [],
          },
          { status: 422 }
        );
      }
    }

    return NextResponse.json(
      { success: false, code: "INTERNAL_SERVER_ERROR", message: "Failed to create booking" },
      { status: 500 }
    );
  }
}
