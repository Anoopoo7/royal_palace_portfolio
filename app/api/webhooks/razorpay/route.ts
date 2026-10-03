import { NextResponse } from "next/server";
import clientPromise, { isMongoConfigured } from "@/lib/db/mongodb";
import { verifyWebhookSignature } from "@/lib/booking/razorpay-server";
import { confirmBookingPayment, recordBookingRefund } from "@/lib/booking/booking-service";
import { paiseToRupees } from "@/lib/booking/money";
import { logBookingAudit } from "@/lib/booking/audit-service";

const DB_NAME = () => process.env.MONGODB_DB_NAME || "royal_palace_homestay_test";
const WEBHOOK_EVENTS_COLLECTION = "razorpayWebhookEvents";

async function isEventProcessed(eventId: string): Promise<boolean> {
  if (!isMongoConfigured || !clientPromise) return false;
  const db = (await clientPromise).db(DB_NAME());
  const existing = await db
    .collection(WEBHOOK_EVENTS_COLLECTION)
    .findOne({ eventId });
  return existing !== null;
}

async function markEventProcessed(eventId: string, eventType: string): Promise<void> {
  if (!isMongoConfigured || !clientPromise) return;
  const db = (await clientPromise).db(DB_NAME());
  await db.collection(WEBHOOK_EVENTS_COLLECTION).updateOne(
    { eventId },
    {
      $set: {
        eventId,
        eventType,
        processedAt: new Date().toISOString(),
      },
    },
    { upsert: true }
  );
}

export async function POST(request: Request) {
  try {
    const signature = request.headers.get("x-razorpay-signature");
    if (!signature) {
      return NextResponse.json(
        { success: false, message: "Missing x-razorpay-signature header" },
        { status: 400 }
      );
    }

    const rawBody = await request.text();

    // 1. Cryptographically verify webhook signature
    const isValid = verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      console.warn("[Webhook] Invalid signature received");
      return NextResponse.json(
        { success: false, message: "Invalid webhook signature" },
        { status: 400 }
      );
    }

    const payload = JSON.parse(rawBody);
    const eventId = payload.event_id || payload.id;
    const eventType = payload.event;

    // 2. Idempotency check: Ignore duplicate events
    if (eventId && (await isEventProcessed(eventId))) {
      return NextResponse.json({ success: true, message: "Event already processed (idempotent)" });
    }

    // 3. Process the event based on type
    switch (eventType) {
      case "payment.captured": {
        const payment = payload.payload?.payment?.entity;
        const notes = payment?.notes || {};
        const bookingId = notes.bookingId;
        const orderId = payment?.order_id;
        const paymentId = payment?.id;
        const amountPaise = payment?.amount;

        if (bookingId && orderId && paymentId && amountPaise) {
          const paidRupees = paiseToRupees(amountPaise);
          await confirmBookingPayment({
            bookingId,
            razorpayOrderId: orderId,
            razorpayPaymentId: paymentId,
            paidAmount: paidRupees,
          });
        }
        break;
      }

      case "payment.failed": {
        const payment = payload.payload?.payment?.entity;
        const notes = payment?.notes || {};
        const bookingId = notes.bookingId;
        if (bookingId) {
          await logBookingAudit({
            action: "PAYMENT_FAILED",
            bookingId,
            razorpayOrderId: payment?.order_id,
            razorpayPaymentId: payment?.id,
            reason: payment?.error_description || "Payment failed",
            metadata: {
              errorCode: payment?.error_code,
              errorSource: payment?.error_source,
            },
          });
        }
        break;
      }

      case "refund.processed": {
        const refund = payload.payload?.refund?.entity;
        const notes = refund?.notes || {};
        const bookingId = notes.bookingId;
        const refundId = refund?.id;
        const amountPaise = refund?.amount;

        if (bookingId && refundId && amountPaise) {
          const refundRupees = paiseToRupees(amountPaise);
          await recordBookingRefund({
            bookingId,
            razorpayRefundId: refundId,
            amount: refundRupees,
            amountPaise,
            reason: refund?.notes?.reason || "Refund processed via Razorpay",
            status: "processed",
          });
        }
        break;
      }

      default:
        // Other events ignored but acknowledged
        break;
    }

    // 4. Mark event as processed for idempotency
    if (eventId) {
      await markEventProcessed(eventId, eventType);
    }

    return NextResponse.json({ success: true, received: true });
  } catch (error) {
    console.error("[POST /api/webhooks/razorpay]", error);
    return NextResponse.json({ success: false, message: "Webhook handler error" }, { status: 500 });
  }
}
