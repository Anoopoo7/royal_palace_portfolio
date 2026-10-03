/**
 * Admin Pricing API
 *
 * GET  /api/admin/pricing?from=YYYY-MM-DD&to=YYYY-MM-DD
 *   → Returns 90-day pricing view with booking status.
 *
 * POST /api/admin/pricing
 *   → { date: "YYYY-MM-DD", price: 15000 } — upsert single rate.
 *
 * SECURITY NOTE:
 * This route is protected by ADMIN_SECRET_KEY env var.
 * Pass it as: Authorization: Bearer <ADMIN_SECRET_KEY>
 * In production, replace with your auth system (NextAuth, Clerk, etc).
 */
import { NextResponse } from "next/server";
import { z } from "zod";
import { getRatesForRange, setDailyRate } from "@/lib/booking/pricing-service";
import { getOverlappingBookings } from "@/lib/booking/booking-service";
import { todayDateStr, addDaysToDateStr, dateRange, isValidDateStr } from "@/lib/booking/dates";
import { verifyAdminAuth } from "@/lib/booking/admin-auth";
import type { AdminDayView } from "@/lib/booking/types";

const SingleRateSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  price: z.number().positive().int(),
});

export async function GET(request: Request) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const today = todayDateStr();
    const from = searchParams.get("from") ?? today;
    const to = searchParams.get("to") ?? addDaysToDateStr(today, 89);

    if (!isValidDateStr(from) || !isValidDateStr(to) || from > to) {
      return NextResponse.json(
        { success: false, message: "Invalid date range" },
        { status: 400 }
      );
    }

    const [rates, bookings] = await Promise.all([
      getRatesForRange(from, to),
      getOverlappingBookings(from, to),
    ]);

    const ratesMap = new Map(rates.map((r) => [r.date, r]));

    // Build a map of date → bookingId for booked nights
    const bookedNights = new Map<string, string>();
    for (const booking of bookings) {
      const dates = dateRange(booking.checkIn, addDaysToDateStr(booking.checkOut, -1));
      for (const d of dates) bookedNights.set(d, "booked");
    }

    const allDates = dateRange(from, to);
    const days: AdminDayView[] = allDates.map((date) => {
      const rate = ratesMap.get(date);
      const booked = bookedNights.has(date);
      return {
        date,
        price: rate?.price ?? null,
        status: booked ? "booked" : rate ? "available" : "no_price",
      };
    });

    return NextResponse.json({ success: true, from, to, days, currency: "INR" });
  } catch (error) {
    console.error("[GET /api/admin/pricing]", error);
    return NextResponse.json({ success: false, message: "Internal error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const parse = SingleRateSchema.safeParse(body);
    if (!parse.success) {
      return NextResponse.json(
        { success: false, message: "Validation failed", details: parse.error.flatten() },
        { status: 400 }
      );
    }

    const rate = await setDailyRate(parse.data.date, parse.data.price);
    return NextResponse.json({ success: true, rate });
  } catch (error) {
    console.error("[POST /api/admin/pricing]", error);
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
