"use client";

import { motion } from "framer-motion";
import { EditorialSectionData } from "@/lib/sanity/types";

export default function EditorialSection({ data }: { data: EditorialSectionData }) {
  return (
    <section id="discover" className="py-24 md:py-36 bg-[#171513] text-[#F5F1E8] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        {/* Text Column */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="lg:col-span-6 space-y-8"
        >
          {data.eyebrow && (
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#B89A62] font-semibold block">
              {data.eyebrow}
            </span>
          )}

          <h2 className="font-serif-editorial text-3xl md:text-5xl font-light text-[#F5F1E8] leading-[1.2] tracking-wide">
            {data.title}
          </h2>

          <div className="space-y-4 text-sm md:text-base text-[#F5F1E8]/80 font-light leading-relaxed">
            {data.bodyParagraphs.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>

          {data.quote && (
            <div className="border-l-2 border-[#B89A62] pl-6 py-2 mt-6">
              <p className="font-serif-editorial text-xl italic text-[#D8C7AD]">
                "{data.quote}"
              </p>
            </div>
          )}
        </motion.div>

        {/* Image Column */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.9 }}
          className="lg:col-span-6 relative"
        >
          <div className="relative aspect-[4/5] overflow-hidden border border-[#B89A62]/20 shadow-2xl">
            <img
              src={data.imageUrl}
              alt={data.imageCaption || "Royal Palace Varkala"}
              className="w-full h-full object-cover object-center filter saturate-90 hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#171513]/60 via-transparent to-transparent" />
          </div>

          {data.imageCaption && (
            <p className="text-[11px] text-[#D8C7AD]/70 font-light mt-3 text-right italic font-serif">
              {data.imageCaption}
            </p>
          )}
        </motion.div>
      </div>
    </section>
  );
}
