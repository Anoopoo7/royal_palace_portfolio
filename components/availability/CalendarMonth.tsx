"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import CalendarDay from "./CalendarDay";
import type { AvailabilityDay } from "@/lib/booking/types";
import { parseDateStr, formatDateStr } from "@/lib/booking/dates";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface CalendarMonthProps {
  year: number;
  month: number; // 1-12
  days: AvailabilityDay[];
  checkIn: string | null;
  checkOut: string | null;
  hoverDate: string | null;
  isSelecting: boolean;
  onDayClick: (date: string) => void;
  onDayHover: (date: string) => void;
  onPrev?: () => void;
  onNext?: () => void;
  showNav?: boolean;
  direction?: number; // for animation: 1=forward, -1=backward
}

const variants = {
  enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
};

export default function CalendarMonth({
  year,
  month,
  days,
  checkIn,
  checkOut,
  hoverDate,
  isSelecting,
  onDayClick,
  onDayHover,
  onPrev,
  onNext,
  showNav = true,
  direction = 1,
}: CalendarMonthProps) {
  // Build the grid: 0-indexed grid slots (empty = null, date = string)
  const grid = useMemo(() => {
    // First day of month
    const firstDay = new Date(year, month - 1, 1);
    // Monday-first: Mon=0 ... Sun=6
    let startOffset = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month, 0).getDate();

    const slots: (string | null)[] = Array(startOffset).fill(null);
    for (let d = 1; d <= daysInMonth; d++) {
      slots.push(formatDateStr(new Date(year, month - 1, d)));
    }
    // Pad to complete last week
    while (slots.length % 7 !== 0) slots.push(null);
    return slots;
  }, [year, month]);

  // Build a map for O(1) lookup
  const daysMap = useMemo(() => {
    const m = new Map<string, AvailabilityDay>();
    for (const d of days) m.set(d.date, d);
    return m;
  }, [days]);

  const effectiveCheckOut = isSelecting ? hoverDate : checkOut;
  const rangeStart = checkIn && effectiveCheckOut && checkIn < effectiveCheckOut ? checkIn : null;
  const rangeEnd = checkIn && effectiveCheckOut && checkIn < effectiveCheckOut ? effectiveCheckOut : null;

  const key = `${year}-${month}`;

  return (
    <div className="select-none">
      {/* Month header */}
      <div className="flex items-center justify-between mb-4">
        {showNav && onPrev ? (
          <button
            onClick={onPrev}
            className="p-1.5 text-[#D8C7AD]/60 hover:text-[#B89A62] transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        ) : (
          <div className="w-7" />
        )}

        <h3 className="font-serif-editorial text-lg md:text-xl text-[#F5F1E8] tracking-wide">
          {MONTH_NAMES[month - 1]} {year}
        </h3>

        {showNav && onNext ? (
          <button
            onClick={onNext}
            className="p-1.5 text-[#D8C7AD]/60 hover:text-[#B89A62] transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="w-7" />
        )}
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((wd) => (
          <div
            key={wd}
            className="text-center text-[9px] uppercase tracking-wider text-[#D8C7AD]/50 py-1"
          >
            {wd}
          </div>
        ))}
      </div>

      {/* Calendar grid with slide animation */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={key}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="grid grid-cols-7 gap-0.5"
        >
          {grid.map((date, i) => {
            if (!date) {
              return <div key={`empty-${i}`} className="aspect-square" />;
            }

            const dayData = daysMap.get(date);
            const dow = i % 7; // 0=Mon...6=Sun

            if (!dayData) {
              // No data for this date — render as unavailable placeholder
              const d = parseDateStr(date);
              return (
                <div
                  key={date}
                  className="flex flex-col items-center justify-center aspect-square min-h-[52px] md:min-h-[64px] text-[#F5F1E8]/15"
                >
                  <span className="text-sm">{d.getDate()}</span>
                </div>
              );
            }

            const isCI = date === checkIn;
            const isCO = date === checkOut;
            const inRange =
              rangeStart && rangeEnd ? date > rangeStart && date < rangeEnd : false;
            const inHoverRange =
              isSelecting && hoverDate && checkIn
                ? checkIn < hoverDate
                  ? date > checkIn && date <= hoverDate
                  : date < checkIn && date >= hoverDate
                : false;

            return (
              <CalendarDay
                key={date}
                day={dayData}
                dayOfWeek={dow}
                isCheckIn={isCI}
                isCheckOut={isCO}
                isInRange={!!inRange}
                isHoverRange={!!inHoverRange}
                isSelecting={isSelecting}
                onClick={() => onDayClick(date)}
                onMouseEnter={() => onDayHover(date)}
              />
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
