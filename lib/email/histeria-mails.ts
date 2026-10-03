/**
 * Histeria Mails API Client
 *
 * Handles sending emails using Histeria Mails API endpoint:
 * POST https://histeriamails.vercel.app/api/proxy/v1/emails/send
 * Headers:
 *   - Content-Type: application/json
 *   - x-api-key: process.env.HISTERIA_MAILS_API_KEY
 */

import { formatDisplayDate, countNights } from "@/lib/booking/dates";
import type { Booking } from "@/lib/booking/types";

/**
 * Sends a 4-digit authorization OTP code via Histeria Mails API
 */
export async function sendAuthorizationCode(toEmail: string, code: string): Promise<boolean> {
  const apiKey = process.env.HISTERIA_MAILS_API_KEY;
  if (!apiKey) {
    console.error("[sendAuthorizationCode] Missing HISTERIA_MAILS_API_KEY in environment variables.");
    throw new Error("Email service API key is not configured.");
  }

  const payload = {
    templateId: "rph-order-autherization-code",
    to: toEmail.trim().toLowerCase(),
    data: {
      code: String(code),
    },
  };

  try {
    const response = await fetch("https://histeriamails.vercel.app/api/proxy/v1/emails/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      console.error(`[sendAuthorizationCode] API returned HTTP ${response.status}: ${errorText}`);
      throw new Error(`Failed to send email verification code (${response.status})`);
    }

    return true;
  } catch (error) {
    console.error("[sendAuthorizationCode] Failed to dispatch email:", error);
    throw error;
  }
}

/**
 * Sends an order confirmation email to the guest once a booking is confirmed.
 */
export async function sendOrderConfirmationEmail(booking: Booking): Promise<boolean> {
  const apiKey = process.env.HISTERIA_MAILS_API_KEY;
  if (!apiKey) {
    console.warn("[sendOrderConfirmationEmail] Missing HISTERIA_MAILS_API_KEY, skipping email.");
    return false;
  }

  const nights = countNights(booking.checkIn, booking.checkOut);
  const paidAmount = booking.payment?.paidAmount ?? 0;
  const remainingAmount =
    booking.payment?.remainingAmount ??
    (booking.payment?.method === "pay_later" ? booking.totalAmount : 0);

  let paymentMethodLabel = "Pay at Property";
  if (booking.payment?.method === "advance") {
    paymentMethodLabel = "50% Advance";
  } else if (booking.payment?.method === "full") {
    paymentMethodLabel = "Pay in Full (100%)";
  }

  const payload = {
    templateId: "rph-order-created",
    to: booking.guestEmail.trim().toLowerCase(),
    data: {
      user: booking.guestName.trim(),
      booking_id: booking.bookingId,
      check_in: formatDisplayDate(booking.checkIn),
      check_out: formatDisplayDate(booking.checkOut),
      guests: booking.numberOfGuests,
      nights: nights,
      total: booking.totalAmount.toLocaleString("en-IN"),
      paid: paidAmount.toLocaleString("en-IN"),
      balance: remainingAmount.toLocaleString("en-IN"),
      payment_method: paymentMethodLabel,
    },
  };

  try {
    const response = await fetch("https://histeriamails.vercel.app/api/proxy/v1/emails/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      console.error(`[sendOrderConfirmationEmail] API returned HTTP ${response.status}: ${errorText}`);
      return false;
    }

    console.log(`[sendOrderConfirmationEmail] Successfully sent confirmation email for ${booking.bookingId} to ${booking.guestEmail}`);
    return true;
  } catch (error) {
    console.error("[sendOrderConfirmationEmail] Failed to dispatch order email:", error);
    return false;
  }
}
