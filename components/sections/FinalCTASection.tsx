"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FinalCtaSectionData } from "@/lib/sanity/types";
import { useSanityImage } from "@/hooks/useSanityImage";

export default function FinalCTASection({ data }: { data: FinalCtaSectionData }) {
  const bgSrc = useSanityImage(data.backgroundImage, {
    width: 1920,
    quality: 80,
    fallback:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80",
  });

  return (
    <section className="relative py-32 md:py-48 bg-[#171513] text-[#F5F1E8] overflow-hidden flex items-center justify-center">
      {/* Background Image / Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={bgSrc}
          alt="Royal Palace Varkala Sunset"
          className="w-full h-full object-cover filter brightness-50 contrast-125"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#171513] via-[#171513]/60 to-[#171513]/80" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center space-y-8">
        {data.eyebrow && (
          <span className="text-[10px] uppercase tracking-[0.35em] text-[#B89A62] font-semibold block">
            {data.eyebrow}
          </span>
        )}

        <h2 className="font-serif-editorial text-4xl md:text-6xl font-light text-[#F5F1E8] leading-[1.15]">
          {data.heading}
        </h2>

        {data.subtitle && (
          <p className="text-sm md:text-base text-[#F5F1E8]/80 max-w-xl mx-auto font-light leading-relaxed">
            {data.subtitle}
          </p>
        )}

        <div className="pt-4">
          <Link
            href="/booking"
            className="inline-block px-10 py-5 bg-[#B89A62] text-[#171513] text-xs font-semibold tracking-[0.25em] uppercase hover:bg-[#D4B67E] transition-all shadow-2xl"
          >
            {data.buttonText || "CHECK AVAILABILITY"}
          </Link>
        </div>
      </div>
    </section>
  );
}
