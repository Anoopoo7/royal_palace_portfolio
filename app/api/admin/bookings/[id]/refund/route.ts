import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyAdminAuth } from "@/lib/booking/admin-auth";
import { getBookingById, recordBookingRefund } from "@/lib/booking/booking-service";
import { createRazorpayRefund } from "@/lib/booking/razorpay-server";
import { rupeesToPaise } from "@/lib/booking/money";

const RefundSchema = z.object({
  amount: z.number().positive("Refund amount must be positive"),
  reason: z.string().max(500).optional(),
});

export async function POST(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await props.params;
    const booking = await getBookingById(id);

    if (!booking) {
      return NextResponse.json({ success: false, message: "Booking not found" }, { status: 404 });
    }

    const paidAmount = booking.payment?.paidAmount ?? 0;
    const existingRefunds = booking.payment?.refunds ?? [];
    const totalRefunded = existingRefunds
      .filter((r) => r.status !== "failed")
      .reduce((sum, r) => sum + r.amount, 0);

    const maxRefundable = paidAmount - totalRefunded;

    if (maxRefundable <= 0 || paidAmount <= 0) {
      return NextResponse.json(
        { success: false, message: "No refundable amount available on this booking." },
        { status: 400 }
      );
    }

    const paymentId = booking.payment?.razorpayPaymentId;
    if (!paymentId) {
      return NextResponse.json(
        {
          success: false,
          message: "No Razorpay payment ID associated with this booking to refund.",
        },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const parse = RefundSchema.safeParse(body);

    if (!parse.success) {
      return NextResponse.json(
        { success: false, message: "Validation error", errors: parse.error.flatten() },
        { status: 400 }
      );
    }

    const { amount, reason } = parse.data;

    // Validate amount strictly
    if (amount > maxRefundable) {
      return NextResponse.json(
        {
          success: false,
          message: `Refund amount (₹${amount}) cannot exceed maximum refundable amount (₹${maxRefundable}).`,
        },
        { status: 400 }
      );
    }

    const amountPaise = rupeesToPaise(amount);

    // Call Razorpay Refund API
    let razorpayRefundResponse: any;
    try {
      razorpayRefundResponse = await createRazorpayRefund(paymentId, {
        amountPaise,
        notes: {
          bookingId: booking.bookingId,
          reason: reason || "Admin initiated refund",
        },
      });
    } catch (razorpayErr: any) {
      console.error("[Razorpay Refund Error]", razorpayErr);
      const errMessage =
        razorpayErr?.error?.description || razorpayErr?.message || "Razorpay refund request failed";
      return NextResponse.json(
        { success: false, message: `Razorpay Error: ${errMessage}` },
        { status: 502 }
      );
    }

    // Only update MongoDB after Razorpay creates/accepts the refund
    const refundId = razorpayRefundResponse.id;
    const refundStatus = razorpayRefundResponse.status === "failed" ? "failed" : "processed";

    const recordResult = await recordBookingRefund({
      bookingId: booking.bookingId,
      razorpayRefundId: refundId,
      amount,
      amountPaise,
      reason,
      adminUserId: "admin",
      status: refundStatus,
    });

    if (!recordResult.success) {
      return NextResponse.json(
        { success: false, message: recordResult.error || "Failed to save refund record" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Refund of ₹${amount.toLocaleString("en-IN")} successfully processed.`,
      refundId,
      booking: recordResult.booking,
    });
  } catch (error) {
    console.error("[POST /api/admin/bookings/[id]/refund]", error);
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
