"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Users,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Loader2,
  AlertTriangle,
  ChevronLeft,
  CreditCard,
  Banknote,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import AvailabilityCalendar from "@/components/availability/AvailabilityCalendar";
import { formatDisplayDate, formatINR, countNights } from "@/lib/booking/dates";
import { calculatePaymentBreakdown } from "@/lib/booking/money";
import type { NightlyRate, PaymentMethod } from "@/lib/booking/types";

interface PublicPaymentConfig {
  enabled: boolean;
  provider: "razorpay";
  currency: "INR";
  methods: PaymentMethod[];
  keyId?: string;
  holdMinutes: number;
}

// ─── Step 1: Date selection via calendar ───────────────────────────────────────

function StepDates({
  onDatesSelected,
}: {
  onDatesSelected: (checkIn: string, checkOut: string, nights: number, breakdown: NightlyRate[], total: number) => void;
}) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCalendarSelected = useCallback(
    async (checkIn: string, checkOut: string) => {
      setIsPending(true);
      setError(null);
      try {
        const res = await fetch("/api/availability/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ checkIn, checkOut }),
        });
        const data = await res.json();

        if (data.code === "DATES_UNAVAILABLE") {
          setError("These dates are no longer available. Please choose different dates.");
          return;
        }
        if (data.code === "PRICE_NOT_CONFIGURED") {
          setError("Pricing is not set up for one or more nights in this range.");
          return;
        }
        if (!data.available) {
          setError(data.message || "Dates unavailable.");
          return;
        }

        const nights = countNights(checkIn, checkOut);
        onDatesSelected(checkIn, checkOut, nights, data.nightlyBreakdown, data.totalAmount);
      } catch {
        setError("Failed to verify dates. Please try again.");
      } finally {
        setIsPending(false);
      }
    },
    [onDatesSelected]
  );

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="font-serif-editorial text-2xl md:text-3xl text-[#F5F1E8] font-light">
          Select Your Dates
        </h2>
        <p className="text-xs text-[#D8C7AD]/70">
          Choose your check-in and check-out dates from the calendar below.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2 bg-red-900/20 border border-red-500/30 p-4 text-xs text-red-300 rounded-sm">
          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isPending && (
        <div className="flex items-center gap-2 text-[#B89A62] text-xs">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Verifying availability...</span>
        </div>
      )}

      <AvailabilityCalendar
        navigateToBooking={false}
        onBookingSelected={handleCalendarSelected}
      />
    </div>
  );
}

// ─── Step 2: Guest details ─────────────────────────────────────────────────────

interface GuestFormData {
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  numberOfGuests: number;
  specialRequests: string;
}

