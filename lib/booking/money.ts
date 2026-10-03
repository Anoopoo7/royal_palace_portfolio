/**
 * Money Handling Utilities
 *
 * All Razorpay transactions and internal financial math are done in integer paise
 * to avoid floating-point inaccuracy. Display and storage are in INR rupees.
 */

export type PaymentMethod = "advance" | "full" | "pay_later";

/**
 * Converts INR Rupees to integer paise (1 INR = 100 paise).
 */
export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

/**
 * Converts integer paise to INR Rupees.
 */
export function paiseToRupees(paise: number): number {
  return Math.round(paise / 100);
}

/**
 * Calculates the required payment amount and remaining balance based on payment method.
 * Advance: 50% paid now, 50% at property.
 * Full: 100% paid now, 0 at property.
 * Pay Later: 0 paid now, 100% at property.
 *
 * Uses consistent Math.round on paise/rupees to ensure clean whole-rupee numbers.
 */
export function calculatePaymentBreakdown(
  totalRupees: number,
  method: PaymentMethod
): {
  requiredAmount: number;
  remainingAmount: number;
  requiredPaise: number;
} {
  const safeTotal = Math.max(0, Math.round(totalRupees));

  if (method === "advance") {
    // 50% advance rounded to whole rupee
    const required = Math.round(safeTotal * 0.5);
    const remaining = safeTotal - required;
    return {
      requiredAmount: required,
      remainingAmount: remaining,
      requiredPaise: rupeesToPaise(required),
    };
  }

  if (method === "full") {
    return {
      requiredAmount: safeTotal,
      remainingAmount: 0,
      requiredPaise: rupeesToPaise(safeTotal),
    };
  }

  // pay_later
  return {
    requiredAmount: 0,
    remainingAmount: safeTotal,
    requiredPaise: 0,
  };
}

/**
 * Format INR currency for display (e.g. ₹40,000).
 */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
}
