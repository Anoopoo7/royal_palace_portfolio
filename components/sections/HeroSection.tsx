"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { HeroSectionData } from "@/lib/sanity/types";

export default function HeroSection({ data }: { data: HeroSectionData }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 },
    },
  };

  return (
    <section className="relative w-full min-h-[92vh] flex items-center justify-center overflow-hidden bg-[#171513]">
      {/* Background Video / Image Fallback */}
      <div className="absolute inset-0 z-0">
        {data.desktopVideoUrl ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            poster={data.posterImage as string}
            className="w-full h-full object-cover object-center scale-105 filter brightness-75"
          >
            <source src={data.desktopVideoUrl} type="video/mp4" />
          </video>
        ) : (
          <img
            src={(data.posterImage as string) || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80"}
            alt="Royal Palace Varkala"
            className="w-full h-full object-cover object-center brightness-75"
          />
        )}

        {/* Cinematic Vignette & Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#171513] via-[#171513]/40 to-[#171513]/60" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(23,21,19,0.5)_100%)]" />
      </div>

      {/* Hero Content Layer */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-5xl mx-auto px-6 text-center text-[#F5F1E8] pt-24 pb-20"
      >
        {data.eyebrow && (
          <motion.div variants={itemVariants} className="mb-4">
            <span className="text-[11px] uppercase tracking-[0.35em] text-[#D8C7AD] font-medium border-b border-[#B89A62]/40 pb-1 inline-block">
              {data.eyebrow}
            </span>
          </motion.div>
        )}

        <motion.h1
          variants={itemVariants}
          className="font-serif-editorial text-4xl md:text-6xl lg:text-7xl font-light tracking-wide text-[#F5F1E8] leading-[1.15] mb-6 drop-shadow-md"
        >
          {data.heading}
        </motion.h1>

        {data.subtitle && (
          <motion.p
            variants={itemVariants}
            className="text-sm md:text-lg text-[#F5F1E8]/90 max-w-2xl mx-auto font-light leading-relaxed mb-10 tracking-wide font-sans"
          >
            {data.subtitle}
          </motion.p>
        )}

        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/booking"
            className="w-full sm:w-auto px-8 py-4 bg-[#B89A62] text-[#171513] text-xs font-semibold tracking-[0.2em] uppercase hover:bg-[#D4B67E] transition-all shadow-xl"
          >
            {data.primaryCtaText || "CHECK AVAILABILITY"}
          </Link>

          <a
            href="#discover"
            className="w-full sm:w-auto px-8 py-4 border border-[#F5F1E8]/40 text-[#F5F1E8] text-xs font-medium tracking-[0.2em] uppercase hover:border-[#B89A62] hover:text-[#B89A62] transition-colors"
          >
            {data.secondaryCtaText || "DISCOVER THE STAY"}
          </a>
        </motion.div>
      </motion.div>

      {/* Scroll Down Indicator */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 text-[#D8C7AD]/70 flex flex-col items-center gap-1 cursor-pointer"
      >
        <span className="text-[9px] uppercase tracking-[0.3em]">Scroll</span>
        <ChevronDown className="w-4 h-4 text-[#B89A62]" />
      </motion.div>
    </section>
  );
}
