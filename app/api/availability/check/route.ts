/**
 * POST /api/availability/check
 *
 * Checks if the homestay is available for specific dates and returns pricing.
 * Used by the booking flow before submitting.
 */
import { NextResponse } from "next/server";
import { z } from "zod";
import { isHomestayAvailable } from "@/lib/booking/booking-service";
import { getRatesForDates } from "@/lib/booking/pricing-service";
import { countNights, getOccupiedNights } from "@/lib/booking/dates";
import type { AvailabilityCheckResponse } from "@/lib/booking/types";

const CheckSchema = z.object({
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "checkIn must be YYYY-MM-DD"),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "checkOut must be YYYY-MM-DD"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const parse = CheckSchema.safeParse(body);

    if (!parse.success) {
      return NextResponse.json(
        { success: false, code: "INVALID_DATE_RANGE", message: parse.error.flatten() },
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

    const nights = countNights(checkIn, checkOut);
    if (nights < 1) {
      return NextResponse.json(
        { success: false, code: "INVALID_DATE_RANGE", message: "Minimum 1 night stay" },
        { status: 400 }
      );
    }

    const occupiedNights = getOccupiedNights(checkIn, checkOut);

    // Fetch prices
    const ratesMap = await getRatesForDates(occupiedNights);

    // Check for missing prices
    const missingDates = occupiedNights.filter((d) => !ratesMap.has(d));
    if (missingDates.length > 0) {
      const resp: AvailabilityCheckResponse = {
        success: false,
        code: "PRICE_NOT_CONFIGURED",
        missingDates,
        checkIn,
        checkOut,
      };
      return NextResponse.json(resp, { status: 422 });
    }

    // Check availability
    const available = await isHomestayAvailable(checkIn, checkOut);

    if (!available) {
      const resp: AvailabilityCheckResponse = {
        success: true,
        available: false,
        code: "DATES_UNAVAILABLE",
        checkIn,
        checkOut,
      };
      return NextResponse.json(resp);
    }

    // Build response
    const nightlyBreakdown = occupiedNights.map((d) => ({
      date: d,
      price: ratesMap.get(d)!.price,
    }));
    const totalAmount = nightlyBreakdown.reduce((s, n) => s + n.price, 0);

    const resp: AvailabilityCheckResponse = {
      success: true,
      available: true,
      checkIn,
      checkOut,
      nights,
      nightlyBreakdown,
      totalAmount,
      currency: "INR",
    };

    return NextResponse.json(resp);
  } catch (error) {
    console.error("[POST /api/availability/check]", error);
    return NextResponse.json(
      { success: false, code: "INTERNAL_SERVER_ERROR", message: "Failed to check availability" },
      { status: 500 }
    );
  }
}
