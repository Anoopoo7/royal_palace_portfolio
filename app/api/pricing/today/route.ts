/**
 * GET /api/pricing/today
 *
 * Returns today's villa nightly rate from MongoDB dailyRates collection.
 * No caching — prices change day to day.
 */
import { NextResponse } from "next/server";
import { getRatesForDates } from "@/lib/booking/pricing-service";
import { todayDateStr } from "@/lib/booking/dates";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const today = todayDateStr();
    const ratesMap = await getRatesForDates([today]);
    const rate = ratesMap.get(today);

    return NextResponse.json(
      {
        success: true,
        date: today,
        price: rate?.price ?? null,
        currency: "INR",
        available: !!rate,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("[GET /api/pricing/today]", error);
    return NextResponse.json(
      { success: false, price: null, currency: "INR" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
