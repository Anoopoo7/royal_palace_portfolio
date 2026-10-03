"use client";

import { motion } from "framer-motion";
import { formatCompactINR } from "@/lib/booking/dates";
import type { AvailabilityDay } from "@/lib/booking/types";

interface CalendarDayProps {
  day: AvailabilityDay;
  dayOfWeek: number; // 0=Sun...6=Sat
  isCheckIn: boolean;
  isCheckOut: boolean;
  isInRange: boolean;
  isHoverRange: boolean;
  isSelecting: boolean; // user picked check-in, waiting for check-out
  onClick: () => void;
  onMouseEnter: () => void;
}

export default function CalendarDay({
  day,
  isCheckIn,
  isCheckOut,
  isInRange,
  isHoverRange,
  isSelecting,
  onClick,
  onMouseEnter,
}: CalendarDayProps) {
  const { date, price, available, isPast } = day;
  const dayNum = Number(date.split("-")[2]);

  const isSelected = isCheckIn || isCheckOut;
  const isHighlighted = isInRange || isHoverRange;
  const isDisabled = isPast || !available || price === null;
  const canSelect = !isDisabled;

  let bgClass = "";
  let textClass = "text-[#F5F1E8]/80";
  let borderClass = "border-transparent";
  let cursor = canSelect ? "cursor-pointer" : "cursor-default";

  if (isPast) {
    textClass = "text-[#F5F1E8]/20";
  } else if (!available) {
    textClass = "text-[#F5F1E8]/25";
    bgClass = "bg-[#1a1816]";
  } else if (price === null) {
    textClass = "text-[#F5F1E8]/20";
  } else if (isSelected) {
    bgClass = "bg-[#B89A62]";
    textClass = "text-[#171513] font-semibold";
    borderClass = "border-[#B89A62]";
  } else if (isHighlighted) {
    bgClass = "bg-[#B89A62]/15";
    textClass = "text-[#F5F1E8]";
    borderClass = "border-[#B89A62]/20";
  } else if (canSelect && isSelecting) {
    cursor = "cursor-pointer";
  }

  return (
    <motion.button
      onClick={canSelect ? onClick : undefined}
      onMouseEnter={canSelect ? onMouseEnter : undefined}
      disabled={!canSelect}
      whileHover={canSelect ? { scale: 1.05 } : {}}
      whileTap={canSelect ? { scale: 0.97 } : {}}
      transition={{ duration: 0.12 }}
      className={`
        relative flex flex-col items-center justify-center
        aspect-square w-full min-h-[52px] md:min-h-[64px]
        rounded-sm border transition-all duration-150
        ${bgClass} ${borderClass} ${cursor}
        group
      `}
    >
      {/* Day number */}
      <span className={`text-sm md:text-base font-light leading-none ${textClass}`}>
        {dayNum}
      </span>

      {/* Price or status */}
      {!isPast && (
        <span
          className={`
            text-[9px] md:text-[10px] leading-none mt-0.5 font-light tracking-tight
            ${
              isSelected
                ? "text-[#171513]/70"
                : !available
                ? "text-[#F5F1E8]/20"
                : price === null
                ? "text-[#F5F1E8]/15"
                : "text-[#B89A62]/80"
            }
          `}
        >
          {!available
            ? "Booked"
            : price === null
            ? "—"
            : formatCompactINR(price)}
        </span>
      )}

      {/* Check-in / check-out indicator */}
      {(isCheckIn || isCheckOut) && (
        <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 text-[8px] text-[#B89A62] whitespace-nowrap hidden md:block">
          {isCheckIn ? "IN" : "OUT"}
        </span>
      )}

      {/* Hover tooltip */}
      {canSelect && price !== null && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <div className="bg-[#2A2520] border border-[#B89A62]/30 px-2.5 py-1.5 rounded-sm whitespace-nowrap text-[10px] shadow-xl">
            <p className="text-[#F5F1E8] font-medium">{date}</p>
            <p className="text-[#B89A62]">₹{price.toLocaleString("en-IN")}</p>
            <p className="text-[#F5F1E8]/50">{available ? "Available" : "Unavailable"}</p>
          </div>
          <div className="w-2 h-2 bg-[#2A2520] border-b border-r border-[#B89A62]/30 rotate-45 mx-auto -mt-1" />
        </div>
      )}
    </motion.button>
  );
}
