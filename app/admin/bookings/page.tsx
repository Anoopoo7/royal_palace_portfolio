"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Users,
  Search,
  Filter,
  RefreshCw,
  LogOut,
  Lock,
  Key,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  ChevronRight,
  Clock,
  ArrowUpDown,
  CreditCard,
} from "lucide-react";
import { formatDisplayDate, formatINR } from "@/lib/booking/dates";
import type { Booking, BookingStatus, PaymentStatus } from "@/lib/booking/types";
import CustomSelect from "@/components/ui/CustomSelect";

export default function AdminBookingsPage() {
  // Auth state
  const [adminToken, setAdminToken] = useState<string>("");
  const [keyInput, setKeyInput] = useState<string>("");
  const [keyError, setKeyError] = useState<string | null>(null);
  const [isVerifyingKey, setIsVerifyingKey] = useState(false);
  const [isUnauthorized, setIsUnauthorized] = useState(false);

  // Bookings list state
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [bookingStatusFilter, setBookingStatusFilter] = useState("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Load token from sessionStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = sessionStorage.getItem("rp_admin_token");
      const storedExp = sessionStorage.getItem("rp_admin_token_exp");
      if (storedToken && storedExp) {
        const expNum = Number(storedExp);
        if (Date.now() < expNum) {
          setAdminToken(storedToken);
        } else {
          sessionStorage.removeItem("rp_admin_token");
          sessionStorage.removeItem("rp_admin_token_exp");
          setIsUnauthorized(true);
        }
      } else {
        setIsUnauthorized(true);
      }
    }
  }, []);

  const handleLogout = useCallback(() => {
    setAdminToken("");
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("rp_admin_token");
      sessionStorage.removeItem("rp_admin_token_exp");
    }
    setIsUnauthorized(true);
  }, []);

  const fetchBookings = useCallback(
    async (overrideToken?: string) => {
      setLoading(true);
      setError(null);
      const tokenToUse = overrideToken !== undefined ? overrideToken : adminToken;

      try {
        const headers: Record<string, string> = {};
        if (tokenToUse) {
          headers["Authorization"] = `Bearer ${tokenToUse}`;
        }

        const params = new URLSearchParams();
        if (searchTerm.trim()) params.set("search", searchTerm.trim());
        if (bookingStatusFilter !== "all") params.set("bookingStatus", bookingStatusFilter);
        if (paymentStatusFilter !== "all") params.set("paymentStatus", paymentStatusFilter);
        params.set("page", String(page));
        params.set("limit", "15");
        params.set("sortBy", sortBy);
        params.set("sortOrder", sortOrder);

        const res = await fetch(`/api/admin/bookings?${params.toString()}`, { headers });

        if (res.status === 401) {
          handleLogout();
          setKeyError("Session expired or unauthorized. Please re-enter your secret key.");
          setLoading(false);
          return;
        }

        const data = await res.json();
        if (!data.success) throw new Error(data.message || "Failed to load bookings");

        setIsUnauthorized(false);
        setBookings(data.bookings);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load bookings");
      } finally {
        setLoading(false);
      }
    },
    [adminToken, handleLogout, searchTerm, bookingStatusFilter, paymentStatusFilter, page, sortBy, sortOrder]
  );

  useEffect(() => {
    if (adminToken) {
      fetchBookings();
    }
  }, [fetchBookings, adminToken]);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyInput.trim()) return;
    setIsVerifyingKey(true);
    setKeyError(null);

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret: keyInput.trim() }),
      });
      const data = await res.json();

      if (res.status === 401 || !data.success) {
        setKeyError("Invalid Admin Secret Key. Please try again.");
        setIsVerifyingKey(false);
        return;
      }

      setAdminToken(data.token);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("rp_admin_token", data.token);
        sessionStorage.setItem("rp_admin_token_exp", String(data.expiresAt));
      }

      setIsUnauthorized(false);
      setKeyInput("");
      fetchBookings(data.token);
    } catch (err) {
      setKeyError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setIsVerifyingKey(false);
    }
  };

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case "confirmed":
        return <span className="px-2 py-0.5 text-[9px] uppercase tracking-wider bg-green-900/40 text-green-300 border border-green-700/40">Confirmed</span>;
      case "pending_payment":
        return <span className="px-2 py-0.5 text-[9px] uppercase tracking-wider bg-amber-900/40 text-amber-300 border border-amber-700/40">Payment Pending</span>;
      case "cancelled":
        return <span className="px-2 py-0.5 text-[9px] uppercase tracking-wider bg-red-900/40 text-red-300 border border-red-700/40">Cancelled</span>;
      case "expired":
        return <span className="px-2 py-0.5 text-[9px] uppercase tracking-wider bg-zinc-800 text-zinc-400 border border-zinc-700">Expired</span>;
      default:
        return <span className="px-2 py-0.5 text-[9px] uppercase tracking-wider bg-zinc-800 text-zinc-300">{status}</span>;
    }
  };

  const getPaymentBadge = (status?: PaymentStatus) => {
    switch (status) {
      case "paid":
        return <span className="px-2 py-0.5 text-[9px] uppercase tracking-wider bg-emerald-950 text-emerald-400 border border-emerald-800/40">Paid (100%)</span>;
      case "partially_paid":
        return <span className="px-2 py-0.5 text-[9px] uppercase tracking-wider bg-cyan-950 text-cyan-300 border border-cyan-800/40">50% Advance</span>;
      case "pay_at_property":
        return <span className="px-2 py-0.5 text-[9px] uppercase tracking-wider bg-yellow-950 text-yellow-300 border border-yellow-800/40">Pay on Arrival</span>;
      case "refunded":
        return <span className="px-2 py-0.5 text-[9px] uppercase tracking-wider bg-purple-950 text-purple-300 border border-purple-800/40">Refunded</span>;
      case "partially_refunded":
        return <span className="px-2 py-0.5 text-[9px] uppercase tracking-wider bg-violet-950 text-violet-300 border border-violet-800/40">Partially Refunded</span>;
      case "failed":
        return <span className="px-2 py-0.5 text-[9px] uppercase tracking-wider bg-rose-950 text-rose-300 border border-rose-800/40">Payment Failed</span>;
      default:
        return <span className="px-2 py-0.5 text-[9px] uppercase tracking-wider bg-zinc-800 text-zinc-400">Unsettled</span>;
    }
  };

  return (
    <div className="pt-28 md:pt-32 pb-24 bg-[#171513] text-[#F5F1E8] min-h-screen">
      <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-8">
        {/* Header & Sub-nav */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#B89A62]/15 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] uppercase tracking-[0.4em] text-[#B89A62]">Admin Portal</span>
              <span className="text-[#B89A62]/30">•</span>
              <span className="text-xs text-[#D8C7AD]/60 font-mono">Royal Palace Home Stay</span>
            </div>
            <h1 className="font-serif-editorial text-3xl md:text-4xl font-light text-[#F5F1E8] mt-1">
              Bookings & Payments
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/admin/pricing"
              className="text-xs uppercase tracking-wider text-[#D8C7AD]/60 hover:text-[#B89A62] transition-colors"
            >
              Daily Pricing →
            </Link>
            {adminToken && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-xs text-[#D8C7AD]/60 hover:text-red-400 transition-colors uppercase tracking-wider"
              >
                <LogOut className="w-3.5 h-3.5" />
                Lock
              </button>
            )}
            <button
              onClick={() => fetchBookings()}
              className="flex items-center gap-1.5 text-xs text-[#D8C7AD]/60 hover:text-[#B89A62] transition-colors uppercase tracking-wider"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
          </div>
        </div>

        {/* Lock Screen if unauthorized */}
        {isUnauthorized && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto my-12 bg-[#1C1A17] border border-[#B89A62]/30 p-8 space-y-6 text-center"
          >
            <div className="w-12 h-12 mx-auto rounded-full bg-[#B89A62]/10 border border-[#B89A62]/30 flex items-center justify-center text-[#B89A62]">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif-editorial text-2xl text-[#F5F1E8]">Admin Authentication</h2>
              <p className="text-xs text-[#D8C7AD]/60 mt-2 font-light leading-relaxed">
                Enter your <code className="text-[#B89A62]">ADMIN_SECRET_KEY</code> to view and manage guest bookings and refunds.
              </p>
            </div>

            <form onSubmit={handleUnlock} className="space-y-4 text-left">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#D8C7AD]/70 mb-1.5">
                  Admin Secret Key
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#D8C7AD]/40" />
                  <input
                    type="password"
                    value={keyInput}
                    onChange={(e) => setKeyInput(e.target.value)}
                    placeholder="Enter ADMIN_SECRET_KEY"
                    className="w-full bg-[#12100E] border border-[#B89A62]/20 text-xs text-[#F5F1E8] pl-9 pr-3 py-2.5 focus:outline-none focus:border-[#B89A62] transition-colors"
                    autoFocus
                  />
                </div>
              </div>

              {keyError && (
                <div className="flex items-center gap-2 text-xs p-2.5 bg-red-900/20 border border-red-500/30 text-red-300">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{keyError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isVerifyingKey || !keyInput.trim()}
                className="w-full py-2.5 bg-[#B89A62] text-[#171513] text-xs font-semibold uppercase tracking-wider hover:bg-[#D4B67E] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {isVerifyingKey ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Unlock Bookings
                  </>
                )}
              </button>
            </form>
          </motion.div>
        )}

        {/* Dashboard Content */}
        {!isUnauthorized && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="bg-[#1C1A17] border border-[#B89A62]/20 p-4 grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#D8C7AD]/40" />
                <input
                  type="text"
                  placeholder="Search guest, email, phone, ID..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                  className="w-full bg-[#12100E] border border-[#B89A62]/20 text-xs text-[#F5F1E8] pl-9 pr-3 py-2 focus:outline-none focus:border-[#B89A62]"
                />
              </div>

              {/* Booking status filter */}
              <CustomSelect
                value={bookingStatusFilter}
                onChange={(val) => {
                  setBookingStatusFilter(val);
                  setPage(1);
                }}
                options={[
                  { value: "all", label: "All Booking Statuses" },
                  { value: "confirmed", label: "Confirmed" },
                  { value: "pending_payment", label: "Pending Payment" },
                  { value: "cancelled", label: "Cancelled" },
                  { value: "expired", label: "Expired" },
                ]}
              />

              {/* Payment status filter */}
              <CustomSelect
                value={paymentStatusFilter}
                onChange={(val) => {
                  setPaymentStatusFilter(val);
                  setPage(1);
                }}
                options={[
                  { value: "all", label: "All Payment Statuses" },
                  { value: "paid", label: "Paid (100%)" },
                  { value: "partially_paid", label: "Partially Paid (Advance)" },
                  { value: "pay_at_property", label: "Pay at Property" },
                  { value: "refunded", label: "Refunded" },
                  { value: "partially_refunded", label: "Partially Refunded" },
                  { value: "failed", label: "Failed" },
                ]}
              />

              {/* Sort selector */}
              <CustomSelect
                value={`${sortBy}-${sortOrder}`}
                onChange={(val) => {
                  const [sb, so] = val.split("-");
                  setSortBy(sb);
                  setSortOrder(so as "asc" | "desc");
                  setPage(1);
                }}
                options={[
                  { value: "createdAt-desc", label: "Newest First" },
                  { value: "createdAt-asc", label: "Oldest First" },
                  { value: "checkIn-asc", label: "Check-in (Earliest)" },
                  { value: "checkIn-desc", label: "Check-in (Latest)" },
                  { value: "totalAmount-desc", label: "Highest Amount" },
                  { value: "totalAmount-asc", label: "Lowest Amount" },
                ]}
              />
            </div>

            {/* Error view */}
            {error && (
              <div className="flex items-center gap-2 bg-red-900/20 border border-red-500/30 p-4 text-xs text-red-300">
                <AlertTriangle className="w-4 h-4" />
                {error}
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="flex items-center gap-2 text-[#B89A62] text-xs py-8 justify-center">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading bookings...
              </div>
            )}

            {/* Bookings table */}
            {!loading && bookings.length === 0 && (
              <div className="text-center py-16 bg-[#1C1A17] border border-[#B89A62]/20 space-y-2">
                <p className="font-serif-editorial text-xl text-[#F5F1E8]">No bookings found</p>
                <p className="text-xs text-[#D8C7AD]/60">Try adjusting your search or filters.</p>
              </div>
            )}

            {!loading && bookings.length > 0 && (
              <div className="bg-[#1C1A17] border border-[#B89A62]/20 overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-[#B89A62]/15 text-[#D8C7AD]/60 uppercase tracking-wider text-[9px]">
                      <th className="py-3 px-4 text-left font-normal">Booking ID</th>
                      <th className="py-3 px-4 text-left font-normal">Guest</th>
                      <th className="py-3 px-4 text-left font-normal">Dates</th>
                      <th className="py-3 px-4 text-left font-normal">Total</th>
                      <th className="py-3 px-4 text-left font-normal">Paid</th>
                      <th className="py-3 px-4 text-left font-normal">Remaining</th>
                      <th className="py-3 px-4 text-left font-normal">Booking Status</th>
                      <th className="py-3 px-4 text-left font-normal">Payment</th>
                      <th className="py-3 px-4 text-right font-normal">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((b) => (
                      <tr
                        key={b.bookingId}
                        className="border-b border-[#B89A62]/5 hover:bg-[#B89A62]/5 transition-colors"
                      >
                        <td className="py-3.5 px-4 font-mono font-medium text-[#B89A62] whitespace-nowrap">
                          {b.bookingId}
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="text-[#F5F1E8] font-medium">{b.guestName}</p>
                          <p className="text-[10px] text-[#D8C7AD]/60">{b.guestPhone}</p>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <p className="text-[#F5F1E8]">
                            {formatDisplayDate(b.checkIn)} → {formatDisplayDate(b.checkOut)}
                          </p>
                          <p className="text-[10px] text-[#D8C7AD]/60">
                            {b.nightlyBreakdown.length} nights • {b.numberOfGuests} guests
                          </p>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-[#F5F1E8] whitespace-nowrap">
                          {formatINR(b.totalAmount)}
                        </td>
                        <td className="py-3.5 px-4 text-green-400 whitespace-nowrap">
                          {formatINR(b.payment?.paidAmount ?? 0)}
                        </td>
                        <td className="py-3.5 px-4 text-[#D8C7AD]/70 whitespace-nowrap">
                          {formatINR(b.payment?.remainingAmount ?? (b.payment?.method === "pay_later" ? b.totalAmount : 0))}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">{getStatusBadge(b.status)}</td>
                        <td className="py-3.5 px-4 whitespace-nowrap">{getPaymentBadge(b.payment?.status)}</td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <Link
                            href={`/admin/bookings/${b.bookingId}`}
                            className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-[#B89A62] hover:text-[#D4B67E] transition-colors"
                          >
                            <span>Manage</span>
                            <ChevronRight className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                <div className="flex items-center justify-between px-4 py-3 border-t border-[#B89A62]/15 text-xs text-[#D8C7AD]/60">
                  <span>
                    Showing {bookings.length} of {total} bookings
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                      className="px-3 py-1 bg-[#12100E] border border-[#B89A62]/20 text-[#F5F1E8] disabled:opacity-30 transition-colors uppercase text-[10px]"
                    >
                      Prev
                    </button>
                    <span className="text-[10px]">
                      Page {page} of {totalPages || 1}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                      className="px-3 py-1 bg-[#12100E] border border-[#B89A62]/20 text-[#F5F1E8] disabled:opacity-30 transition-colors uppercase text-[10px]"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
