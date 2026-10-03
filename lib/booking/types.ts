/**
 * Royal Palace — Booking System Types
 * All dates are YYYY-MM-DD calendar strings (no timestamps, no UTC drift).
 */

// ─── MongoDB Document Types ──────────────────────────────────────────────────

export interface DailyRate {
  date: string; // YYYY-MM-DD
  price: number; // INR
  currency: "INR";
  createdAt: string;
  updatedAt: string;
}

export type BookingStatus =
  | "pending"
  | "pending_payment"
  | "confirmed"
  | "cancelled"
  | "expired";

export type PaymentMethod = "advance" | "full" | "pay_later";
export type PaymentProvider = "razorpay" | "offline";

export type PaymentStatus =
  | "pending"
  | "authorized"
  | "captured"
  | "partially_paid"
  | "paid"
  | "pay_at_property"
  | "failed"
  | "refunded"
  | "partially_refunded";

export interface RefundRecord {
  razorpayRefundId: string;
  amount: number; // INR
  amountPaise: number;
  currency: "INR";
  status: "pending" | "processed" | "failed";
  reason?: string;
  initiatedAt: string;
  processedAt?: string;
}

export interface PaymentDetails {
  method: PaymentMethod;
  provider: PaymentProvider;
  status: PaymentStatus;
  totalAmount: number;
  requiredAmount: number;
  paidAmount: number;
  remainingAmount: number;
  refundedAmount?: number;
  currency: "INR";
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  refunds?: RefundRecord[];
  lastPaymentAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  bookingId: string;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  numberOfGuests: number;
  specialRequests?: string;
  nightlyBreakdown: NightlyRate[];
  totalAmount: number;
  currency: "INR";
  status: BookingStatus;
  expiresAt?: string; // ISO string for temporary payment reservation hold
  payment?: PaymentDetails;
  createdAt: string;
  updatedAt: string;
}

export interface BookingAuditLog {
  action:
    | "BOOKING_CREATED"
    | "BOOKING_CONFIRMED"
    | "BOOKING_CANCELLED"
    | "PAYMENT_INITIATED"
    | "PAYMENT_CAPTURED"
    | "PAYMENT_FAILED"
    | "PAYMENT_STATUS_UPDATED"
    | "REFUND_INITIATED"
    | "REFUND_PROCESSED"
    | "REFUND_FAILED";
  bookingId: string;
  adminUserId?: string;
  amount?: number;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpayRefundId?: string;
  reason?: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

export interface NightlyRate {
  date: string; // YYYY-MM-DD
  price: number;
}

// ─── Availability Types ───────────────────────────────────────────────────────

export interface AvailabilityDay {
  date: string; // YYYY-MM-DD
  price: number | null; // null = no price configured
  available: boolean; // false = booked
  isPast: boolean;
}

export interface AvailabilityResponse {
  success: true;
  currency: "INR";
  from: string;
  to: string;
  days: AvailabilityDay[];
}

// ─── Request / Response Types ─────────────────────────────────────────────────

export interface AvailabilityCheckRequest {
  checkIn: string;
  checkOut: string;
}

export type AvailabilityCheckResponse =
  | {
      success: true;
      available: true;
      checkIn: string;
      checkOut: string;
      nights: number;
      nightlyBreakdown: NightlyRate[];
      totalAmount: number;
      currency: "INR";
    }
  | {
      success: true;
      available: false;
      code: "DATES_UNAVAILABLE";
      checkIn: string;
      checkOut: string;
    }
  | {
      success: false;
      code: "PRICE_NOT_CONFIGURED";
      missingDates: string[];
      checkIn: string;
      checkOut: string;
    };

export interface BookingRequest {
  checkIn: string;
  checkOut: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  numberOfGuests: number;
  specialRequests?: string;
}

export interface BookingResponse {
  success: true;
  bookingId: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  nightlyBreakdown: NightlyRate[];
  totalAmount: number;
  currency: "INR";
  guestName: string;
  guestEmail: string;
  status: BookingStatus;
}

// ─── Admin Types ──────────────────────────────────────────────────────────────

export interface AdminDayView {
  date: string;
  price: number | null;
  status: "available" | "booked" | "no_price";
  bookingId?: string;
}

export interface BulkPricingRequest {
  from: string;
  to: string;
  price: number;
}

// ─── API Error Codes ─────────────────────────────────────────────────────────

export type ApiErrorCode =
  | "INVALID_DATE_RANGE"
  | "DATES_UNAVAILABLE"
  | "PRICE_NOT_CONFIGURED"
  | "INTERNAL_SERVER_ERROR"
  | "BOOKING_NOT_FOUND"
  | "VALIDATION_ERROR";

export interface ApiErrorResponse {
  success: false;
  code: ApiErrorCode;
  message: string;
}
