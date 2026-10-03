/**
 * POST /api/admin/pricing/bulk
 *
 * Bulk set pricing for a date range.
 * Body: { from: "YYYY-MM-DD", to: "YYYY-MM-DD", price: 15000 }
 */
import { NextResponse } from "next/server";
import { z } from "zod";
import { bulkSetDailyRates } from "@/lib/booking/pricing-service";

function isAuthorized(request: Request): boolean {
  const secret = process.env.ADMIN_SECRET_KEY;
  if (!secret) return true;
  const auth = request.headers.get("authorization") ?? "";
  return auth === `Bearer ${secret}`;
}

const BulkSchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "from must be YYYY-MM-DD"),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "to must be YYYY-MM-DD"),
  price: z.number().positive("Price must be positive").int("Price must be a whole number"),
});

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const parse = BulkSchema.safeParse(body);

    if (!parse.success) {
      return NextResponse.json(
        { success: false, message: "Validation failed", details: parse.error.flatten() },
        { status: 400 }
      );
    }

    const { from, to, price } = parse.data;

    if (from > to) {
      return NextResponse.json(
        { success: false, message: "from must be before or equal to to" },
        { status: 400 }
      );
    }

    const result = await bulkSetDailyRates(from, to, price);

    return NextResponse.json({
      success: true,
      updated: result.updated,
      from,
      to,
      price,
      currency: "INR",
    });
  } catch (error) {
    console.error("[POST /api/admin/pricing/bulk]", error);
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
