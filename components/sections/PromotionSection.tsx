"use client";

import Link from "next/link";
import { Sparkles, Calendar } from "lucide-react";
import { PromotionSectionData } from "@/lib/sanity/types";

export default function PromotionSection({ data }: { data: PromotionSectionData }) {
  const prom = data.promotionRef;
  if (!prom || !prom.enabled) return null;

  const todayStr = new Date().toISOString().split("T")[0];
  if (prom.validUntil && prom.validUntil < todayStr) return null;

  return (
    <section className="py-16 bg-[#171513] text-[#F5F1E8] border-t border-[#B89A62]/10 relative">
      <div className="max-w-5xl mx-auto px-6 md:px-12">
        <div className="bg-gradient-to-r from-[#1C1A17] via-[#24211E] to-[#1C1A17] border border-[#B89A62]/40 p-8 md:p-12 relative overflow-hidden shadow-2xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-3 max-w-xl">
              <span className="text-[9px] uppercase tracking-[0.3em] text-[#B89A62] bg-[#171513] px-3 py-1 border border-[#B89A62]/30 inline-flex items-center gap-1.5 font-semibold">
                <Sparkles className="w-3 h-3 text-[#B89A62]" />
                Exclusive Offer
              </span>

              <h3 className="font-serif-editorial text-2xl md:text-4xl text-[#F5F1E8]">
                {prom.title}
              </h3>

              <p className="text-xs text-[#F5F1E8]/80 font-light leading-relaxed">
                {prom.description}
              </p>

              <div className="text-[10px] text-[#D8C7AD] font-mono flex items-center gap-1.5">
                <Calendar className="w-3 h-3 text-[#B89A62]" />
                Valid through {prom.validUntil}
              </div>
            </div>

            <div>
              <Link
                href={prom.ctaUrl || "/booking"}
                className="px-8 py-4 bg-[#B89A62] text-[#171513] text-xs font-semibold tracking-[0.2em] uppercase hover:bg-[#D4B67E] transition-all whitespace-nowrap block text-center"
              >
                {prom.ctaLabel || "Claim Offer"}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
