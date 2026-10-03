import "server-only";
import crypto from "crypto";
import Razorpay from "razorpay";
import { getServerPaymentConfig } from "./payment-config";

let razorpayClient: Razorpay | null = null;

/**
 * Returns an authenticated Razorpay instance.
 */
export function getRazorpayClient(): Razorpay {
  const config = getServerPaymentConfig();
  if (!config.keyId || !config.keySecret) {
    throw new Error("Razorpay credentials (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET) are not configured.");
  }

  if (!razorpayClient) {
    razorpayClient = new Razorpay({
      key_id: config.keyId,
      key_secret: config.keySecret,
    });
  }

  return razorpayClient;
}

/**
 * Creates a server-side Razorpay order.
 * Amount MUST be in integer paise (e.g. 2000000 for ₹20,000).
 */
export async function createRazorpayOrder(params: {
  amountPaise: number;
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
}): Promise<{
  id: string;
  amount: number;
  currency: string;
  receipt?: string;
  status: string;
}> {
  const razorpay = getRazorpayClient();
  const order = await razorpay.orders.create({
    amount: params.amountPaise,
    currency: params.currency || "INR",
    receipt: params.receipt,
    notes: params.notes || {},
  });

  return {
    id: order.id,
    amount: typeof order.amount === "number" ? order.amount : Number(order.amount),
    currency: order.currency,
    receipt: order.receipt,
    status: order.status,
  };
}

/**
 * Cryptographically verifies Razorpay payment signature.
 * signature = HMAC-SHA256(order_id + "|" + payment_id, secret)
 */
export function verifyPaymentSignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  try {
    const config = getServerPaymentConfig();
    if (!config.keySecret) return false;

    const data = `${params.orderId}|${params.paymentId}`;
    const expected = crypto
      .createHmac("sha256", config.keySecret)
      .update(data)
      .digest("hex");

    const expectedBuf = Buffer.from(expected);
    const signatureBuf = Buffer.from(params.signature);

    if (expectedBuf.length !== signatureBuf.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuf, signatureBuf);
  } catch (error) {
    console.error("[verifyPaymentSignature] Error verifying signature:", error);
    return false;
  }
}

/**
 * Cryptographically verifies Razorpay webhook signature.
 * signature = HMAC-SHA256(rawBody, webhookSecret)
 */
export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  try {
    const config = getServerPaymentConfig();
    if (!config.webhookSecret) {
      console.warn("[verifyWebhookSignature] RAZORPAY_WEBHOOK_SECRET is not configured.");
      return false;
    }

    const expected = crypto
      .createHmac("sha256", config.webhookSecret)
      .update(rawBody)
      .digest("hex");

    const expectedBuf = Buffer.from(expected);
    const signatureBuf = Buffer.from(signature);

    if (expectedBuf.length !== signatureBuf.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuf, signatureBuf);
  } catch (error) {
    console.error("[verifyWebhookSignature] Error verifying webhook signature:", error);
    return false;
  }
}

/**
 * Fetches payment details from Razorpay API.
 */
export async function fetchRazorpayPayment(paymentId: string) {
  const razorpay = getRazorpayClient();
  return razorpay.payments.fetch(paymentId);
}

/**
 * Initiates a full or partial refund via Razorpay Refund API.
 * Amount is optional (if omitted or equals full paid amount, Razorpay issues full refund).
 */
export async function createRazorpayRefund(
  paymentId: string,
  options?: {
    amountPaise?: number;
    notes?: Record<string, string>;
    speed?: "normal" | "optimum";
  }
) {
  const razorpay = getRazorpayClient();
  const payload: Record<string, unknown> = {};

  if (options?.amountPaise && options.amountPaise > 0) {
    payload.amount = options.amountPaise;
  }
  if (options?.notes) {
    payload.notes = options.notes;
  }
  if (options?.speed) {
    payload.speed = options.speed;
  }

  return razorpay.payments.refund(paymentId, payload as any);
}
