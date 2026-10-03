"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Key,
  ShieldCheck,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  LogOut,
  RefreshCw,
  ChevronRight,
  Sparkles,
  CreditCard,
  Building,
  ArrowRight,
  Info,
  X,
} from "lucide-react";
import { formatDisplayDate, formatINR } from "@/lib/booking/dates";
import type { Booking, BookingStatus, PaymentStatus } from "@/lib/booking/types";

export default function UserAccountPage() {
  // Authentication State
  const [token, setToken] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");

  // Step state: "email" | "otp" | "dashboard"
  const [step, setStep] = useState<"email" | "otp" | "dashboard">("email");

  // Form Inputs
  const [emailInput, setEmailInput] = useState("");
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", ""]);
  const otpRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Loading & Error States
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Resend Timer
  const [resendCooldown, setResendCooldown] = useState(0);

  // Bookings State
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [filterTab, setFilterTab] = useState<"all" | "upcoming" | "past">("all");

  // Load session from localStorage/sessionStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("rp_user_token");
      const storedEmail = localStorage.getItem("rp_user_email");
      if (storedToken && storedEmail) {
        setToken(storedToken);
        setUserEmail(storedEmail);
        setStep("dashboard");
      }
    }
  }, []);

  // Resend timer countdown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // Fetch User Bookings
  const fetchUserBookings = useCallback(async (authToken?: string) => {
    const tokenToUse = authToken || token;
    if (!tokenToUse) return;

    setIsLoadingBookings(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/user/bookings", {
        headers: {
          Authorization: `Bearer ${tokenToUse}`,
        },
      });

      if (res.status === 401) {
        handleLogout();
        setErrorMsg("Your session has expired. Please enter your email to log in again.");
        return;
      }

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || "Failed to load your reservations.");
      }

      setBookings(data.bookings || []);
      setUserEmail(data.email || "");
    } catch (err: any) {
      setErrorMsg(err.message || "Could not retrieve bookings.");
    } finally {
      setIsLoadingBookings(false);
    }
  }, [token]);

  useEffect(() => {
    if (token && step === "dashboard") {
      fetchUserBookings();
    }
  }, [token, step, fetchUserBookings]);

  // Handle Request OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim() || !emailInput.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    setIsSendingCode(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput.trim() }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || "Failed to send authorization code.");
      }

      setStep("otp");
      setResendCooldown(60);
      setSuccessMsg(`Authorization code sent to ${emailInput.trim()}`);
      setTimeout(() => otpRefs[0].current?.focus(), 100);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to send code. Please try again.");
    } finally {
      setIsSendingCode(false);
    }
  };

  // Handle OTP Digit Input
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);

    // Auto-advance to next input
    if (value && index < 3) {
      otpRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  // Handle Verify OTP
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const code = otpDigits.join("");
    if (code.length !== 4) {
      setErrorMsg("Please enter all 4 digits of your authorization code.");
      return;
    }

    setIsVerifyingCode(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailInput.trim(),
          code,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || "Invalid code.");
      }

      // Save token to state & localStorage
      const userToken = data.token;
      const verifiedEmail = data.email;

      setToken(userToken);
      setUserEmail(verifiedEmail);
      if (typeof window !== "undefined") {
        localStorage.setItem("rp_user_token", userToken);
        localStorage.setItem("rp_user_email", verifiedEmail);
      }

      setStep("dashboard");
      fetchUserBookings(userToken);
    } catch (err: any) {
      setErrorMsg(err.message || "Verification failed. Please try again.");
    } finally {
      setIsVerifyingCode(false);
    }
  };

  // Handle Resend Code
  const handleResendCode = async () => {
    if (resendCooldown > 0 || isSendingCode) return;
    setIsSendingCode(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput.trim() }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      setResendCooldown(60);
      setSuccessMsg("A new 4-digit code has been sent to your email.");
      setOtpDigits(["", "", "", ""]);
      otpRefs[0].current?.focus();
    } catch (err: any) {
      setErrorMsg(err.message || "Could not resend code.");
    } finally {
      setIsSendingCode(false);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    setToken("");
    setUserEmail("");
    setStep("email");
    setOtpDigits(["", "", "", ""]);
    setEmailInput("");
    setErrorMsg(null);
    setSuccessMsg(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("rp_user_token");
      localStorage.removeItem("rp_user_email");
    }
  };

  // Helper status badges
  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case "confirmed":
        return <span className="px-2.5 py-1 text-[10px] uppercase tracking-wider bg-green-900/40 text-green-300 border border-green-700/40 font-semibold">Confirmed</span>;
      case "pending_payment":
        return <span className="px-2.5 py-1 text-[10px] uppercase tracking-wider bg-amber-900/40 text-amber-300 border border-amber-700/40 font-semibold">Payment Pending</span>;
      case "cancelled":
        return <span className="px-2.5 py-1 text-[10px] uppercase tracking-wider bg-red-900/40 text-red-300 border border-red-700/40 font-semibold">Cancelled</span>;
      default:
        return <span className="px-2.5 py-1 text-[10px] uppercase tracking-wider bg-zinc-800 text-zinc-300 font-semibold">{status}</span>;
    }
  };

  const getPaymentBadge = (status?: PaymentStatus) => {
    switch (status) {
      case "paid":
        return <span className="px-2.5 py-1 text-[10px] uppercase tracking-wider bg-emerald-950 text-emerald-400 border border-emerald-800/40 font-semibold">100% Paid</span>;
      case "partially_paid":
        return <span className="px-2.5 py-1 text-[10px] uppercase tracking-wider bg-cyan-950 text-cyan-300 border border-cyan-800/40 font-semibold">50% Advance Paid</span>;
      case "pay_at_property":
        return <span className="px-2.5 py-1 text-[10px] uppercase tracking-wider bg-yellow-950 text-yellow-300 border border-yellow-800/40 font-semibold">Pay at Property</span>;
      case "refunded":
        return <span className="px-2.5 py-1 text-[10px] uppercase tracking-wider bg-purple-950 text-purple-300 border border-purple-800/40 font-semibold">Refunded</span>;
      default:
        return <span className="px-2.5 py-1 text-[10px] uppercase tracking-wider bg-zinc-800 text-zinc-400 font-semibold">Unsettled</span>;
    }
  };

  // Filter bookings
  const todayStr = new Date().toISOString().split("T")[0];
  const upcomingBookings = bookings.filter((b) => b.checkOut >= todayStr && b.status !== "cancelled");
  const pastBookings = bookings.filter((b) => b.checkOut < todayStr || b.status === "cancelled");

  const displayedBookings =
    filterTab === "upcoming"
      ? upcomingBookings
      : filterTab === "past"
      ? pastBookings
      : bookings;

  return (
    <div className="pt-28 md:pt-36 pb-24 bg-[#171513] text-[#F5F1E8] min-h-screen">
      <div className="max-w-5xl mx-auto px-6 md:px-12">
        {/* Step 1: Email Input */}
        {step === "email" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="max-w-md mx-auto text-center space-y-8 bg-[#1C1A17] border border-[#B89A62]/20 p-8 md:p-10 shadow-2xl relative"
          >
            <div className="w-14 h-14 rounded-full bg-[#B89A62]/10 border border-[#B89A62]/30 flex items-center justify-center mx-auto text-[#B89A62]">
              <User className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#B89A62] font-semibold">
                Royal Palace Concierge
              </span>
              <h1 className="font-serif-editorial text-3xl font-light text-[#F5F1E8]">
                Guest Account Access
              </h1>
              <p className="text-xs text-[#D8C7AD]/70 leading-relaxed max-w-sm mx-auto">
                Enter your email address to receive a 4-digit authorization code to view your homestay reservations.
              </p>
            </div>

            <form onSubmit={handleRequestOtp} className="space-y-5 text-left">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#D8C7AD] mb-1.5">
                  Your Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#D8C7AD]/40" />
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="guest@example.com"
                    className="w-full bg-[#12100E] border border-[#B89A62]/20 text-xs text-[#F5F1E8] pl-10 pr-4 py-3 focus:outline-none focus:border-[#B89A62] placeholder:text-[#F5F1E8]/20 transition-colors"
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="flex items-start gap-2 bg-red-900/20 border border-red-500/30 p-3.5 text-xs text-red-300">
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSendingCode || !emailInput.trim()}
                className="w-full py-3.5 bg-[#B89A62] text-[#171513] text-xs font-semibold tracking-[0.2em] uppercase hover:bg-[#D4B67E] disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                {isSendingCode ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending Code...</span>
                  </>
                ) : (
                  <>
                    <span>Get Authorization Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-4 border-t border-[#B89A62]/10 text-center">
              <Link
                href="/booking"
                className="text-xs text-[#D8C7AD]/60 hover:text-[#F5F1E8] transition-colors inline-flex items-center gap-1 uppercase tracking-wider"
              >
                <span>Don't have a reservation? Reserve Stay</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </motion.div>
        )}

        {/* Step 2: 4-Digit Code Input */}
        {step === "otp" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="max-w-md mx-auto text-center space-y-8 bg-[#1C1A17] border border-[#B89A62]/20 p-8 md:p-10 shadow-2xl relative"
          >
            <div className="w-14 h-14 rounded-full bg-[#B89A62]/10 border border-[#B89A62]/30 flex items-center justify-center mx-auto text-[#B89A62]">
              <Key className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#B89A62] font-semibold">
                Authorization Code Sent
              </span>
              <h1 className="font-serif-editorial text-3xl font-light text-[#F5F1E8]">
                Check Your Email
              </h1>
              <p className="text-xs text-[#D8C7AD]/70 leading-relaxed max-w-sm mx-auto">
                We've sent a 4-digit verification code to{" "}
                <span className="text-[#B89A62] font-semibold">{emailInput}</span>. Enter it below to unlock your account.
              </p>
            </div>

            {successMsg && (
              <div className="flex items-center justify-center gap-2 bg-[#B89A62]/10 border border-[#B89A62]/30 p-3 text-xs text-[#D8C7AD]">
                <CheckCircle2 className="w-4 h-4 text-[#B89A62] shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="flex items-start gap-2 bg-red-900/20 border border-red-500/30 p-3.5 text-xs text-red-300 text-left">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* 4 Digit Boxes */}
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="flex justify-center gap-3">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={otpRefs[idx]}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="w-14 h-14 bg-[#12100E] border border-[#B89A62]/30 text-center font-serif-editorial text-2xl text-[#F5F1E8] focus:outline-none focus:border-[#B89A62] focus:ring-1 focus:ring-[#B89A62] transition-colors"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={isVerifyingCode || otpDigits.join("").length !== 4}
                className="w-full py-3.5 bg-[#B89A62] text-[#171513] text-xs font-semibold tracking-[0.2em] uppercase hover:bg-[#D4B67E] disabled:opacity-40 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                {isVerifyingCode ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verify & View Bookings</span>
                  </>
                )}
              </button>
            </form>

            <div className="flex items-center justify-between text-xs pt-4 border-t border-[#B89A62]/10">
              <button
                type="button"
                onClick={() => {
                  setStep("email");
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="text-[#D8C7AD]/60 hover:text-[#F5F1E8] transition-colors uppercase tracking-wider text-[11px]"
              >
                ← Change Email
              </button>

              <button
                type="button"
                disabled={resendCooldown > 0 || isSendingCode}
                onClick={handleResendCode}
                className="text-[#B89A62] hover:text-[#D4B67E] disabled:opacity-40 transition-colors uppercase tracking-wider text-[11px] font-semibold"
              >
                {resendCooldown > 0 ? `Resend Code (${resendCooldown}s)` : "Resend Code"}
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Guest Dashboard */}
        {step === "dashboard" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Account Header */}
            <div className="bg-[#1C1A17] border border-[#B89A62]/20 p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#B89A62]" />
                  <span className="text-[10px] uppercase tracking-[0.3em] text-[#B89A62] font-semibold">
                    Royal Palace Guest Portal
                  </span>
                </div>
                <h1 className="font-serif-editorial text-3xl md:text-4xl text-[#F5F1E8] font-light">
                  My Reservations
                </h1>
                <p className="text-xs text-[#D8C7AD]/70 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#B89A62]" />
                  <span>Logged in as <strong className="text-[#F5F1E8] font-normal">{userEmail}</strong></span>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => fetchUserBookings()}
                  disabled={isLoadingBookings}
                  className="px-4 py-2.5 border border-[#B89A62]/30 text-xs text-[#D8C7AD] hover:text-[#F5F1E8] hover:border-[#B89A62] transition-colors flex items-center gap-2 cursor-pointer uppercase tracking-wider"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingBookings ? "animate-spin text-[#B89A62]" : ""}`} />
                  <span>Sync Bookings</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="px-4 py-2.5 bg-red-950/40 border border-red-800/40 text-xs text-red-300 hover:bg-red-900/60 transition-colors flex items-center gap-2 cursor-pointer uppercase tracking-wider"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#1C1A17] border border-[#B89A62]/20 p-5 space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-[#D8C7AD]/60">
                  Total Reservations
                </span>
                <p className="font-serif-editorial text-3xl text-[#B89A62]">
                  {bookings.length}
                </p>
              </div>

              <div className="bg-[#1C1A17] border border-[#B89A62]/20 p-5 space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-[#D8C7AD]/60">
                  Upcoming Stays
                </span>
                <p className="font-serif-editorial text-3xl text-green-400">
                  {upcomingBookings.length}
                </p>
              </div>

              <div className="bg-[#1C1A17] border border-[#B89A62]/20 p-5 space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-[#D8C7AD]/60">
                  Homestay Property
                </span>
                <p className="font-serif-editorial text-xl text-[#F5F1E8]">
                  Royal Palace Varkala
                </p>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-3 border-b border-[#B89A62]/20 pb-3">
              {(["all", "upcoming", "past"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilterTab(tab)}
                  className={`text-xs uppercase tracking-[0.2em] py-1.5 px-3 transition-colors cursor-pointer border-b-2 -mb-3 ${
                    filterTab === tab
                      ? "border-[#B89A62] text-[#B89A62] font-semibold"
                      : "border-transparent text-[#D8C7AD]/50 hover:text-[#F5F1E8]"
                  }`}
                >
                  {tab === "all"
                    ? `All Bookings (${bookings.length})`
                    : tab === "upcoming"
                    ? `Upcoming (${upcomingBookings.length})`
                    : `Past / Cancelled (${pastBookings.length})`}
                </button>
              ))}
            </div>

            {/* Bookings List */}
            {isLoadingBookings ? (
              <div className="py-20 text-center space-y-3 bg-[#1C1A17] border border-[#B89A62]/10">
                <Loader2 className="w-8 h-8 animate-spin text-[#B89A62] mx-auto" />
                <p className="text-xs text-[#D8C7AD]/70">Loading your homestay reservations...</p>
              </div>
            ) : displayedBookings.length === 0 ? (
              <div className="py-16 px-6 text-center space-y-4 bg-[#1C1A17] border border-[#B89A62]/20">
                <Building className="w-10 h-10 text-[#B89A62]/40 mx-auto" />
                <div className="space-y-1">
                  <h3 className="font-serif-editorial text-xl text-[#F5F1E8]">
                    No Reservations Found
                  </h3>
                  <p className="text-xs text-[#D8C7AD]/60 max-w-sm mx-auto">
                    {filterTab === "all"
                      ? `No bookings exist for email ${userEmail}.`
                      : `No ${filterTab} reservations found.`}
                  </p>
                </div>
                <Link
                  href="/booking"
                  className="px-6 py-3 bg-[#B89A62] text-[#171513] text-xs font-semibold tracking-widest uppercase hover:bg-[#D4B67E] transition-all inline-flex items-center gap-2"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Reserve Homestay Stay</span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {displayedBookings.map((b) => (
                  <div
                    key={b.bookingId}
                    className="bg-[#1C1A17] border border-[#B89A62]/20 p-6 hover:border-[#B89A62]/40 transition-all space-y-4"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-[#B89A62]/10">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm text-[#B89A62] font-semibold">
                            {b.bookingId}
                          </span>
                          {getStatusBadge(b.status)}
                          {getPaymentBadge(b.payment?.status)}
                        </div>
                        <p className="text-xs text-[#D8C7AD]/60 mt-1">
                          Booked on {formatDisplayDate(b.createdAt.split("T")[0])}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] uppercase tracking-wider text-[#D8C7AD]/50 block">
                          Total Stay Amount
                        </span>
                        <span className="font-serif-editorial text-2xl text-[#F5F1E8]">
                          {formatINR(b.totalAmount)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase tracking-wider text-[#D8C7AD]/50 block">
                          Check-in Date
                        </span>
                        <p className="text-[#F5F1E8] font-medium flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#B89A62]" />
                          <span>{formatDisplayDate(b.checkIn)}</span>
                        </p>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] uppercase tracking-wider text-[#D8C7AD]/50 block">
                          Check-out Date
                        </span>
                        <p className="text-[#F5F1E8] font-medium flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#B89A62]" />
                          <span>{formatDisplayDate(b.checkOut)}</span>
                        </p>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] uppercase tracking-wider text-[#D8C7AD]/50 block">
                          Guests & Property
                        </span>
                        <p className="text-[#F5F1E8] font-medium">
                          {b.numberOfGuests} Guests • Entire Homestay
                        </p>
                      </div>
                    </div>

                    {/* Payment breakdown preview */}
                    <div className="bg-[#12100E] p-3 border border-[#B89A62]/10 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div>
                        <span className="text-[#D8C7AD]/60">Amount Paid: </span>
                        <span className="text-green-400 font-semibold">
                          {formatINR(b.payment?.paidAmount ?? 0)}
                        </span>
                        {(b.payment?.remainingAmount ?? 0) > 0 && (
                          <span className="text-amber-300/80 ml-3">
                            Balance Due at Arrival: <strong>{formatINR(b.payment?.remainingAmount ?? 0)}</strong>
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => setSelectedBooking(b)}
                        className="text-[#B89A62] hover:text-[#D4B67E] transition-colors text-xs font-medium flex items-center gap-1 uppercase tracking-wider cursor-pointer"
                      >
                        <span>View Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Booking Detail Modal */}
      <AnimatePresence>
        {selectedBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#1C1A17] border border-[#B89A62]/30 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 space-y-6 shadow-2xl relative text-[#F5F1E8] custom-scrollbar"
            >
              <button
                onClick={() => setSelectedBooking(null)}
                className="absolute top-5 right-5 text-[#D8C7AD]/60 hover:text-[#F5F1E8] transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-[0.3em] text-[#B89A62] font-semibold">
                  Reservation Breakdown
                </span>
                <h2 className="font-serif-editorial text-2xl md:text-3xl font-light">
                  Booking #{selectedBooking.bookingId}
                </h2>
                <div className="flex items-center gap-2 pt-1">
                  {getStatusBadge(selectedBooking.status)}
                  {getPaymentBadge(selectedBooking.payment?.status)}
                </div>
              </div>

              <div className="space-y-4 border-t border-b border-[#B89A62]/15 py-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[#D8C7AD]/60 block">Guest Name</span>
                    <span className="text-[#F5F1E8] font-medium">{selectedBooking.guestName}</span>
                  </div>
                  <div>
                    <span className="text-[#D8C7AD]/60 block">Contact Email</span>
                    <span className="text-[#F5F1E8] font-medium">{selectedBooking.guestEmail}</span>
                  </div>
                  <div>
                    <span className="text-[#D8C7AD]/60 block">Contact Phone</span>
                    <span className="text-[#F5F1E8] font-medium">{selectedBooking.guestPhone}</span>
                  </div>
                  <div>
                    <span className="text-[#D8C7AD]/60 block">Guests</span>
                    <span className="text-[#F5F1E8] font-medium">{selectedBooking.numberOfGuests} Guests</span>
                  </div>
                </div>

                {selectedBooking.specialRequests && (
                  <div className="pt-2 border-t border-[#B89A62]/10">
                    <span className="text-[#D8C7AD]/60 block mb-1">Special Requests / Notes</span>
                    <p className="bg-[#12100E] p-3 text-[#D8C7AD]/90 rounded-none italic">
                      "{selectedBooking.specialRequests}"
                    </p>
                  </div>
                )}
              </div>

              {/* Nightly breakdown */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#B89A62]">
                  Nightly Breakdown
                </h3>
                <div className="space-y-1.5 bg-[#12100E] p-4 border border-[#B89A62]/10 text-xs">
                  {selectedBooking.nightlyBreakdown?.map((n) => (
                    <div key={n.date} className="flex justify-between text-[#D8C7AD]">
                      <span>{formatDisplayDate(n.date)}</span>
                      <span>{formatINR(n.price)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-medium text-[#F5F1E8] pt-2 border-t border-[#B89A62]/15 mt-2 text-sm">
                    <span>Total Stay Amount</span>
                    <span className="text-[#B89A62]">{formatINR(selectedBooking.totalAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#B89A62]">
                  Payment Status
                </h3>
                <div className="bg-[#12100E] p-4 border border-[#B89A62]/10 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#D8C7AD]/60">Payment Method</span>
                    <span className="text-[#F5F1E8] uppercase tracking-wider font-mono">
                      {selectedBooking.payment?.method || "offline"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#D8C7AD]/60">Amount Paid Online</span>
                    <span className="text-green-400 font-semibold">
                      {formatINR(selectedBooking.payment?.paidAmount ?? 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#D8C7AD]/60">Balance Due at Property</span>
                    <span className="text-[#F5F1E8] font-semibold">
                      {formatINR(selectedBooking.payment?.remainingAmount ?? 0)}
                    </span>
                  </div>

                  {selectedBooking.payment?.razorpayPaymentId && (
                    <div className="flex justify-between pt-2 border-t border-[#B89A62]/10 text-[11px]">
                      <span className="text-[#D8C7AD]/50">Razorpay Payment ID</span>
                      <span className="font-mono text-[#D8C7AD]">
                        {selectedBooking.payment.razorpayPaymentId}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="px-6 py-2.5 bg-[#B89A62] text-[#171513] text-xs font-semibold tracking-wider uppercase hover:bg-[#D4B67E] transition-all cursor-pointer"
                >
                  Close Window
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