function StepGuests({
  onNext,
  onBack,
  initialData,
}: {
  onNext: (data: GuestFormData) => void;
  onBack: () => void;
  initialData?: GuestFormData | null;
}) {
  const [form, setForm] = useState<GuestFormData>(
    initialData || {
      guestName: "",
      guestEmail: "",
      guestPhone: "",
      numberOfGuests: 2,
      specialRequests: "",
    }
  );

  const isValid =
    form.guestName.trim().length >= 2 &&
    form.guestEmail.includes("@") &&
    form.guestPhone.trim().length >= 8 &&
    form.numberOfGuests >= 1;

  const inputClass =
    "w-full bg-[#12100E] border border-[#B89A62]/20 text-[#F5F1E8] text-xs px-3.5 py-3 focus:outline-none focus:border-[#B89A62] placeholder:text-[#F5F1E8]/20 transition-colors";

  return (
    <div className="space-y-8 max-w-xl mx-auto">
      <div className="space-y-2">
        <h2 className="font-serif-editorial text-2xl md:text-3xl text-[#F5F1E8] font-light">
          Guest Information
        </h2>
        <p className="text-xs text-[#D8C7AD]/70">
          Enter the primary guest details for this reservation.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-[#D8C7AD] mb-1.5">
            Full Name *
          </label>
          <input
            type="text"
            value={form.guestName}
            onChange={(e) => setForm((f) => ({ ...f, guestName: e.target.value }))}
            placeholder="John Doe"
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-[#D8C7AD] mb-1.5">
              Email Address *
            </label>
            <input
              type="email"
              value={form.guestEmail}
              onChange={(e) => setForm((f) => ({ ...f, guestEmail: e.target.value }))}
              placeholder="john@example.com"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-[#D8C7AD] mb-1.5">
              Phone Number *
            </label>
            <input
              type="tel"
              value={form.guestPhone}
              onChange={(e) => setForm((f) => ({ ...f, guestPhone: e.target.value }))}
              placeholder="+91 98765 43210"
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-wider text-[#D8C7AD] mb-1.5">
            Number of Guests *
          </label>
          <select
            value={form.numberOfGuests}
            onChange={(e) => setForm((f) => ({ ...f, numberOfGuests: Number(e.target.value) }))}
            className={inputClass}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <option key={n} value={n}>
                {n} Guest{n !== 1 ? "s" : ""}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-wider text-[#D8C7AD] mb-1.5">
            Special Requests / Notes
          </label>
          <textarea
            rows={3}
            value={form.specialRequests}
            onChange={(e) => setForm((f) => ({ ...f, specialRequests: e.target.value }))}
            placeholder="Dietary requirements, early check-in, airport transfer..."
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex justify-between items-center pt-2">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-[#D8C7AD]/60 hover:text-[#F5F1E8] transition-colors uppercase tracking-wider"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Change Dates
        </button>
        <button
          disabled={!isValid}
          onClick={() => onNext(form)}
          className="px-8 py-3.5 bg-[#B89A62] text-[#171513] text-xs font-semibold tracking-[0.2em] uppercase hover:bg-[#D4B67E] disabled:opacity-40 transition-all flex items-center gap-2"
        >
          <span>Select Payment</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ─── Step 3: Review & Payment Options ───────────────────────────────────────────

function StepReview({
  checkIn,
  checkOut,
  nights,
  breakdown,
  totalAmount,
  guest,
  paymentConfig,
  selectedMethod,
  onSelectMethod,
  onBack,
  onConfirm,
  isSubmitting,
  isVerifying,
  submitError,
  heldUntil,
}: {
  checkIn: string;
  checkOut: string;
  nights: number;
  breakdown: NightlyRate[];
  totalAmount: number;
  guest: GuestFormData;
  paymentConfig: PublicPaymentConfig | null;
  selectedMethod: PaymentMethod;
  onSelectMethod: (method: PaymentMethod) => void;
  onBack: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
  isVerifying: boolean;
  submitError: string | null;
  heldUntil?: string | null;
}) {
  const rowClass = "flex justify-between py-2.5 border-b border-[#B89A62]/10 text-xs";
  const enabledMethods = paymentConfig?.methods || ["pay_later"];

  const currentBreakdown = calculatePaymentBreakdown(totalAmount, selectedMethod);

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="space-y-2">
        <h2 className="font-serif-editorial text-2xl md:text-3xl text-[#F5F1E8] font-light">
          Review & Payment
        </h2>
        <p className="text-xs text-[#D8C7AD]/70">
          Review your reservation and choose your preferred payment option.
        </p>
      </div>

      {/* Info banner for online payment */}
      {(selectedMethod === "advance" || selectedMethod === "full") && (
        <div className="bg-[#1C1A17] border border-[#B89A62]/20 p-3.5 flex items-center gap-2.5 text-xs text-[#D8C7AD]">
          <ShieldCheck className="w-4 h-4 text-[#B89A62] shrink-0" />
          <span>
            Your dates are confirmed and reserved only after payment is completed.
          </span>
        </div>
      )}

      {/* Stay details summary */}
      <div className="bg-[#12100E] border border-[#B89A62]/20 p-6 space-y-0">
        <div className={rowClass}>
          <span className="text-[#D8C7AD]/60">Property</span>
          <span className="text-[#F5F1E8]">Royal Palace Home Stay (Entire Property)</span>
        </div>
        <div className={rowClass}>
          <span className="text-[#D8C7AD]/60">Check-in</span>
          <span className="text-[#F5F1E8]">{formatDisplayDate(checkIn)}</span>
        </div>
        <div className={rowClass}>
          <span className="text-[#D8C7AD]/60">Check-out</span>
          <span className="text-[#F5F1E8]">{formatDisplayDate(checkOut)}</span>
        </div>
        <div className={rowClass}>
          <span className="text-[#D8C7AD]/60">Duration</span>
          <span className="text-[#F5F1E8]">{nights} night{nights !== 1 ? "s" : ""}</span>
        </div>
        <div className={rowClass}>
          <span className="text-[#D8C7AD]/60">Guest</span>
          <span className="text-[#F5F1E8]">
            {guest.guestName} ({guest.numberOfGuests} guests)
          </span>
        </div>

        {/* Nightly Breakdown */}
        <div className="pt-3 space-y-1.5">
          <p className="text-[9px] uppercase tracking-wider text-[#D8C7AD]/50 mb-2">
            Nightly Breakdown
          </p>
          {breakdown.map((n) => (
            <div key={n.date} className="flex justify-between text-xs text-[#D8C7AD]/70">
              <span>{formatDisplayDate(n.date)}</span>
              <span>{formatINR(n.price)}</span>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="flex justify-between items-center pt-4 mt-2 border-t border-[#B89A62]/20">
          <span className="text-sm uppercase tracking-widest text-[#D8C7AD]">Total Stay Amount</span>
          <span className="font-serif-editorial text-2xl text-[#B89A62]">
            {formatINR(totalAmount)}
          </span>
        </div>
      </div>

      {/* Payment Options Selection */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-[#B89A62]" />
          <h3 className="text-xs font-semibold uppercase tracking-widest text-[#F5F1E8]">
            Select Payment Option
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {/* ADVANCE OPTION */}
          {enabledMethods.includes("advance") && (
            <div
              onClick={() => onSelectMethod("advance")}
              className={`cursor-pointer p-4 border transition-all flex items-start justify-between ${
                selectedMethod === "advance"
                  ? "bg-[#1C1A17] border-[#B89A62] shadow-lg"
                  : "bg-[#12100E] border-[#B89A62]/20 hover:border-[#B89A62]/40"
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  checked={selectedMethod === "advance"}
                  onChange={() => onSelectMethod("advance")}
                  className="mt-1 accent-[#B89A62]"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#F5F1E8] uppercase tracking-wider">
                      Pay 50% Advance
                    </span>
                    <span className="text-[9px] px-2 py-0.5 bg-[#B89A62]/20 text-[#B89A62] uppercase tracking-wider">
                      Popular
                    </span>
                  </div>
                  <p className="text-xs text-[#D8C7AD]/70 mt-1">
                    Pay {formatINR(calculatePaymentBreakdown(totalAmount, "advance").requiredAmount)} now online.
                  </p>
                  <p className="text-[11px] text-[#D8C7AD]/50 mt-0.5">
                    Remaining {formatINR(calculatePaymentBreakdown(totalAmount, "advance").remainingAmount)} due at property.
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-serif-editorial text-lg text-[#B89A62]">
                  {formatINR(calculatePaymentBreakdown(totalAmount, "advance").requiredAmount)}
                </span>
                <span className="block text-[9px] text-[#D8C7AD]/50 uppercase tracking-widest">Now</span>
              </div>
            </div>
          )}

          {/* FULL OPTION */}
          {enabledMethods.includes("full") && (
            <div
              onClick={() => onSelectMethod("full")}
              className={`cursor-pointer p-4 border transition-all flex items-start justify-between ${
                selectedMethod === "full"
                  ? "bg-[#1C1A17] border-[#B89A62] shadow-lg"
                  : "bg-[#12100E] border-[#B89A62]/20 hover:border-[#B89A62]/40"
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  checked={selectedMethod === "full"}
                  onChange={() => onSelectMethod("full")}
                  className="mt-1 accent-[#B89A62]"
                />
                <div>
                  <span className="text-xs font-semibold text-[#F5F1E8] uppercase tracking-wider">
                    Pay in Full (100%)
                  </span>
                  <p className="text-xs text-[#D8C7AD]/70 mt-1">
                    Pay full stay of {formatINR(totalAmount)} now online via Razorpay.
                  </p>
                  <p className="text-[11px] text-green-400/70 mt-0.5">
                    Zero balance due upon check-in.
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-serif-editorial text-lg text-[#B89A62]">
                  {formatINR(totalAmount)}
                </span>
                <span className="block text-[9px] text-[#D8C7AD]/50 uppercase tracking-widest">Now</span>
              </div>
            </div>
          )}

          {/* PAY LATER OPTION */}
          {enabledMethods.includes("pay_later") && (
            <div
              onClick={() => onSelectMethod("pay_later")}
              className={`cursor-pointer p-4 border transition-all flex items-start justify-between ${
                selectedMethod === "pay_later"
                  ? "bg-[#1C1A17] border-[#B89A62] shadow-lg"
                  : "bg-[#12100E] border-[#B89A62]/20 hover:border-[#B89A62]/40"
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  checked={selectedMethod === "pay_later"}
                  onChange={() => onSelectMethod("pay_later")}
                  className="mt-1 accent-[#B89A62]"
                />
                <div>
                  <span className="text-xs font-semibold text-[#F5F1E8] uppercase tracking-wider">
                    Pay at Property
                  </span>
                  <p className="text-xs text-[#D8C7AD]/70 mt-1">
                    Pay nothing online today.
                  </p>
                  <p className="text-[11px] text-[#D8C7AD]/50 mt-0.5">
                    Pay full {formatINR(totalAmount)} on arrival at Royal Palace.
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-serif-editorial text-lg text-[#F5F1E8]">₹0</span>
                <span className="block text-[9px] text-[#D8C7AD]/50 uppercase tracking-widest">Now</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {submitError && (
        <div className="flex items-start gap-2 bg-red-900/20 border border-red-500/30 p-4 text-xs text-red-300">
          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <motion.button
          onClick={onConfirm}
          disabled={isSubmitting || isVerifying}
          whileHover={!isSubmitting && !isVerifying ? { scale: 1.005 } : {}}
          whileTap={!isSubmitting && !isVerifying ? { scale: 0.998 } : {}}
          className="w-full py-4 bg-[#B89A62] text-[#171513] text-xs font-semibold tracking-[0.25em] uppercase hover:bg-[#D4B67E] disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-xl"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>
                {selectedMethod === "pay_later"
                  ? "Confirming Reservation..."
                  : "Connecting to Razorpay..."}
              </span>
            </>
          ) : isVerifying ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verifying Payment...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              <span>
                {selectedMethod === "advance"
                  ? `Pay 50% Advance (${formatINR(currentBreakdown.requiredAmount)})`
                  : selectedMethod === "full"
                  ? `Pay Full Amount (${formatINR(totalAmount)})`
                  : "Confirm & Pay on Arrival"}
              </span>
            </>
          )}
        </motion.button>

        <div className="flex justify-between items-center text-[11px]">
          <button
            onClick={onBack}
            className="text-[#D8C7AD]/60 hover:text-[#D8C7AD] transition-colors flex items-center gap-1"
          >
            <ChevronLeft className="w-3 h-3" />
            Edit Guest Info
          </button>
          <span className="text-[#D8C7AD]/40 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-[#B89A62]" />
            Best Rate Guaranteed • Direct Homestay Booking
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Main booking flow ─────────────────────────────────────────────────────────

type Step = "dates" | "guests" | "review";

function BookingFlowContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [step, setStep] = useState<Step>("dates");

  // Step 1: Dates & price
  const [checkIn, setCheckIn] = useState<string | null>(null);
  const [checkOut, setCheckOut] = useState<string | null>(null);
  const [nights, setNights] = useState(0);
  const [breakdown, setBreakdown] = useState<NightlyRate[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);

  // Step 2: Guest info
  const [guestData, setGuestData] = useState<GuestFormData | null>(null);

  // Payment configuration & state
  const [paymentConfig, setPaymentConfig] = useState<PublicPaymentConfig | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("advance");

  // Progress states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Fetch payment config on load
  useEffect(() => {
    fetch("/api/payments/config")
      .then((res) => res.json())
      .then((data: PublicPaymentConfig) => {
        setPaymentConfig(data);
        if (data.methods && data.methods.length > 0) {
          setSelectedMethod(data.methods[0]);
        }
      })
      .catch((err) => console.error("Error loading payment config:", err));
  }, []);

  // Pre-fill from URL params
  const urlCheckIn = searchParams.get("checkIn");
  const urlCheckOut = searchParams.get("checkOut");

  useEffect(() => {
    if (urlCheckIn && urlCheckOut && urlCheckIn < urlCheckOut) {
      const verify = async () => {
        try {
          const res = await fetch("/api/availability/check", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ checkIn: urlCheckIn, checkOut: urlCheckOut }),
          });
          const data = await res.json();
          if (data.success && data.available) {
            setCheckIn(urlCheckIn);
            setCheckOut(urlCheckOut);
            setNights(countNights(urlCheckIn, urlCheckOut));
            setBreakdown(data.nightlyBreakdown);
            setTotalAmount(data.totalAmount);
            setStep("guests");
          }
        } catch {
          // Start from dates step
        }
      };
      verify();
    }
  }, [urlCheckIn, urlCheckOut]);

  // Load Razorpay checkout script dynamically
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window === "undefined") return resolve(false);
      if ((window as any).Razorpay) return resolve(true);

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleDatesSelected = (ci: string, co: string, n: number, bd: NightlyRate[], total: number) => {
    setCheckIn(ci);
    setCheckOut(co);
    setNights(n);
    setBreakdown(bd);
    setTotalAmount(total);
    setStep("guests");
  };

  const handleGuestNext = (data: GuestFormData) => {
    setGuestData(data);
    setStep("review");
  };

  const handleConfirm = async () => {
    if (!checkIn || !checkOut || !guestData) return;
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // SCENARIO 1: PAY AT PROPERTY — confirm immediately, no payment gateway
      if (selectedMethod === "pay_later") {
        const res = await fetch("/api/bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            checkIn,
            checkOut,
            guestName: guestData.guestName,
            guestEmail: guestData.guestEmail,
            guestPhone: guestData.guestPhone,
            numberOfGuests: guestData.numberOfGuests,
            specialRequests: guestData.specialRequests || undefined,
            paymentMethod: "pay_later",
          }),
        });

        const data = await res.json();
        if (!data.success) {
          if (data.code === "DATES_UNAVAILABLE") {
            setSubmitError("These dates have just been booked by another guest. Please select different dates.");
            setTimeout(() => {
              setStep("dates");
              setCheckIn(null);
              setCheckOut(null);
            }, 2000);
          } else {
            setSubmitError(data.message || "Failed to create reservation.");
          }
          setIsSubmitting(false);
          return;
        }

        router.push(`/booking/confirmation/${data.bookingId}`);
        return;
      }

      // SCENARIO 2: ONLINE PAYMENT (Advance 50% or Full 100%)
      // Dates are NOT held in the database. We create the Razorpay order first,
      // and the booking is ONLY saved to MongoDB after payment is verified.

      // Step 1: Load Razorpay checkout script
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        setSubmitError("Unable to load Razorpay payment gateway. Please check your internet connection.");
        setIsSubmitting(false);
        return;
      }

      // Step 2: Create Razorpay order server-side (pass guest+date data; no booking created yet)
      const orderRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checkIn,
          checkOut,
          guestName: guestData.guestName,
          guestEmail: guestData.guestEmail,
          guestPhone: guestData.guestPhone,
          numberOfGuests: guestData.numberOfGuests,
          specialRequests: guestData.specialRequests || undefined,
          paymentMethod: selectedMethod,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderData.success) {
        if (orderData.code === "DATES_UNAVAILABLE") {
          setSubmitError("These dates are no longer available. Please select different dates.");
          setTimeout(() => {
            setStep("dates");
            setCheckIn(null);
            setCheckOut(null);
          }, 2000);
        } else {
          setSubmitError(orderData.message || "Failed to create payment order.");
        }
        setIsSubmitting(false);
        return;
      }

      // Step 3: Open Razorpay Checkout modal
      // We snapshot guest+date data here so the handler closure captures it correctly
      const guestSnapshot = { ...guestData };
      const datesSnapshot = { checkIn, checkOut };

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "Royal Palace Home Stay",
        description:
          selectedMethod === "advance"
            ? "50% Advance Homestay Reservation"
            : "Full Homestay Reservation Payment",
        order_id: orderData.orderId,
        handler: async function (response: any) {
          // Step 4: Verify payment + atomically create confirmed booking in one shot
          setIsVerifying(true);
          try {
            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                bookingData: {
                  checkIn: datesSnapshot.checkIn,
                  checkOut: datesSnapshot.checkOut,
                  guestName: guestSnapshot.guestName,
                  guestEmail: guestSnapshot.guestEmail,
                  guestPhone: guestSnapshot.guestPhone,
                  numberOfGuests: guestSnapshot.numberOfGuests,
                  specialRequests: guestSnapshot.specialRequests || undefined,
                  paymentMethod: selectedMethod,
                },
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              // Redirect using the bookingId returned by verify (created in DB now)
              router.push(`/booking/confirmation/${verifyData.bookingId}`);
            } else if (verifyData.code === "DATES_UNAVAILABLE") {
              setSubmitError(
                "Your payment was captured but these dates were just booked by someone else. Our team will contact you immediately to arrange a full refund."
              );
            } else {
              setSubmitError(
                verifyData.message || "Payment verification failed. If you were charged, our team will confirm your stay within minutes."
              );
            }
          } catch {
            setSubmitError(
              "Connection interrupted during verification. If payment was deducted, your stay will be confirmed shortly — check your email."
            );
          } finally {
            setIsVerifying(false);
            setIsSubmitting(false);
          }
        },
        modal: {
          ondismiss: function () {
            setIsSubmitting(false);
            setSubmitError(null); // No hold exists — just let them try again
          },
        },
        prefill: {
          name: guestData.guestName,
          email: guestData.guestEmail,
          contact: guestData.guestPhone,
        },
        theme: {
          color: "#B89A62",
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.on("payment.failed", function (failResponse: any) {
        setIsSubmitting(false);
        setSubmitError(
          `Payment failed: ${failResponse.error?.description || "Transaction declined"}. No charges were made — you may try again.`
        );
      });

      razorpay.open();
    } catch {
      setSubmitError("An error occurred during booking. Please try again.");
      setIsSubmitting(false);
    }
  };

  const stepNumber = step === "dates" ? 1 : step === "guests" ? 2 : 3;

  return (
    <div className="pt-28 md:pt-32 pb-24 bg-[#171513] text-[#F5F1E8] min-h-screen">
      <div className="max-w-6xl mx-auto px-6 md:px-12 space-y-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <span className="text-[10px] uppercase tracking-[0.4em] text-[#B89A62] font-semibold">
            Royal Palace • Varkala
          </span>
          <h1 className="font-serif-editorial text-4xl md:text-5xl font-light">
            Reserve Your Private Stay
          </h1>
        </div>

        {/* Step indicator */}
        <div className="flex justify-center items-center gap-3 border-b border-[#B89A62]/15 pb-6 text-[10px] uppercase tracking-[0.2em]">
          {(["dates", "guests", "review"] as Step[]).map((s, i) => {
            const num = i + 1;
            const isActive = stepNumber === num;
            const isDone = stepNumber > num;
            return (
              <span
                key={s}
                className={`flex items-center gap-1.5 ${
                  isActive
                    ? "text-[#B89A62] font-semibold"
                    : isDone
                    ? "text-[#D8C7AD]/50"
                    : "text-[#D8C7AD]/30"
                }`}
              >
                {isDone && <CheckCircle2 className="w-3 h-3" />}
                {num}.{" "}
                {s === "dates"
                  ? "Select Dates"
                  : s === "guests"
                  ? "Guest Details"
                  : "Review & Pay"}
                {i < 2 && <span className="ml-3 text-[#B89A62]/20">—</span>}
              </span>
            );
          })}
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          {step === "dates" && (
            <motion.div
              key="step-dates"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <StepDates onDatesSelected={handleDatesSelected} />
            </motion.div>
          )}

          {step === "guests" && checkIn && checkOut && (
            <motion.div
              key="step-guests"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <StepGuests
                initialData={guestData}
                onNext={handleGuestNext}
                onBack={() => setStep("dates")}
              />
            </motion.div>
          )}

          {step === "review" && checkIn && checkOut && guestData && (
            <motion.div
              key="step-review"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <StepReview
                checkIn={checkIn}
                checkOut={checkOut}
                nights={nights}
                breakdown={breakdown}
                totalAmount={totalAmount}
                guest={guestData}
                paymentConfig={paymentConfig}
                selectedMethod={selectedMethod}
                onSelectMethod={setSelectedMethod}
                onBack={() => setStep("guests")}
                onConfirm={handleConfirm}
                isSubmitting={isSubmitting}
                isVerifying={isVerifying}
                submitError={submitError}
                heldUntil={null}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense
      fallback={
        <div className="pt-32 pb-24 min-h-screen bg-[#171513] flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-[#B89A62]" />
        </div>
      }
    >
      <BookingFlowContent />
    </Suspense>
  );
}
