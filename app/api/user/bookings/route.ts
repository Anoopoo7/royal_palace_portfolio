import { NextResponse } from "next/server";
import { verifyUserSessionToken, getUserBookingsByEmail } from "@/lib/auth/user-auth-service";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    let token = "";

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7).trim();
    }

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Missing authentication token." },
        { status: 401 }
      );
    }

    const email = verifyUserSessionToken(token);
    if (!email) {
      return NextResponse.json(
        { success: false, message: "Session expired or invalid token. Please log in again." },
        { status: 401 }
      );
    }

    const bookings = await getUserBookingsByEmail(email);

    return NextResponse.json({
      success: true,
      email,
      bookings,
      count: bookings.length,
    });
  } catch (error: any) {
    console.error("[GET /api/user/bookings]", error);
    const message = error instanceof Error ? error.message : "Failed to fetch bookings.";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
