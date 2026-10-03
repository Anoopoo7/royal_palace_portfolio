"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, X, Loader2, AlertTriangle } from "lucide-react";
import { formatDisplayDate, formatINR } from "@/lib/booking/dates";
import type { NightlyRate } from "@/lib/booking/types";

interface BookingSummaryProps {
  checkIn: string | null;
  checkOut: string | null;
  nights: number;
  nightlyBreakdown: NightlyRate[];
  totalAmount: number;
  isLoading: boolean;
  error: string | null;
  onClear: () => void;
  onContinue: () => void;
}

export default function BookingSummary({
  checkIn,
  checkOut,
  nights,
  nightlyBreakdown,
  totalAmount,
  isLoading,
  error,
  onClear,
  onContinue,
}: BookingSummaryProps) {
  const hasSelection = checkIn && checkOut;

  return (
    <AnimatePresence mode="wait">
      {hasSelection && (
        <motion.div
          key="summary"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="bg-[#1C1A17] border border-[#B89A62]/30 p-6 space-y-5 shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#B89A62]">
                Your Selection
              </p>
              <h3 className="font-serif-editorial text-xl text-[#F5F1E8] mt-1">
                Stay Summary
              </h3>
            </div>
            <button
              onClick={onClear}
              className="p-1.5 text-[#D8C7AD]/50 hover:text-[#F5F1E8] transition-colors"
              title="Clear selection"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4 border-t border-[#B89A62]/10 pt-4">
            <div>
              <p className="text-[9px] uppercase tracking-wider text-[#D8C7AD]/60">Check-in</p>
              <p className="text-sm text-[#F5F1E8] mt-0.5 font-light">
                {checkIn ? formatDisplayDate(checkIn) : "—"}
              </p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-wider text-[#D8C7AD]/60">Check-out</p>
              <p className="text-sm text-[#F5F1E8] mt-0.5 font-light">
                {checkOut ? formatDisplayDate(checkOut) : "—"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-[#D8C7AD]/60 uppercase tracking-wider">
            <span>{nights} Night{nights !== 1 ? "s" : ""}</span>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex items-center gap-2 text-[#B89A62] text-xs">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Calculating pricing...</span>
            </div>
          )}

          {/* Error */}
          {error && !isLoading && (
            <div className="flex items-start gap-2 bg-red-900/20 border border-red-500/30 p-3 text-xs text-red-300">
              <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Nightly breakdown */}
          {!isLoading && !error && nightlyBreakdown.length > 0 && (
            <div className="space-y-1.5 border-t border-[#B89A62]/10 pt-4">
              <p className="text-[9px] uppercase tracking-wider text-[#D8C7AD]/60 mb-2">
                Price Breakdown
              </p>
              <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                {nightlyBreakdown.map((n) => (
                  <div key={n.date} className="flex justify-between text-xs">
                    <span className="text-[#D8C7AD]/70">{formatDisplayDate(n.date)}</span>
                    <span className="text-[#F5F1E8]/80">{formatINR(n.price)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between pt-2 border-t border-[#B89A62]/20 mt-2">
                <span className="text-xs uppercase tracking-wider text-[#D8C7AD]">Total</span>
                <span className="font-serif-editorial text-lg text-[#B89A62]">
                  {formatINR(totalAmount)}
                </span>
              </div>
            </div>
          )}

          {/* CTA */}
          {!isLoading && !error && nightlyBreakdown.length > 0 && (
            <motion.button
              onClick={onContinue}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full py-3.5 bg-[#B89A62] text-[#171513] text-xs font-semibold tracking-[0.2em] uppercase hover:bg-[#D4B67E] transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <span>Continue to Booking</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </motion.button>
          )}
        </motion.div>
      )}

      {!hasSelection && (
        <motion.div
          key="placeholder"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="border border-[#B89A62]/15 p-6 text-center space-y-2"
        >
          <p className="font-serif-editorial text-lg text-[#F5F1E8]/50">
            Select your dates
          </p>
          <p className="text-[11px] text-[#D8C7AD]/40 max-w-[220px] mx-auto leading-relaxed">
            Click a date to set check-in, then click another for check-out
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
