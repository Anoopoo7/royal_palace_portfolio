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
  createdAt: string;
  updatedAt: string;
}

export type BookingStatus = "pending" | "confirmed" | "cancelled" | "expired";

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
