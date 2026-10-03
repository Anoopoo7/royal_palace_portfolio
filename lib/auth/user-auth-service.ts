import "server-only";
import crypto from "crypto";
import clientPromise, { isMongoConfigured } from "@/lib/db/mongodb";
import type { Collection, Db } from "mongodb";
import { sendAuthorizationCode } from "@/lib/email/histeria-mails";
import { getBookingsCollection } from "@/lib/booking/booking-service";
import type { Booking } from "@/lib/booking/types";

const DB_NAME = () => process.env.MONGODB_DB_NAME || "royal_palace_homestay_test";
const OTP_COLLECTION = "userOtps";
const USER_TOKEN_SECRET = process.env.ADMIN_SECRET_KEY || "royal_palace_user_session_secret_2026";

export interface UserOtpDoc {
  email: string;
  code: string;
  expiresAt: string;
  createdAt: string;
}

export async function getOtpsCollection(db?: Db): Promise<Collection<UserOtpDoc>> {
  if (!isMongoConfigured || !clientPromise) {
    throw new Error("MongoDB is not configured");
  }
  const targetDb = db ?? (await clientPromise).db(DB_NAME());
  return targetDb.collection<UserOtpDoc>(OTP_COLLECTION);
}

/**
 * Ensures indexes on userOtps collection.
 */
export async function ensureOtpIndexes(): Promise<void> {
  if (!isMongoConfigured || !clientPromise) return;
  try {
    const col = await getOtpsCollection();
    await col.createIndex({ email: 1 });
    await col.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  } catch {
    // Indexes already exist
  }
}

/**
 * Generates a random 4-digit code (e.g. "4829"), saves it in DB, and sends it via Histeria Mails.
 */
export async function requestEmailOtp(email: string): Promise<{ success: boolean; message: string }> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes("@")) {
    throw new Error("Please enter a valid email address.");
  }

  // Generate 4-digit numeric code
  const code = Math.floor(1000 + Math.random() * 9000).toString();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 10 * 60 * 1000).toISOString(); // 10 minutes

  const col = await getOtpsCollection();

  // Upsert code into MongoDB
  await col.updateOne(
    { email: cleanEmail },
    {
      $set: {
        email: cleanEmail,
        code,
        expiresAt,
        createdAt: now.toISOString(),
      },
    },
    { upsert: true }
  );

  // Send email via Histeria Mails API
  await sendAuthorizationCode(cleanEmail, code);

  return {
    success: true,
    message: `Authorization code sent to ${cleanEmail}`,
  };
}

/**
 * Verifies a 4-digit email OTP. If valid, deletes the OTP and generates a signed session token.
 */
export async function verifyEmailOtp(
  email: string,
  code: string
): Promise<{ success: boolean; token?: string; email?: string; message?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanCode = code.trim();

  if (!cleanEmail || !cleanCode) {
    return { success: false, message: "Email and authorization code are required." };
  }

  const col = await getOtpsCollection();
  const record = await col.findOne({ email: cleanEmail });

  if (!record) {
    return { success: false, message: "No authorization code requested for this email or it has expired." };
  }

  if (new Date(record.expiresAt).getTime() < Date.now()) {
    await col.deleteOne({ email: cleanEmail });
    return { success: false, message: "Authorization code has expired. Please request a new code." };
  }

  if (record.code !== cleanCode) {
    return { success: false, message: "Incorrect authorization code. Please check your email and try again." };
  }

  // Code is valid! Delete the used OTP
  await col.deleteOne({ email: cleanEmail });

  // Generate signed user session token
  const { token } = createUserSessionToken(cleanEmail);

  return {
    success: true,
    token,
    email: cleanEmail,
  };
}

/**
 * Generates a cryptographically signed user session token (valid 30 days).
 */
export function createUserSessionToken(email: string): { token: string; expiresAt: number } {
  const cleanEmail = email.toLowerCase().trim();
  const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
  const payload = `${cleanEmail}:${expiresAt}`;
  const hmac = crypto.createHmac("sha256", USER_TOKEN_SECRET).update(payload).digest("hex");
  const token = Buffer.from(`${payload}:${hmac}`).toString("base64url");
  return { token, expiresAt };
}

/**
 * Verifies a user session token and returns the email if valid.
 */
export function verifyUserSessionToken(token: string): string | null {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf-8");
    const parts = decoded.split(":");
    if (parts.length !== 3) return null;
    const [email, expiresAtStr, hmac] = parts;

    if (!email || !expiresAtStr || !hmac) return null;
    const expiresAt = Number(expiresAtStr);
    if (isNaN(expiresAt) || Date.now() > expiresAt) return null;

    const expectedHmac = crypto.createHmac("sha256", USER_TOKEN_SECRET).update(`${email}:${expiresAtStr}`).digest("hex");

    if (crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(expectedHmac))) {
      return email.toLowerCase();
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Retrieves all bookings matching the user's email from MongoDB.
 */
export async function getUserBookingsByEmail(email: string): Promise<Booking[]> {
  const col = await getBookingsCollection();
  const cleanEmail = email.toLowerCase().trim();

  return col
    .find({ guestEmail: cleanEmail })
    .sort({ createdAt: -1 })
    .toArray();
}
