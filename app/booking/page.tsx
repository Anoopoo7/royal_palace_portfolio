"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Users, CheckCircle2, ShieldCheck, ArrowRight, Loader2, AlertTriangle, ChevronLeft } from "lucide-react";
import AvailabilityCalendar from "@/components/availability/AvailabilityCalendar";
import { formatDisplayDate, formatINR, countNights } from "@/lib/booking/dates";
import type { NightlyRate } from "@/lib/booking/types";

// ─── Step 1: Date selection via calendar ───────────────────────────────────────

function StepDates({
  onDatesSelected,
}: {
  onDatesSelected: (checkIn: string, checkOut: string, nights: number, breakdown: NightlyRate[], total: number) => void;
}) {
  // We receive dates from the AvailabilityCalendar callback
  // Then fetch pricing and advance
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
  checkIn,
  checkOut,
  nights,
  breakdown,
  totalAmount,
  onBack,
  onNext,
}: {
  checkIn: string;
  checkOut: string;
  nights: number;
  breakdown: NightlyRate[];
  totalAmount: number;
  onBack: () => void;
  onNext: (data: GuestFormData) => void;
}) {
  const [form, setForm] = useState<GuestFormData>({
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    numberOfGuests: 2,
    specialRequests: "",
  });

  const isValid = form.guestName.trim().length >= 2 && form.guestEmail.includes("@") && form.guestPhone.trim().length >= 8;

  const inputClass =
    "w-full bg-[#12100E] border border-[#B89A62]/20 text-xs px-3.5 py-3 text-[#F5F1E8] focus:outline-none focus:border-[#B89A62] placeholder:text-[#F5F1E8]/20 transition-colors";

  return (
    <div className="space-y-8 max-w-2xl m-auto">
      {/* Stay summary */}
      <div className="bg-[#12100E] border border-[#B89A62]/15 p-5 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        <div>
          <p className="text-[#D8C7AD]/50 uppercase tracking-wider mb-1">Check-in</p>
          <p className="text-[#F5F1E8]">{formatDisplayDate(checkIn)}</p>
        </div>
        <div>
          <p className="text-[#D8C7AD]/50 uppercase tracking-wider mb-1">Check-out</p>
          <p className="text-[#F5F1E8]">{formatDisplayDate(checkOut)}</p>
        </div>
        <div>
          <p className="text-[#D8C7AD]/50 uppercase tracking-wider mb-1">Nights</p>
          <p className="text-[#F5F1E8]">{nights}</p>
        </div>
        <div>
          <p className="text-[#D8C7AD]/50 uppercase tracking-wider mb-1">Total</p>
          <p className="text-[#B89A62] font-semibold">{formatINR(totalAmount)}</p>
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="font-serif-editorial text-2xl md:text-3xl text-[#F5F1E8] font-light">
          Guest Details
        </h2>
        <p className="text-xs text-[#D8C7AD]/70">
          Please provide your contact information for the reservation.
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
            placeholder="e.g. Eleanor Vance"
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-[#D8C7AD] mb-1.5">
              Email Address *
            </label>
            <input
              type="email"
              value={form.guestEmail}
              onChange={(e) => setForm((f) => ({ ...f, guestEmail: e.target.value }))}
              placeholder="you@example.com"
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
          <span>Review Reservation</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ─── Step 3: Review & Confirm ──────────────────────────────────────────────────

function StepReview({
  checkIn,
  checkOut,
  nights,
  breakdown,
  totalAmount,
  guest,
  onBack,
  onConfirm,
  isSubmitting,
  submitError,
}: {
  checkIn: string;
  checkOut: string;
  nights: number;
  breakdown: NightlyRate[];
  totalAmount: number;
  guest: GuestFormData;
  onBack: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
  submitError: string | null;
}) {
  const rowClass = "flex justify-between py-2.5 border-b border-[#B89A62]/10 text-xs";

  return (
    <div className="space-y-8 max-w-2xl m-auto">
      <div className="space-y-2">
        <h2 className="font-serif-editorial text-2xl md:text-3xl text-[#F5F1E8] font-light">
          Review & Confirm
        </h2>
        <p className="text-xs text-[#D8C7AD]/70">
          Please review your reservation details before confirming.
        </p>
      </div>

      <div className="bg-[#12100E] border border-[#B89A62]/20 p-6 space-y-0">
        {/* Stay */}
        <div className={rowClass}>
          <span className="text-[#D8C7AD]/60">Property</span>
          <span className="text-[#F5F1E8]">Royal Palace Home Stay</span>
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

        {/* Guest */}
        <div className={rowClass}>
          <span className="text-[#D8C7AD]/60">Primary Guest</span>
          <span className="text-[#F5F1E8]">{guest.guestName}</span>
        </div>
        <div className={rowClass}>
          <span className="text-[#D8C7AD]/60">Email</span>
          <span className="text-[#F5F1E8]">{guest.guestEmail}</span>
        </div>
        <div className={rowClass}>
          <span className="text-[#D8C7AD]/60">Phone</span>
          <span className="text-[#F5F1E8]">{guest.guestPhone}</span>
        </div>
        <div className={rowClass}>
          <span className="text-[#D8C7AD]/60">Guests</span>
          <span className="text-[#F5F1E8]">{guest.numberOfGuests}</span>
        </div>

        {/* Price breakdown */}
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
          <span className="text-sm uppercase tracking-widest text-[#D8C7AD]">Total Amount Due</span>
          <span className="font-serif-editorial text-2xl text-[#B89A62]">
            {formatINR(totalAmount)}
          </span>
        </div>
      </div>

      {submitError && (
        <div className="flex items-start gap-2 bg-red-900/20 border border-red-500/30 p-4 text-xs text-red-300">
          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <motion.button
          onClick={onConfirm}
          disabled={isSubmitting}
          whileHover={!isSubmitting ? { scale: 1.005 } : {}}
          whileTap={!isSubmitting ? { scale: 0.998 } : {}}
          className="w-full py-4 bg-[#B89A62] text-[#171513] text-xs font-semibold tracking-[0.25em] uppercase hover:bg-[#D4B67E] disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-xl"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Confirming Reservation...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm Reservation</span>
            </>
          )}
        </motion.button>

        <div className="flex justify-between text-[11px]">
          <button onClick={onBack} className="text-[#D8C7AD]/60 hover:text-[#D8C7AD] transition-colors flex items-center gap-1">
            <ChevronLeft className="w-3 h-3" />
            Edit Guest Info
          </button>
          <span className="text-[#D8C7AD]/40 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#B89A62]" />
            Pay on arrival
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

  // Data from step 1
  const [checkIn, setCheckIn] = useState<string | null>(null);
  const [checkOut, setCheckOut] = useState<string | null>(null);
  const [nights, setNights] = useState(0);
  const [breakdown, setBreakdown] = useState<NightlyRate[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);

  // Data from step 2
  const [guestData, setGuestData] = useState<GuestFormData | null>(null);

  // Submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Pre-fill from URL params (e.g. from /availability page)
  const urlCheckIn = searchParams.get("checkIn");
  const urlCheckOut = searchParams.get("checkOut");

  useEffect(() => {
    if (urlCheckIn && urlCheckOut && urlCheckIn < urlCheckOut) {
      // Pre-validate the dates from URL
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
          // silently fail — user starts from dates step
        }
      };
      verify();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        }),
      });

      const data = await res.json();

      if (!data.success) {
        if (data.code === "DATES_UNAVAILABLE") {
          setSubmitError(
            "These dates have just been booked by another guest. Please select different dates."
          );
          // Reset to date selection
          setTimeout(() => {
            setStep("dates");
            setCheckIn(null);
            setCheckOut(null);
            setBreakdown([]);
            setTotalAmount(0);
          }, 2000);
        } else {
          setSubmitError(data.message || "Failed to create reservation. Please try again.");
        }
        return;
      }

      router.push(`/booking/confirmation/${data.bookingId}`);
    } catch {
      setSubmitError("A network error occurred. Please check your connection and try again.");
    } finally {
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
                className={`flex items-center gap-1.5 ${isActive
                  ? "text-[#B89A62] font-semibold"
                  : isDone
                    ? "text-[#D8C7AD]/50"
                    : "text-[#D8C7AD]/30"
                  }`}
              >
                {isDone && <CheckCircle2 className="w-3 h-3" />}
                {num}.{" "}
                {s === "dates" ? "Select Dates" : s === "guests" ? "Guest Details" : "Confirm"}
                {i < 2 && <span className="ml-3 text-[#B89A62]/20">—</span>}
              </span>
            );
          })}
        </div>

        {/* Steps */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {step === "dates" && <StepDates onDatesSelected={handleDatesSelected} />}

            {step === "guests" && checkIn && checkOut && (
              <StepGuests
                checkIn={checkIn}
                checkOut={checkOut}
                nights={nights}
                breakdown={breakdown}
                totalAmount={totalAmount}
                onBack={() => setStep("dates")}
                onNext={handleGuestNext}
              />
            )}

            {step === "review" && checkIn && checkOut && guestData && (
              <StepReview
                checkIn={checkIn}
                checkOut={checkOut}
                nights={nights}
                breakdown={breakdown}
                totalAmount={totalAmount}
                guest={guestData}
                onBack={() => setStep("guests")}
                onConfirm={handleConfirm}
                isSubmitting={isSubmitting}
                submitError={submitError}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense
      fallback={
        <div className="pt-32 pb-24 flex items-center justify-center text-[#B89A62]">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span className="text-xs uppercase tracking-widest">Loading booking system...</span>
        </div>
      }
    >
      <BookingFlowContent />
    </Suspense>
  );
}
