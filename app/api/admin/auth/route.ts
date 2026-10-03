import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminToken } from "@/lib/booking/admin-auth";

const AuthSchema = z.object({
  secret: z.string().min(1, "Secret key is required"),
});

export async function POST(request: Request) {
  try {
    const configuredSecret = process.env.ADMIN_SECRET_KEY;

    // If no secret configured in environment (dev mode), generate token with a fallback key
    const secretToUse = configuredSecret || "dev-mode-secret";

    const body = await request.json().catch(() => ({}));
    const parse = AuthSchema.safeParse(body);

    if (!parse.success) {
      return NextResponse.json(
        { success: false, message: "Secret key is required" },
        { status: 400 }
      );
    }

    const { secret } = parse.data;

    if (configuredSecret && secret !== configuredSecret) {
      return NextResponse.json(
        { success: false, message: "Invalid admin secret key" },
        { status: 401 }
      );
    }

    // Generate 30-minute bearer token
    const tokenData = createAdminToken(secretToUse);

    return NextResponse.json({
      success: true,
      token: tokenData.token,
      expiresIn: tokenData.expiresIn, // seconds (1800)
      expiresAt: tokenData.expiresAt, // millisecond timestamp
    });
  } catch (error) {
    console.error("[POST /api/admin/auth]", error);
    return NextResponse.json(
      { success: false, message: "Authentication error" },
      { status: 500 }
    );
  }
}
