import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyAdminAuth } from "@/lib/booking/admin-auth";
import { cancelBooking, getBookingById } from "@/lib/booking/booking-service";

const CancelSchema = z.object({
  reason: z.string().max(500).optional(),
});

export async function POST(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await props.params;
    const booking = await getBookingById(id);

    if (!booking) {
      return NextResponse.json({ success: false, message: "Booking not found" }, { status: 404 });
    }

    if (booking.status === "cancelled") {
      return NextResponse.json(
        { success: false, message: "Booking is already cancelled" },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const parse = CancelSchema.safeParse(body);
    const reason = parse.success ? parse.data.reason : undefined;

    const cancelled = await cancelBooking(id, reason, "admin");

    if (!cancelled) {
      return NextResponse.json(
        { success: false, message: "Failed to cancel booking" },
        { status: 500 }
      );
    }

    const updated = await getBookingById(id);

    return NextResponse.json({
      success: true,
      message: "Booking successfully cancelled",
      booking: updated,
    });
  } catch (error) {
    console.error("[POST /api/admin/bookings/[id]/cancel]", error);
    return NextResponse.json({ success: false, message: "Internal error" }, { status: 500 });
  }
}
