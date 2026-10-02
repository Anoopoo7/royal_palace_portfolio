"use client";

import Link from "next/link";
import { Sparkles, Calendar } from "lucide-react";
import { PromotionSectionData, PromotionCMS } from "@/lib/sanity/types";
import SanityImg from "@/components/ui/SanityImg";
import SanityVideo from "@/components/ui/SanityVideo";

export default function PromotionSection({
  data,
  promotion,
}: {
  data?: PromotionSectionData;
  promotion?: PromotionCMS | null;
}) {
  const prom = promotion || data?.promotionRef;
  if (!prom || prom.enabled === false) return null;

  const todayStr = new Date().toISOString().split("T")[0];
  if (prom.validUntil && prom.validUntil < todayStr) return null;

  return (
    <section className="py-16 bg-[#171513] text-[#F5F1E8] border-t border-[#B89A62]/10 relative">
      <div className="max-w-5xl mx-auto px-6 md:px-12">
        <div className="relative border border-[#B89A62]/40 p-8 md:p-12 overflow-hidden shadow-2xl bg-[#1C1A17]">
          {/* Background Media: Video > Image > Default Gradient */}
          {prom.video ? (
            <div className="absolute inset-0 z-0 overflow-hidden">
              <SanityVideo
                source={prom.video}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover opacity-35"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#171513] via-[#171513]/80 to-[#171513]/60" />
            </div>
          ) : prom.image ? (
            <div className="absolute inset-0 z-0 overflow-hidden">
              <SanityImg
                source={prom.image}
                options={{ width: 1400, quality: 85 }}
                alt={prom.title}
                className="w-full h-full object-cover opacity-35"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#171513] via-[#171513]/80 to-[#171513]/60" />
            </div>
          ) : (
            <div className="absolute inset-0 z-0 bg-gradient-to-r from-[#1C1A17] via-[#24211E] to-[#1C1A17]" />
          )}

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-3 max-w-xl">
              <span className="text-[9px] uppercase tracking-[0.3em] text-[#B89A62] bg-[#171513]/90 px-3 py-1 border border-[#B89A62]/30 inline-flex items-center gap-1.5 font-semibold backdrop-blur-md">
                <Sparkles className="w-3 h-3 text-[#B89A62]" />
                Exclusive Offer
              </span>

              <h3 className="font-serif-editorial text-2xl md:text-4xl text-[#F5F1E8]">
                {prom.title}
              </h3>

              <p className="text-xs text-[#F5F1E8]/90 font-light leading-relaxed">
                {prom.description}
              </p>

              {prom.validUntil && (
                <div className="text-[10px] text-[#D8C7AD] font-mono flex items-center gap-1.5 pt-1">
                  <Calendar className="w-3 h-3 text-[#B89A62]" />
                  Valid through {prom.validUntil}
                </div>
              )}
            </div>

            <div>
              <Link
                href={prom.ctaUrl || "/booking"}
                className="px-8 py-4 bg-[#B89A62] text-[#171513] text-xs font-semibold tracking-[0.2em] uppercase hover:bg-[#D4B67E] transition-all whitespace-nowrap block text-center shadow-xl"
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


