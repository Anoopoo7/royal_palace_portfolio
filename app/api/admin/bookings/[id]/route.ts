import { NextResponse } from "next/server";
import { verifyAdminAuth } from "@/lib/booking/admin-auth";
import { getAdminBookingDetail } from "@/lib/booking/booking-service";

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await props.params;
    const detail = await getAdminBookingDetail(id);

    if (!detail.booking) {
      return NextResponse.json({ success: false, message: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      booking: detail.booking,
      auditLogs: detail.auditLogs,
    });
  } catch (error) {
    console.error("[GET /api/admin/bookings/[id]]", error);
    return NextResponse.json({ success: false, message: "Internal error" }, { status: 500 });
  }
}
