"use client";

import { motion } from "framer-motion";
import { Coffee, Sun, Compass, Waves, Sunset, Moon } from "lucide-react";
import { DayTimelineSectionData } from "@/lib/sanity/types";

export default function DayTimelineSection({ data }: { data: DayTimelineSectionData }) {
  const getIcon = (idx: number) => {
    const icons = [
      <Coffee key={1} className="w-5 h-5 text-[#B89A62]" />,
      <Sun key={2} className="w-5 h-5 text-[#B89A62]" />,
      <Compass key={3} className="w-5 h-5 text-[#B89A62]" />,
      <Waves key={4} className="w-5 h-5 text-[#B89A62]" />,
      <Sunset key={5} className="w-5 h-5 text-[#B89A62]" />,
      <Moon key={6} className="w-5 h-5 text-[#B89A62]" />,
    ];
    return icons[idx % icons.length];
  };

  return (
    <section className="py-24 bg-[#171513] text-[#F5F1E8] border-t border-[#B89A62]/10 relative">
      <div className="max-w-5xl mx-auto px-6 md:px-12">
        <div className="text-center mb-16">
          {data.eyebrow && (
            <span className="text-[10px] uppercase tracking-[0.35em] text-[#B89A62] font-semibold block mb-2">
              {data.eyebrow}
            </span>
          )}
          <h2 className="font-serif-editorial text-3xl md:text-5xl font-light text-[#F5F1E8]">
            {data.title}
          </h2>
          {data.subtitle && (
            <p className="text-xs text-[#D8C7AD] tracking-wider uppercase mt-2">
              {data.subtitle}
            </p>
          )}
        </div>

        {/* Timeline Container */}
        <div className="relative border-l border-[#B89A62]/30 pl-8 md:pl-12 ml-4 md:ml-32 space-y-12">
          {data.items.map((item, idx) => (
            <motion.div
              key={item._key}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="relative"
            >
              {/* Timeline Marker Node */}
              <div className="absolute -left-[41px] md:-left-[57px] top-1 w-10 h-10 bg-[#12100E] border border-[#B89A62] rounded-full flex items-center justify-center shadow-lg">
                {getIcon(idx)}
              </div>

              {/* Time pill */}
              <span className="text-[11px] font-mono text-[#B89A62] uppercase tracking-widest bg-[#12100E] px-2.5 py-1 border border-[#B89A62]/20 inline-block mb-2">
                {item.time}
              </span>

              <h3 className="font-serif-editorial text-2xl text-[#F5F1E8]">
                {item.title}
              </h3>

              <p className="text-xs text-[#F5F1E8]/70 font-light leading-relaxed max-w-lg mt-1">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
