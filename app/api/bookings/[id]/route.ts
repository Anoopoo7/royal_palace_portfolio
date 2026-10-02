import { NextResponse } from "next/server";
import { getReservationByReference } from "@/lib/db/booking-service";

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    if (!id) {
      return NextResponse.json({ error: "Booking reference required" }, { status: 400 });
    }

    const reservation = await getReservationByReference(id);
    if (!reservation) {
      return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      reservation,
    });
  } catch (error: unknown) {
    console.error("Fetch booking error:", error);
    return NextResponse.json({ error: "Failed to retrieve booking" }, { status: 500 });
  }
}
