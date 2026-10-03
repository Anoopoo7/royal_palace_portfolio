import "server-only";
import { formatDisplayDate, countNights } from "@/lib/booking/dates";
import type { Booking } from "@/lib/booking/types";

/**
 * Sends order creation payload to n8n webhook (https://royalpalace-n8n.work.gd/webhook/new-booking)
 * with Basic Authentication.
 */
export async function sendN8nOrderWebhook(booking: Booking): Promise<boolean> {
  const baseUrl = process.env.N8N_WEBHOOK_BASE_URL || "https://royalpalace-n8n.work.gd/webhook/";
  const username = process.env.N8N_WEBHOOK_USERNAME || "rp-n8n-workflow";
  const password = process.env.N8N_WEBHOOK_PASSWORD || "changeme";

  const cleanBaseUrl = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  const endpoint = `${cleanBaseUrl}new-booking`;

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
  };

  const authHeader = `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      console.error(`[sendN8nOrderWebhook] n8n API returned HTTP ${response.status}: ${errorText}`);
      return false;
    }

    console.log(`[sendN8nOrderWebhook] Successfully dispatched booking ${booking.bookingId} to n8n webhook (${endpoint})`);
    return true;
  } catch (error) {
    console.error("[sendN8nOrderWebhook] Error calling n8n webhook:", error);
    return false;
  }
}
