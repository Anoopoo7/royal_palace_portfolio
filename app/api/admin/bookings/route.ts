import { NextResponse } from "next/server";
import { verifyAdminAuth } from "@/lib/booking/admin-auth";
import { getAdminBookings } from "@/lib/booking/booking-service";

export async function GET(request: Request) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;
    const bookingStatus = searchParams.get("bookingStatus") || undefined;
    const paymentStatus = searchParams.get("paymentStatus") || undefined;
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 20;
    const sortBy = (searchParams.get("sortBy") as any) || "createdAt";
    const sortOrder = (searchParams.get("sortOrder") as any) || "desc";

    const result = await getAdminBookings({
      search,
      bookingStatus,
      paymentStatus,
      page,
      limit,
      sortBy,
      sortOrder,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("[GET /api/admin/bookings]", error);
    return NextResponse.json({ success: false, message: "Internal error" }, { status: 500 });
  }
}
