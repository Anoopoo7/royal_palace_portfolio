"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCw } from "lucide-react";
import CalendarMonth from "./CalendarMonth";
import BookingSummary from "./BookingSummary";
import AvailabilityLegend from "./AvailabilityLegend";
import type { AvailabilityDay, NightlyRate } from "@/lib/booking/types";
import { countNights, todayDateStr, addDaysToDateStr } from "@/lib/booking/dates";

// Show 3 months at a time on desktop, 2 on tablet, 1 on mobile
const MONTHS_TO_LOAD = 4; // load 4 months of data at once

interface AvailabilityCalendarProps {
  /** Called with checkIn+checkOut when user clicks "Continue to Booking" */
  onBookingSelected?: (checkIn: string, checkOut: string) => void;
  /** If true, use router.push to go to booking page */
  navigateToBooking?: boolean;
}

interface MonthKey {
  year: number;
  month: number; // 1-12
}

function getMonthKeys(startYear: number, startMonth: number, count: number): MonthKey[] {
  const keys: MonthKey[] = [];
  for (let i = 0; i < count; i++) {
    const totalMonth = startMonth - 1 + i;
    keys.push({
      year: startYear + Math.floor(totalMonth / 12),
      month: (totalMonth % 12) + 1,
    });
  }
  return keys;
}

