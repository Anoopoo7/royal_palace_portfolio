/**
 * GET /api/bookings/[id]
 *
 * Fetch a booking by its bookingId (e.g. RP-884920).
 * Returns booking details for the confirmation page.
 * Does NOT expose sensitive admin-only fields.
 */
import { NextResponse } from "next/server";
import { getBookingById } from "@/lib/booking/booking-service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || !/^RP-\d{6}$/.test(id)) {
      return NextResponse.json(
        { success: false, code: "BOOKING_NOT_FOUND", message: "Invalid booking ID format" },
        { status: 404 }
      );
    }

    const booking = await getBookingById(id);

    if (!booking) {
      return NextResponse.json(
        { success: false, code: "BOOKING_NOT_FOUND", message: "Booking not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      booking: {
        bookingId: booking.bookingId,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        nights: booking.nightlyBreakdown.length,
        nightlyBreakdown: booking.nightlyBreakdown,
        totalAmount: booking.totalAmount,
        currency: booking.currency,
        guestName: booking.guestName,
        guestEmail: booking.guestEmail,
        guestPhone: booking.guestPhone,
        numberOfGuests: booking.numberOfGuests,
        specialRequests: booking.specialRequests,
        status: booking.status,
        payment: booking.payment
          ? {
              method: booking.payment.method,
              provider: booking.payment.provider,
              status: booking.payment.status,
              totalAmount: booking.payment.totalAmount,
              requiredAmount: booking.payment.requiredAmount,
              paidAmount: booking.payment.paidAmount,
              remainingAmount: booking.payment.remainingAmount,
              currency: booking.payment.currency,
              razorpayPaymentId: booking.payment.razorpayPaymentId,
            }
          : undefined,
        createdAt: booking.createdAt,
      },
    });
  } catch (error) {
    console.error("[GET /api/bookings/[id]]", error);
    return NextResponse.json(
      { success: false, code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch booking" },
      { status: 500 }
    );
  }
}
