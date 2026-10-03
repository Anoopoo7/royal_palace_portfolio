import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyEmailOtp } from "@/lib/auth/user-auth-service";

const VerifyOtpSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  code: z.string().min(4, "Authorization code must be 4 digits."),
});

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const parse = VerifyOtpSchema.safeParse(body);

    if (!parse.success) {
      const errorMsg = parse.error.issues[0]?.message || "Invalid input payload.";
      return NextResponse.json({ success: false, message: errorMsg }, { status: 400 });
    }

    const { email, code } = parse.data;
    const result = await verifyEmailOtp(email, code);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message || "Invalid authorization code." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      token: result.token,
      email: result.email,
    });
  } catch (error: any) {
    console.error("[POST /api/auth/verify-otp]", error);
    const message = error instanceof Error ? error.message : "Failed to verify code.";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