export default function AvailabilityCalendar({
  onBookingSelected,
  navigateToBooking = true,
}: AvailabilityCalendarProps) {
  const router = useRouter();
  const today = todayDateStr();

  // Visible months
  const [currentMonthOffset, setCurrentMonthOffset] = useState(0);
  const [direction, setDirection] = useState(1);

  // Calendar data
  const [days, setDays] = useState<AvailabilityDay[]>([]);
  const [isLoadingCalendar, setIsLoadingCalendar] = useState(true);
  const [calendarError, setCalendarError] = useState<string | null>(null);

  // Selection state
  const [checkIn, setCheckIn] = useState<string | null>(null);
  const [checkOut, setCheckOut] = useState<string | null>(null);
  const [isSelecting, setIsSelecting] = useState(false); // waiting for check-out
  const [hoverDate, setHoverDate] = useState<string | null>(null);

  // Pricing check
  const [breakdown, setBreakdown] = useState<NightlyRate[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [isLoadingPricing, setIsLoadingPricing] = useState(false);
  const [pricingError, setPricingError] = useState<string | null>(null);

  const pricingAbortRef = useRef<AbortController | null>(null);

  // Compute the start month based on offset
  const now = new Date();
  const baseYear = now.getFullYear();
  const baseMonth = now.getMonth() + 1;
  const totalMonthOffset = baseMonth - 1 + currentMonthOffset;
  const visibleYear = baseYear + Math.floor(totalMonthOffset / 12);
  const visibleMonth = (totalMonthOffset % 12) + 1;

  const visibleMonths = getMonthKeys(visibleYear, visibleMonth, 2); // show 2 months

  // Determine from/to for data fetch
  const dataFrom = `${visibleYear}-${String(visibleMonth).padStart(2, "0")}-01`;
  const dataTo = (() => {
    const endKeys = getMonthKeys(visibleYear, visibleMonth, MONTHS_TO_LOAD);
    const last = endKeys[endKeys.length - 1];
    const lastDay = new Date(last.year, last.month, 0).getDate();
    return `${last.year}-${String(last.month).padStart(2, "0")}-${lastDay}`;
  })();

  // Fetch calendar data
  const fetchCalendar = useCallback(async () => {
    setIsLoadingCalendar(true);
    setCalendarError(null);
    try {
      const res = await fetch(`/api/availability?from=${dataFrom}&to=${dataTo}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to load availability");
      }
      setDays(data.days as AvailabilityDay[]);
    } catch (e) {
      setCalendarError(e instanceof Error ? e.message : "Failed to load calendar");
    } finally {
      setIsLoadingCalendar(false);
    }
  }, [dataFrom, dataTo]);

  useEffect(() => {
    fetchCalendar();
  }, [fetchCalendar]);

  // Fetch pricing when both dates selected
  const fetchPricing = useCallback(async (ci: string, co: string) => {
    if (pricingAbortRef.current) pricingAbortRef.current.abort();
    const controller = new AbortController();
    pricingAbortRef.current = controller;

    setIsLoadingPricing(true);
    setPricingError(null);
    setBreakdown([]);
    setTotalAmount(0);

    try {
      const res = await fetch("/api/availability/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checkIn: ci, checkOut: co }),
        signal: controller.signal,
      });
      const data = await res.json();

      if (data.code === "DATES_UNAVAILABLE") {
        setPricingError("These dates are unavailable. Please select different dates.");
      } else if (data.code === "PRICE_NOT_CONFIGURED") {
        setPricingError("Pricing is not available for one or more nights in this range.");
      } else if (data.success && data.available) {
        setBreakdown(data.nightlyBreakdown);
        setTotalAmount(data.totalAmount);
      } else {
        setPricingError(data.message || "Could not check pricing.");
      }
    } catch (e) {
      if ((e as { name?: string }).name !== "AbortError") {
        setPricingError("Failed to calculate pricing. Please try again.");
      }
    } finally {
      setIsLoadingPricing(false);
    }
  }, []);

  useEffect(() => {
    if (checkIn && checkOut && checkIn < checkOut) {
      fetchPricing(checkIn, checkOut);
    } else {
      setBreakdown([]);
      setTotalAmount(0);
      setPricingError(null);
    }
  }, [checkIn, checkOut, fetchPricing]);

  // Day click handler
  const handleDayClick = useCallback(
    (date: string) => {
      if (!isSelecting) {
        // First click = check-in
        setCheckIn(date);
        setCheckOut(null);
        setIsSelecting(true);
        setBreakdown([]);
        setTotalAmount(0);
        setPricingError(null);
      } else {
        // Second click = check-out
        if (date <= checkIn!) {
          // Clicked before or on check-in → reset to new check-in
          setCheckIn(date);
          setCheckOut(null);
        } else {
          setCheckOut(date);
          setIsSelecting(false);
        }
      }
    },
    [isSelecting, checkIn]
  );

  const handleDayHover = useCallback((date: string) => {
    setHoverDate(date);
  }, []);

  const handleClear = useCallback(() => {
    setCheckIn(null);
    setCheckOut(null);
    setIsSelecting(false);
    setHoverDate(null);
    setBreakdown([]);
    setTotalAmount(0);
    setPricingError(null);
  }, []);

  const handleContinue = useCallback(() => {
    if (!checkIn || !checkOut) return;
    if (onBookingSelected) {
      onBookingSelected(checkIn, checkOut);
    } else if (navigateToBooking) {
      router.push(`/booking?checkIn=${checkIn}&checkOut=${checkOut}`);
    }
  }, [checkIn, checkOut, onBookingSelected, navigateToBooking, router]);

  const nights = checkIn && checkOut ? countNights(checkIn, checkOut) : 0;

  // Get days for a specific month
  const getDaysForMonth = (year: number, month: number): AvailabilityDay[] => {
    const prefix = `${year}-${String(month).padStart(2, "0")}-`;
    return days.filter((d) => d.date.startsWith(prefix));
  };

  const handlePrev = () => {
    if (currentMonthOffset > 0) {
      setDirection(-1);
      setCurrentMonthOffset((o) => o - 1);
    }
  };

  const handleNext = () => {
    setDirection(1);
    setCurrentMonthOffset((o) => o + 1);
  };

  return (
    <div className="space-y-6">
      {/* Status bar */}
      {isLoadingCalendar && (
        <div className="flex items-center gap-2 text-[#B89A62] text-xs py-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span className="uppercase tracking-widest">Loading availability...</span>
        </div>
      )}

      {calendarError && (
        <div className="flex items-center justify-between bg-red-900/20 border border-red-500/30 px-4 py-3 text-xs text-red-300">
          <span>{calendarError}</span>
          <button onClick={fetchCalendar} className="flex items-center gap-1 hover:text-white ml-4">
            <RefreshCw className="w-3 h-3" />
            Retry
          </button>
        </div>
      )}

      {/* Instruction */}
      <div className="text-center text-xs text-[#D8C7AD]/60 tracking-wider">
        {!checkIn && "Select your check-in date"}
        {checkIn && !checkOut && "Now select your check-out date"}
        {checkIn && checkOut && `${nights} night${nights !== 1 ? "s" : ""} selected`}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {visibleMonths.map((mk, idx) => (
          <CalendarMonth
            key={`${mk.year}-${mk.month}`}
            year={mk.year}
            month={mk.month}
            days={getDaysForMonth(mk.year, mk.month)}
            checkIn={checkIn}
            checkOut={checkOut}
            hoverDate={hoverDate}
            isSelecting={isSelecting}
            onDayClick={handleDayClick}
            onDayHover={handleDayHover}
            onPrev={idx === 0 ? (currentMonthOffset > 0 ? handlePrev : undefined) : undefined}
            onNext={idx === visibleMonths.length - 1 ? handleNext : undefined}
            showNav={true}
            direction={direction}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="pt-2 border-t border-[#B89A62]/10">
        <AvailabilityLegend />
      </div>

      {/* Booking Summary */}
      <BookingSummary
        checkIn={checkIn}
        checkOut={checkOut}
        nights={nights}
        nightlyBreakdown={breakdown}
        totalAmount={totalAmount}
        isLoading={isLoadingPricing}
        error={pricingError}
        onClear={handleClear}
        onContinue={handleContinue}
      />
    </div>
  );
}
