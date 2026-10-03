import { NextResponse } from "next/server";
import { getClientPaymentConfig } from "@/lib/booking/payment-config";

/**
 * GET /api/payments/config
 *
 * Returns safe payment configuration to the client.
 * Strictly NEVER exposes RAZORPAY_KEY_SECRET or RAZORPAY_WEBHOOK_SECRET.
 */
export async function GET() {
  try {
    const config = getClientPaymentConfig();
    return NextResponse.json(config);
  } catch (error) {
    console.error("[GET /api/payments/config]", error);
    return NextResponse.json(
      {
        enabled: false,
        provider: "razorpay",
        currency: "INR",
        methods: ["pay_later"],
        holdMinutes: 15,
      },
      { status: 200 }
    );
  }
}
