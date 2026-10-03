import { NextResponse } from "next/server";
import { z } from "zod";
import { requestEmailOtp } from "@/lib/auth/user-auth-service";

const SendOtpSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
});

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const parse = SendOtpSchema.safeParse(body);

    if (!parse.success) {
      const errorMsg = parse.error.issues[0]?.message || "Invalid email address.";
      return NextResponse.json({ success: false, message: errorMsg }, { status: 400 });
    }

    const { email } = parse.data;
    const result = await requestEmailOtp(email);

    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    console.error("[POST /api/auth/send-otp]", error);
    const message = error instanceof Error ? error.message : "Failed to send authorization code.";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
