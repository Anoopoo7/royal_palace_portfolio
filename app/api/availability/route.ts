/**
 * GET /api/availability?from=YYYY-MM-DD&to=YYYY-MM-DD
 *
 * Returns a calendar-friendly array of days with price and availability.
 * Used by the availability calendar page.
 */
import { NextResponse } from "next/server";
import { z } from "zod";
import { getRatesForRange } from "@/lib/booking/pricing-service";
import { getOverlappingBookings } from "@/lib/booking/booking-service";
import { todayDateStr, dateRange, addDaysToDateStr } from "@/lib/booking/dates";
import type { AvailabilityDay, AvailabilityResponse } from "@/lib/booking/types";
import { ensurePricingIndexes } from "@/lib/booking/pricing-service";
import { ensureBookingIndexes } from "@/lib/booking/booking-service";

const QuerySchema = z.object({
  from: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "from must be YYYY-MM-DD")
    .optional(),
  to: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "to must be YYYY-MM-DD")
    .optional(),
});

export async function GET(request: Request) {
  try {
    await Promise.all([ensurePricingIndexes(), ensureBookingIndexes()]);

    const { searchParams } = new URL(request.url);
    const parse = QuerySchema.safeParse({
      from: searchParams.get("from") ?? undefined,
      to: searchParams.get("to") ?? undefined,
    });

    if (!parse.success) {
      return NextResponse.json(
        { success: false, code: "INVALID_DATE_RANGE", message: parse.error.flatten() },
        { status: 400 }
      );
    }

    const today = todayDateStr();
    const from = parse.data.from ?? today;
    const to = parse.data.to ?? addDaysToDateStr(today, 89); // 90 days by default

    if (from > to) {
      return NextResponse.json(
        { success: false, code: "INVALID_DATE_RANGE", message: "from must be <= to" },
        { status: 400 }
      );
    }

    // Limit range to 366 days to prevent abuse
    const allDates = dateRange(from, to);
    if (allDates.length > 366) {
      return NextResponse.json(
        { success: false, code: "INVALID_DATE_RANGE", message: "Range cannot exceed 366 days" },
        { status: 400 }
      );
    }

    // Fetch prices and bookings in parallel
    const [rates, bookings] = await Promise.all([
      getRatesForRange(from, to),
      getOverlappingBookings(from, to),
    ]);

    // Build a set of booked nights
    const bookedNights = new Set<string>();
    for (const booking of bookings) {
      // Each night from checkIn up to (not including) checkOut is booked
      const cur = new Date(
        Number(booking.checkIn.split("-")[0]),
        Number(booking.checkIn.split("-")[1]) - 1,
        Number(booking.checkIn.split("-")[2])
      );
      const end = new Date(
        Number(booking.checkOut.split("-")[0]),
        Number(booking.checkOut.split("-")[1]) - 1,
        Number(booking.checkOut.split("-")[2])
      );
      while (cur < end) {
        const ds = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, "0")}-${String(cur.getDate()).padStart(2, "0")}`;
        bookedNights.add(ds);
        cur.setDate(cur.getDate() + 1);
      }
    }

    // Build rates map
    const ratesMap = new Map(rates.map((r) => [r.date, r]));

    const days: AvailabilityDay[] = allDates.map((date) => {
      const rate = ratesMap.get(date);
      return {
        date,
        price: rate?.price ?? null,
        available: !bookedNights.has(date),
        isPast: date < today,
      };
    });

    const response: AvailabilityResponse = {
      success: true,
      currency: "INR",
      from,
      to,
      days,
    };

    return NextResponse.json(response, {
      headers: {
        // Cache for 60 seconds — availability changes rarely
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  } catch (error) {
    console.error("[GET /api/availability]", error);
    return NextResponse.json(
      { success: false, code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch availability" },
      { status: 500 }
    );
  }
}
