"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Calendar,
  Users,
  CreditCard,
  RotateCcw,
  Ban,
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Loader2,
  Receipt,
  FileText,
  DollarSign,
  Info,
} from "lucide-react";
import { formatDisplayDate, formatINR } from "@/lib/booking/dates";
import type { Booking, BookingAuditLog, RefundRecord } from "@/lib/booking/types";

export default function AdminBookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params?.id as string;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [auditLogs, setAuditLogs] = useState<BookingAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cancellation modal
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  // Refund modal
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [refundAmount, setRefundAmount] = useState<string>("");
  const [refundReason, setRefundReason] = useState("");
  const [isRefunding, setIsRefunding] = useState(false);
  const [refundError, setRefundError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = typeof window !== "undefined" ? sessionStorage.getItem("rp_admin_token") : null;
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`/api/admin/bookings/${bookingId}`, { headers });
      if (res.status === 401) {
        router.push("/admin/bookings");
        return;
      }

      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Failed to load booking");

      setBooking(data.booking);
      setAuditLogs(data.auditLogs || []);

      // Default refund amount to max refundable
      const paid = data.booking?.payment?.paidAmount ?? 0;
      const refunded = (data.booking?.payment?.refunds ?? [])
        .filter((r: RefundRecord) => r.status !== "failed")
        .reduce((sum: number, r: RefundRecord) => sum + r.amount, 0);
      const maxRefund = Math.max(0, paid - refunded);
      setRefundAmount(String(maxRefund));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load booking");
    } finally {
      setLoading(false);
    }
  }, [bookingId, router]);

  useEffect(() => {
    if (bookingId) fetchDetail();
  }, [fetchDetail, bookingId]);

  const handleCancelBooking = async () => {
    setIsCancelling(true);
    setCancelError(null);
    try {
      const token = sessionStorage.getItem("rp_admin_token");
      const res = await fetch(`/api/admin/bookings/${bookingId}/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ reason: cancelReason.trim() || undefined }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Failed to cancel booking");

      setIsCancelModalOpen(false);
      fetchDetail();
    } catch (e) {
      setCancelError(e instanceof Error ? e.message : "Cancellation failed");
    } finally {
      setIsCancelling(false);
    }
  };

  const handleRefund = async () => {
    const amt = Number(refundAmount);
    if (!amt || isNaN(amt) || amt <= 0) {
      setRefundError("Please enter a valid refund amount.");
      return;
    }

    setIsRefunding(true);
    setRefundError(null);
    try {
      const token = sessionStorage.getItem("rp_admin_token");
      const res = await fetch(`/api/admin/bookings/${bookingId}/refund`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          amount: amt,
          reason: refundReason.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Refund failed");

      setIsRefundModalOpen(false);
      fetchDetail();
    } catch (e) {
      setRefundError(e instanceof Error ? e.message : "Refund failed");
    } finally {
      setIsRefunding(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-32 pb-24 min-h-screen bg-[#171513] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#B89A62] mr-2" />
        <span className="text-xs uppercase tracking-widest text-[#B89A62]">Loading booking details...</span>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="pt-32 pb-24 min-h-screen bg-[#171513] text-center max-w-md mx-auto space-y-4">
        <AlertTriangle className="w-8 h-8 text-red-400 mx-auto" />
        <h2 className="font-serif-editorial text-2xl text-[#F5F1E8]">Booking Not Found</h2>
        <p className="text-xs text-[#D8C7AD]/60">{error}</p>
        <Link href="/admin/bookings" className="text-xs text-[#B89A62] uppercase tracking-wider underline">
          ← Back to Bookings
        </Link>
      </div>
    );
  }

  const paidAmount = booking.payment?.paidAmount ?? 0;
  const existingRefunds = booking.payment?.refunds ?? [];
  const totalRefunded = existingRefunds
    .filter((r) => r.status !== "failed")
    .reduce((sum, r) => sum + r.amount, 0);
  const maxRefundable = Math.max(0, paidAmount - totalRefunded);

  return (
    <div className="pt-28 md:pt-32 pb-24 bg-[#171513] text-[#F5F1E8] min-h-screen">
      <div className="max-w-5xl mx-auto px-6 md:px-12 space-y-8">
        {/* Top Back link */}
        <div className="flex items-center justify-between">
          <Link
            href="/admin/bookings"
            className="inline-flex items-center gap-1.5 text-xs text-[#D8C7AD]/60 hover:text-[#B89A62] transition-colors uppercase tracking-wider"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Bookings
          </Link>

          <div className="flex items-center gap-3">
            {booking.status !== "cancelled" && (
              <button
                onClick={() => setIsCancelModalOpen(true)}
                className="px-3.5 py-1.5 bg-red-950/40 border border-red-800/40 text-red-300 hover:bg-red-900/60 transition-colors text-xs uppercase tracking-wider flex items-center gap-1.5"
              >
                <Ban className="w-3.5 h-3.5" />
                Cancel Booking
              </button>
            )}

            {paidAmount > 0 && maxRefundable > 0 && (
              <button
                onClick={() => setIsRefundModalOpen(true)}
                className="px-3.5 py-1.5 bg-[#B89A62] text-[#171513] hover:bg-[#D4B67E] transition-colors text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Issue Refund
              </button>
            )}
          </div>
        </div>

        {/* Booking Reference Hero */}
        <div className="bg-[#1C1A17] border border-[#B89A62]/20 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-widest text-[#D8C7AD]/60">Booking ID</span>
              <span className="font-mono text-lg text-[#B89A62] font-semibold">{booking.bookingId}</span>
            </div>
            <h1 className="font-serif-editorial text-2xl md:text-3xl text-[#F5F1E8] mt-1">
              {booking.guestName}
            </h1>
            <p className="text-xs text-[#D8C7AD]/60">
              Reserved on {formatDisplayDate(booking.createdAt.slice(0, 10))} • Royal Palace Home Stay
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 text-xs uppercase tracking-wider border ${
                booking.status === "confirmed"
                  ? "bg-green-950 text-green-300 border-green-800/40"
                  : booking.status === "pending_payment"
                  ? "bg-amber-950 text-amber-300 border-amber-800/40"
                  : "bg-red-950 text-red-300 border-red-800/40"
              }`}
            >
              {booking.status === "pending_payment" ? "Pending Payment" : booking.status}
            </span>

            <span className="px-3 py-1 text-xs uppercase tracking-wider bg-[#12100E] border border-[#B89A62]/20 text-[#B89A62]">
              {booking.payment?.status || "Unsettled"}
            </span>
          </div>
        </div>

        {/* 2-Column Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Column 1: Stay & Guest Details */}
          <div className="bg-[#1C1A17] border border-[#B89A62]/20 p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-[#B89A62]/10 pb-3">
              <Calendar className="w-4 h-4 text-[#B89A62]" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#F5F1E8]">
                Stay Details
              </h3>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-[#B89A62]/5">
                <span className="text-[#D8C7AD]/60">Check-in</span>
                <span className="text-[#F5F1E8] font-medium">{formatDisplayDate(booking.checkIn)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#B89A62]/5">
                <span className="text-[#D8C7AD]/60">Check-out</span>
                <span className="text-[#F5F1E8] font-medium">{formatDisplayDate(booking.checkOut)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#B89A62]/5">
                <span className="text-[#D8C7AD]/60">Total Nights</span>
                <span className="text-[#F5F1E8] font-medium">{booking.nightlyBreakdown.length} nights</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#B89A62]/5">
                <span className="text-[#D8C7AD]/60">Guests</span>
                <span className="text-[#F5F1E8] font-medium">{booking.numberOfGuests} Guests</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#B89A62]/5">
                <span className="text-[#D8C7AD]/60">Email</span>
                <span className="text-[#F5F1E8] font-medium">{booking.guestEmail}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#B89A62]/5">
                <span className="text-[#D8C7AD]/60">Phone</span>
                <span className="text-[#F5F1E8] font-medium">{booking.guestPhone}</span>
              </div>
              {booking.specialRequests && (
                <div className="py-1.5">
                  <span className="text-[#D8C7AD]/60 block mb-1">Special Requests</span>
                  <span className="text-[#F5F1E8] bg-[#12100E] p-2.5 block border border-[#B89A62]/10 text-[11px]">
                    {booking.specialRequests}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Column 2: Payment Breakdown */}
          <div className="bg-[#1C1A17] border border-[#B89A62]/20 p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-[#B89A62]/10 pb-3">
              <CreditCard className="w-4 h-4 text-[#B89A62]" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#F5F1E8]">
                Financial Summary
              </h3>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-[#B89A62]/5">
                <span className="text-[#D8C7AD]/60">Total Amount</span>
                <span className="text-lg font-serif-editorial text-[#B89A62]">
                  {formatINR(booking.totalAmount)}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#B89A62]/5">
                <span className="text-[#D8C7AD]/60">Payment Method</span>
                <span className="text-[#F5F1E8] uppercase tracking-wider text-[11px]">
                  {booking.payment?.method === "advance"
                    ? "50% Advance"
                    : booking.payment?.method === "full"
                    ? "Pay in Full"
                    : "Pay at Property"}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#B89A62]/5">
                <span className="text-[#D8C7AD]/60">Amount Paid</span>
                <span className="text-green-400 font-medium">
                  {formatINR(paidAmount)}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#B89A62]/5">
                <span className="text-[#D8C7AD]/60">Remaining Balance</span>
                <span className="text-[#D8C7AD] font-medium">
                  {formatINR(booking.payment?.remainingAmount ?? 0)}
                </span>
              </div>

              {totalRefunded > 0 && (
                <div className="flex justify-between py-1.5 border-b border-[#B89A62]/5 text-purple-300">
                  <span>Total Refunded</span>
                  <span className="font-medium">-{formatINR(totalRefunded)}</span>
                </div>
              )}

              {/* Razorpay transaction details */}
              {booking.payment?.razorpayPaymentId && (
                <div className="pt-2 text-[10px] space-y-1 text-[#D8C7AD]/50 font-mono">
                  <p>Order ID: {booking.payment.razorpayOrderId}</p>
                  <p>Payment ID: {booking.payment.razorpayPaymentId}</p>
                  {booking.payment.lastPaymentAt && (
                    <p>Paid At: {booking.payment.lastPaymentAt}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Refund History Table (if refunds exist) */}
        {existingRefunds.length > 0 && (
          <div className="bg-[#1C1A17] border border-[#B89A62]/20 p-6 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#F5F1E8]">
              Refund History
            </h3>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#B89A62]/10 text-[9px] uppercase tracking-wider text-[#D8C7AD]/50">
                  <th className="py-2 text-left">Refund ID</th>
                  <th className="py-2 text-left">Amount</th>
                  <th className="py-2 text-left">Status</th>
                  <th className="py-2 text-left">Reason</th>
                  <th className="py-2 text-right">Date</th>
                </tr>
              </thead>
              <tbody>
                {existingRefunds.map((r, i) => (
                  <tr key={i} className="border-b border-[#B89A62]/5">
                    <td className="py-2.5 font-mono text-[10px] text-[#B89A62]">{r.razorpayRefundId}</td>
                    <td className="py-2.5 text-purple-300 font-medium">{formatINR(r.amount)}</td>
                    <td className="py-2.5">
                      <span className="px-2 py-0.5 text-[9px] uppercase tracking-wider bg-purple-950 text-purple-300">
                        {r.status}
                      </span>
                    </td>
                    <td className="py-2.5 text-[#D8C7AD]/70">{r.reason || "—"}</td>
                    <td className="py-2.5 text-right text-[10px] text-[#D8C7AD]/50">
                      {r.initiatedAt.slice(0, 16).replace("T", " ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Audit Log Timeline */}
        <div className="bg-[#1C1A17] border border-[#B89A62]/20 p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#B89A62]/10 pb-3">
            <Clock className="w-4 h-4 text-[#B89A62]" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#F5F1E8]">
              Activity Timeline & Audit Trail
            </h3>
          </div>

          {auditLogs.length === 0 ? (
            <p className="text-xs text-[#D8C7AD]/50">No activity logs recorded yet.</p>
          ) : (
            <div className="space-y-4 pl-2 border-l border-[#B89A62]/20">
              {auditLogs.map((log, index) => (
                <div key={index} className="relative pl-6 space-y-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#B89A62] absolute -left-[18px] top-1.5" />
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#F5F1E8] uppercase tracking-wider">
                      {log.action.replace(/_/g, " ")}
                    </span>
                    <span className="text-[10px] text-[#D8C7AD]/40">
                      {log.timestamp.slice(0, 19).replace("T", " ")}
                    </span>
                  </div>
                  {log.amount && (
                    <p className="text-xs text-[#B89A62]">
                      Amount: {formatINR(log.amount)}
                    </p>
                  )}
                  {log.reason && (
                    <p className="text-xs text-[#D8C7AD]/70 italic">
                      &quot;{log.reason}&quot;
                    </p>
                  )}
                  {log.razorpayPaymentId && (
                    <p className="text-[10px] font-mono text-[#D8C7AD]/40">
                      Payment ID: {log.razorpayPaymentId}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cancellation Modal */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full bg-[#1C1A17] border border-red-500/40 p-6 space-y-5"
          >
            <div className="flex items-center gap-2 text-red-400">
              <Ban className="w-5 h-5" />
              <h3 className="font-serif-editorial text-xl text-[#F5F1E8]">Cancel Reservation</h3>
            </div>

            <p className="text-xs text-[#D8C7AD]/70 leading-relaxed">
              This will cancel the booking for <strong>{booking.guestName}</strong> ({formatDisplayDate(booking.checkIn)} → {formatDisplayDate(booking.checkOut)}).
              Payment received: <strong>{formatINR(paidAmount)}</strong>.
            </p>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-[#D8C7AD]/60 mb-1">
                Cancellation Reason (Optional)
              </label>
              <textarea
                rows={2}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Guest requested cancellation, date conflict..."
                className="w-full bg-[#12100E] border border-[#B89A62]/20 text-xs text-[#F5F1E8] p-2.5 focus:outline-none focus:border-[#B89A62]"
              />
            </div>

            {cancelError && (
              <div className="text-xs text-red-300 p-2.5 bg-red-950/40 border border-red-800/40">
                {cancelError}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setIsCancelModalOpen(false)}
                disabled={isCancelling}
                className="px-4 py-2 text-xs uppercase tracking-wider text-[#D8C7AD]/60 hover:text-[#F5F1E8]"
              >
                Go Back
              </button>
              <button
                onClick={handleCancelBooking}
                disabled={isCancelling}
                className="px-5 py-2 bg-red-800 text-white text-xs uppercase tracking-wider hover:bg-red-700 disabled:opacity-50 flex items-center gap-1.5"
              >
                {isCancelling && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Confirm Cancellation
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Refund Modal */}
      {isRefundModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full bg-[#1C1A17] border border-[#B89A62]/40 p-6 space-y-5"
          >
            <div className="flex items-center gap-2 text-[#B89A62]">
              <RotateCcw className="w-5 h-5" />
              <h3 className="font-serif-editorial text-xl text-[#F5F1E8]">Issue Razorpay Refund</h3>
            </div>

            <div className="p-3 bg-[#12100E] border border-[#B89A62]/20 space-y-1 text-xs">
              <div className="flex justify-between text-[#D8C7AD]/70">
                <span>Original Paid:</span>
                <span>{formatINR(paidAmount)}</span>
              </div>
              <div className="flex justify-between text-[#D8C7AD]/70">
                <span>Already Refunded:</span>
                <span>{formatINR(totalRefunded)}</span>
              </div>
              <div className="flex justify-between text-[#F5F1E8] font-medium pt-1 border-t border-[#B89A62]/10">
                <span>Maximum Refundable:</span>
                <span className="text-[#B89A62]">{formatINR(maxRefundable)}</span>
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-[#D8C7AD]/60 mb-1">
                Refund Amount (₹) *
              </label>
              <input
                type="number"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                max={maxRefundable}
                min={1}
                className="w-full bg-[#12100E] border border-[#B89A62]/20 text-xs text-[#F5F1E8] p-2.5 focus:outline-none focus:border-[#B89A62]"
              />
              <span className="text-[10px] text-[#D8C7AD]/40 mt-1 block">
                Enter full amount for 100% refund, or a lesser amount for partial refund.
              </span>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-[#D8C7AD]/60 mb-1">
                Reason for Refund (Optional)
              </label>
              <textarea
                rows={2}
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="Guest cancellation, weather dispute, partial concession..."
                className="w-full bg-[#12100E] border border-[#B89A62]/20 text-xs text-[#F5F1E8] p-2.5 focus:outline-none focus:border-[#B89A62]"
              />
            </div>

            {refundError && (
              <div className="text-xs text-red-300 p-2.5 bg-red-950/40 border border-red-800/40">
                {refundError}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setIsRefundModalOpen(false)}
                disabled={isRefunding}
                className="px-4 py-2 text-xs uppercase tracking-wider text-[#D8C7AD]/60 hover:text-[#F5F1E8]"
              >
                Cancel
              </button>
              <button
                onClick={handleRefund}
                disabled={isRefunding || !refundAmount}
                className="px-5 py-2 bg-[#B89A62] text-[#171513] font-semibold text-xs uppercase tracking-wider hover:bg-[#D4B67E] disabled:opacity-50 flex items-center gap-1.5"
              >
                {isRefunding && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Process Refund
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
