"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2, Save, AlertTriangle, CheckCircle2, RefreshCw, LayoutGrid, Lock, Key, LogOut, ShieldCheck, Clock } from "lucide-react";
import { formatINR, todayDateStr, addDaysToDateStr, formatDisplayDate, parseDateStr } from "@/lib/booking/dates";
import type { AdminDayView } from "@/lib/booking/types";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export default function AdminPricingPage() {
  const [days, setDays] = useState<AdminDayView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<Record<string, "saving" | "saved" | "error">>({});
  const [editPrices, setEditPrices] = useState<Record<string, string>>({});

  // Auth state (Bearer token with 30-minute expiration)
  const [adminToken, setAdminToken] = useState<string>("");
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [remainingMinutes, setRemainingMinutes] = useState<number | null>(null);
  const [keyInput, setKeyInput] = useState<string>("");
  const [keyError, setKeyError] = useState<string | null>(null);
  const [isVerifyingKey, setIsVerifyingKey] = useState(false);
  const [isUnauthorized, setIsUnauthorized] = useState(false);

  // Bulk tool
  const [bulkFrom, setBulkFrom] = useState(todayDateStr());
  const [bulkTo, setBulkTo] = useState(addDaysToDateStr(todayDateStr(), 6));
  const [bulkPrice, setBulkPrice] = useState("");
  const [bulkSaving, setBulkSaving] = useState(false);
  const [bulkResult, setBulkResult] = useState<{ success: boolean; message: string } | null>(null);

  const today = todayDateStr();
  const from = today;
  const to = addDaysToDateStr(today, 89);

  // Load token from sessionStorage on client mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = sessionStorage.getItem("rp_admin_token");
      const storedExp = sessionStorage.getItem("rp_admin_token_exp");
      if (storedToken && storedExp) {
        const expNum = Number(storedExp);
        if (Date.now() < expNum) {
          setAdminToken(storedToken);
          setExpiresAt(expNum);
        } else {
          sessionStorage.removeItem("rp_admin_token");
          sessionStorage.removeItem("rp_admin_token_exp");
          setIsUnauthorized(true);
          setKeyError("Your 30-minute session has expired. Please re-enter your key.");
        }
      }
    }
  }, []);

  // Countdown timer & auto-expiry checker
  useEffect(() => {
    if (!expiresAt) {
      setRemainingMinutes(null);
      return;
    }

    const checkExpiration = () => {
      const diffMs = expiresAt - Date.now();
      if (diffMs <= 0) {
        setAdminToken("");
        setExpiresAt(null);
        setRemainingMinutes(0);
        setIsUnauthorized(true);
        setKeyError("Session expired (30-minute limit). Please re-enter your secret key.");
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("rp_admin_token");
          sessionStorage.removeItem("rp_admin_token_exp");
        }
      } else {
        setRemainingMinutes(Math.max(1, Math.ceil(diffMs / 60000)));
      }
    };

    checkExpiration();
    const interval = setInterval(checkExpiration, 10000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const handleLogout = useCallback(() => {
    setAdminToken("");
    setExpiresAt(null);
    setRemainingMinutes(null);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("rp_admin_token");
      sessionStorage.removeItem("rp_admin_token_exp");
    }
    setIsUnauthorized(true);
  }, []);

  const fetchPricing = useCallback(async (overrideToken?: string) => {
    setLoading(true);
    setError(null);
    const tokenToUse = overrideToken !== undefined ? overrideToken : adminToken;
    try {
      const headers: Record<string, string> = {};
      if (tokenToUse) {
        headers["Authorization"] = `Bearer ${tokenToUse}`;
      }

      const res = await fetch(`/api/admin/pricing?from=${from}&to=${to}`, { headers });
      if (res.status === 401) {
        handleLogout();
        setKeyError("Unauthorized or session expired. Please enter your secret key.");
        setLoading(false);
        return;
      }

      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Failed to load pricing");

      setIsUnauthorized(false);
      setDays(data.days as AdminDayView[]);
      // Seed edit prices from fetched data
      const prices: Record<string, string> = {};
      for (const d of data.days as AdminDayView[]) {
        if (d.price !== null) prices[d.date] = String(d.price);
      }
      setEditPrices(prices);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [from, to, adminToken, handleLogout]);

  useEffect(() => {
    fetchPricing();
  }, [fetchPricing]);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyInput.trim()) return;
    setIsVerifyingKey(true);
    setKeyError(null);

    try {
      // Exchange secret key for a 30-minute signed Bearer token
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

      // Valid! Save 30-minute token and expiration in state and sessionStorage
      setAdminToken(data.token);
      setExpiresAt(data.expiresAt);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("rp_admin_token", data.token);
        sessionStorage.setItem("rp_admin_token_exp", String(data.expiresAt));
      }
      setIsUnauthorized(false);
      setKeyInput("");
      fetchPricing(data.token);
    } catch (err) {
      setKeyError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setIsVerifyingKey(false);
    }
  };

  const saveDate = async (date: string) => {
    const rawPrice = editPrices[date];
    const price = Number(rawPrice);
    if (!rawPrice || isNaN(price) || price <= 0) return;

    setSaveStatus((s) => ({ ...s, [date]: "saving" }));
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (adminToken) headers["Authorization"] = `Bearer ${adminToken}`;

      const res = await fetch("/api/admin/pricing", {
        method: "POST",
        headers,
        body: JSON.stringify({ date, price: Math.round(price) }),
      });
      if (res.status === 401) {
        handleLogout();
        setKeyError("Your session expired. Please re-enter your secret key.");
        return;
      }
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setSaveStatus((s) => ({ ...s, [date]: "saved" }));
      // Update local day status
      setDays((prev) =>
        prev.map((d) =>
          d.date === date ? { ...d, price: Math.round(price), status: d.status === "no_price" ? "available" : d.status } : d
        )
      );
      setTimeout(() => setSaveStatus((s) => { const n = { ...s }; delete n[date]; return n; }), 2000);
    } catch {
      setSaveStatus((s) => ({ ...s, [date]: "error" }));
    }
  };

  const handleBulkApply = async () => {
    const price = Number(bulkPrice);
    if (!bulkPrice || isNaN(price) || price <= 0) {
      setBulkResult({ success: false, message: "Please enter a valid price" });
      return;
    }
    if (bulkFrom > bulkTo) {
      setBulkResult({ success: false, message: "From date must be before To date" });
      return;
    }

    setBulkSaving(true);
    setBulkResult(null);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (adminToken) headers["Authorization"] = `Bearer ${adminToken}`;

      const res = await fetch("/api/admin/pricing/bulk", {
        method: "POST",
        headers,
        body: JSON.stringify({ from: bulkFrom, to: bulkTo, price: Math.round(price) }),
      });
      if (res.status === 401) {
        handleLogout();
        setKeyError("Your session expired. Please re-enter your secret key.");
        return;
      }
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setBulkResult({ success: true, message: `Updated ${data.updated} days to ${formatINR(price)}` });
      fetchPricing(); // refresh
    } catch (e) {
      setBulkResult({ success: false, message: e instanceof Error ? e.message : "Failed" });
    } finally {
      setBulkSaving(false);
    }
  };

  // Group days by month
  const grouped: Record<string, AdminDayView[]> = {};
  for (const day of days) {
    const monthKey = day.date.slice(0, 7); // "YYYY-MM"
    if (!grouped[monthKey]) grouped[monthKey] = [];
    grouped[monthKey].push(day);
  }

  const inputClass =
    "bg-[#12100E] border border-[#B89A62]/20 text-xs text-[#F5F1E8] px-2.5 py-1.5 w-full focus:outline-none focus:border-[#B89A62] placeholder:text-[#F5F1E8]/20 transition-colors";

  return (
    <div className="pt-28 md:pt-32 pb-24 bg-[#171513] text-[#F5F1E8] min-h-screen">
      <div className="max-w-6xl mx-auto px-6 md:px-12 space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase tracking-[0.4em] text-[#B89A62]">Admin</span>
            <h1 className="font-serif-editorial text-3xl md:text-4xl font-light text-[#F5F1E8] mt-1">
              Pricing Management
            </h1>
            <p className="text-xs text-[#D8C7AD]/60 mt-1 font-light">
              Set and update daily rates for Royal Palace Home Stay.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/admin/bookings"
              className="text-xs uppercase tracking-wider text-[#D8C7AD]/60 hover:text-[#B89A62] transition-colors"
            >
              Bookings & Payments →
            </Link>
            {adminToken && remainingMinutes !== null && (
              <div className="flex items-center gap-1.5 text-[11px] text-[#B89A62] bg-[#B89A62]/10 border border-[#B89A62]/20 px-2.5 py-1">
                <Clock className="w-3 h-3 animate-pulse" />
                <span>Session: {remainingMinutes}m left</span>
              </div>
            )}
            {adminToken && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-xs text-[#D8C7AD]/60 hover:text-red-400 transition-colors uppercase tracking-wider"
                title="Lock / Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                Lock
              </button>
            )}
            <button
              onClick={() => fetchPricing()}
              className="flex items-center gap-1.5 text-xs text-[#D8C7AD]/60 hover:text-[#B89A62] transition-colors uppercase tracking-wider"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
          </div>
        </div>

        {/* Unauthorized Lock Screen */}
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
                This dashboard is protected. Enter your <code className="text-[#B89A62]">ADMIN_SECRET_KEY</code> to access pricing controls.
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
                    Verifying Key...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Unlock Dashboard
                  </>
                )}
              </button>
            </form>
          </motion.div>
        )}

        {/* Dashboard Content (visible when authorized) */}
        {!isUnauthorized && (
          <>

        {/* Bulk pricing tool */}
        <div className="bg-[#1C1A17] border border-[#B89A62]/20 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-4 h-4 text-[#B89A62]" />
            <h2 className="text-sm font-semibold text-[#F5F1E8] uppercase tracking-wider">
              Bulk Pricing
            </h2>
          </div>
          <p className="text-xs text-[#D8C7AD]/60 font-light">
            Set the same price for a range of dates at once.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
            <div>
              <label className="block text-[9px] uppercase tracking-wider text-[#D8C7AD]/50 mb-1">From</label>
              <input
                type="date"
                value={bulkFrom}
                min={today}
                onChange={(e) => setBulkFrom(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-[9px] uppercase tracking-wider text-[#D8C7AD]/50 mb-1">To</label>
              <input
                type="date"
                value={bulkTo}
                min={bulkFrom}
                onChange={(e) => setBulkTo(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-[9px] uppercase tracking-wider text-[#D8C7AD]/50 mb-1">Price (₹/night)</label>
              <input
                type="number"
                value={bulkPrice}
                onChange={(e) => setBulkPrice(e.target.value)}
                placeholder="e.g. 15000"
                min={1}
                className={inputClass}
              />
            </div>
            <button
              onClick={handleBulkApply}
              disabled={bulkSaving}
              className="py-2 px-4 bg-[#B89A62] text-[#171513] text-xs font-semibold uppercase tracking-wider hover:bg-[#D4B67E] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {bulkSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Apply
            </button>
          </div>

          {bulkResult && (
            <div
              className={`flex items-center gap-2 text-xs p-3 border ${
                bulkResult.success
                  ? "bg-green-900/20 border-green-500/30 text-green-300"
                  : "bg-red-900/20 border-red-500/30 text-red-300"
              }`}
            >
              {bulkResult.success ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5" />
              )}
              {bulkResult.message}
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 bg-red-900/20 border border-red-500/30 p-4 text-xs text-red-300">
            <AlertTriangle className="w-4 h-4" />
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center gap-2 text-[#B89A62] text-xs">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading pricing data...
          </div>
        )}

        {/* Monthly pricing grids */}
        {!loading &&
          Object.entries(grouped).map(([monthKey, monthDays]) => {
            const [y, m] = monthKey.split("-").map(Number);
            return (
              <div key={monthKey} className="space-y-3">
                <h3 className="font-serif-editorial text-xl text-[#F5F1E8] border-b border-[#B89A62]/10 pb-2">
                  {MONTHS[m - 1]} {y}
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-[#D8C7AD]/50 uppercase tracking-wider text-[9px] border-b border-[#B89A62]/10">
                        <th className="text-left py-2 pr-4 font-normal">Date</th>
                        <th className="text-left py-2 pr-4 font-normal">Status</th>
                        <th className="text-left py-2 pr-4 font-normal w-40">Price (₹/night)</th>
                        <th className="text-left py-2 font-normal">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthDays.map((day) => {
                        const isPast = day.date < today;
                        const status = saveStatus[day.date];
                        return (
                          <motion.tr
                            key={day.date}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className={`border-b border-[#B89A62]/5 ${isPast ? "opacity-40" : ""}`}
                          >
                            <td className="py-2 pr-4 text-[#F5F1E8]/70 whitespace-nowrap">
                              {formatDisplayDate(day.date)}
                            </td>
                            <td className="py-2 pr-4">
                              <span
                                className={`inline-block px-2 py-0.5 text-[9px] uppercase tracking-wider rounded-sm ${
                                  day.status === "booked"
                                    ? "bg-red-900/30 text-red-300"
                                    : day.status === "no_price"
                                    ? "bg-[#2A2520] text-[#D8C7AD]/40"
                                    : "bg-[#1C3020] text-green-400"
                                }`}
                              >
                                {day.status === "booked" ? "Booked" : day.status === "no_price" ? "No Price" : "Available"}
                              </span>
                            </td>
                            <td className="py-2 pr-4">
                              <input
                                type="number"
                                value={editPrices[day.date] ?? ""}
                                onChange={(e) =>
                                  setEditPrices((p) => ({ ...p, [day.date]: e.target.value }))
                                }
                                onKeyDown={(e) => e.key === "Enter" && saveDate(day.date)}
                                placeholder="e.g. 12000"
                                min={1}
                                disabled={isPast || day.status === "booked"}
                                className="w-32 bg-[#12100E] border border-[#B89A62]/20 text-xs text-[#F5F1E8] px-2 py-1.5 focus:outline-none focus:border-[#B89A62] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                              />
                            </td>
                            <td className="py-2">
                              {!isPast && day.status !== "booked" && (
                                <button
                                  onClick={() => saveDate(day.date)}
                                  disabled={status === "saving"}
                                  className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-[#B89A62] hover:text-[#D4B67E] disabled:opacity-50 transition-colors"
                                >
                                  {status === "saving" ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : status === "saved" ? (
                                    <CheckCircle2 className="w-3 h-3 text-green-400" />
                                  ) : status === "error" ? (
                                    <AlertTriangle className="w-3 h-3 text-red-400" />
                                  ) : (
                                    <Save className="w-3 h-3" />
                                  )}
                                  {status === "saved" ? "Saved" : status === "error" ? "Error" : "Save"}
                                </button>
                              )}
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
          </>
        )}
      </div>
    </div>
  );
}
