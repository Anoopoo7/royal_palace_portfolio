"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Calendar } from "lucide-react";
import Link from "next/link";
import { formatINR } from "@/lib/booking/dates";

export default function VillaBookingCard() {
  const [price, setPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/pricing/today")
      .then((r) => r.json())
      .then((data) => setPrice(data.price ?? null))
      .catch(() => setPrice(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-[#1C1A17] border border-[#B89A62]/40 p-8 sticky top-28 space-y-6 shadow-2xl">
      <div className="border-b border-[#B89A62]/20 pb-4 space-y-1">
        <h3 className="font-serif-editorial text-2xl text-[#F5F1E8]">
          Book Entire Villa
        </h3>
        <p className="text-[11px] text-[#D8C7AD]/60 font-light">
          All suites & spaces included
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-xs text-[#D8C7AD]">
          <span>Nightly Rate (Entire Villa)</span>
          <span className="font-mono text-[#F5F1E8]">
            {loading ? (
              <span className="opacity-40">Loading…</span>
            ) : price ? (
              formatINR(price)
            ) : (
              <span className="text-[#B89A62]">Contact for pricing</span>
            )}
          </span>
        </div>
        <div className="flex justify-between text-xs text-[#D8C7AD]">
          <span>Taxes & Service</span>
          <span className="text-[10px] text-[#B89A62]">Calculated at checkout</span>
        </div>
      </div>

      <Link
        href="/booking"
        className="w-full py-4 bg-[#B89A62] text-[#171513] text-center text-xs font-semibold tracking-[0.2em] uppercase block hover:bg-[#D4B67E] transition-all flex items-center justify-center gap-2"
      >
        <Calendar className="w-4 h-4" />
        Check Availability & Book
      </Link>

      <div className="flex items-center gap-2 text-[10px] text-[#D8C7AD]/70 justify-center">
        <ShieldCheck className="w-4 h-4 text-[#B89A62]" />
        <span>Exclusive whole-property booking · Best rate direct</span>
      </div>
    </div>
  );
}
