import "server-only";
import type { PaymentMethod } from "./types";

export interface PublicPaymentConfig {
  enabled: boolean;
  provider: "razorpay";
  currency: "INR";
  methods: PaymentMethod[];
  keyId?: string;
  holdMinutes: number;
}

export interface ServerPaymentConfig {
  paymentsEnabled: boolean;
  keyId: string;
  keySecret: string;
  webhookSecret: string;
  configuredMethods: PaymentMethod[];
  effectiveMethods: PaymentMethod[];
  holdMinutes: number;
  isValid: boolean;
  configError?: string;
}

/**
 * Parses and returns the server-side payment configuration from environment variables.
 */
export function getServerPaymentConfig(): ServerPaymentConfig {
  const envEnabled = process.env.PAYMENTS_ENABLED?.toLowerCase() === "true";
  const keyId = process.env.RAZORPAY_KEY_ID?.trim() || "";
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim() || "";
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET?.trim() || "";
  const rawMethods = process.env.PAYMENT_METHODS?.trim() || "advance,full,pay_later";
  const holdMinutesRaw = Number(process.env.PAYMENT_HOLD_MINUTES) || 15;
  const holdMinutes = holdMinutesRaw > 0 ? holdMinutesRaw : 15;

  // Parse comma-separated payment methods
  const validMethods: PaymentMethod[] = ["advance", "full", "pay_later"];
  const parsedMethods = rawMethods
    .split(",")
    .map((m) => m.trim().toLowerCase())
    .filter((m): m is PaymentMethod => validMethods.includes(m as PaymentMethod));

  const configuredMethods = parsedMethods.length > 0 ? parsedMethods : validMethods;

  // Configuration validation
  let isValid = true;
  let configError: string | undefined;

  if (envEnabled) {
    if (!keyId || !keySecret) {
      isValid = false;
      configError = "PAYMENTS_ENABLED is true, but RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is missing.";
      console.warn(`[PaymentConfig] ${configError}`);
    }
  }

  // If payments are disabled or keys are missing, filter out online methods (advance, full)
  // unless pay_later is configured
  let effectiveMethods: PaymentMethod[];
  if (!envEnabled || !isValid) {
    // Online payments disabled — only allow pay_later if user configured it
    effectiveMethods = configuredMethods.filter((m) => m === "pay_later");
  } else {
    effectiveMethods = configuredMethods;
  }

  return {
    paymentsEnabled: envEnabled && isValid,
    keyId,
    keySecret,
    webhookSecret,
    configuredMethods,
    effectiveMethods,
    holdMinutes,
    isValid,
    configError,
  };
}

/**
 * Returns safe payment config to be sent to the frontend client.
 * NEVER exposes RAZORPAY_KEY_SECRET or RAZORPAY_WEBHOOK_SECRET.
 */
export function getClientPaymentConfig(): PublicPaymentConfig {
  const config = getServerPaymentConfig();

  return {
    enabled: config.paymentsEnabled,
    provider: "razorpay",
    currency: "INR",
    methods: config.effectiveMethods,
    keyId: config.paymentsEnabled ? config.keyId : undefined,
    holdMinutes: config.holdMinutes,
  };
}
