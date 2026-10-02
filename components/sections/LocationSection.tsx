"use client";

import { motion } from "framer-motion";
import { MapPin, Navigation, Compass } from "lucide-react";
import { LocationSectionData } from "@/lib/sanity/types";

export default function LocationSection({ data }: { data: LocationSectionData }) {
  return (
    <section className="py-24 bg-[#12100E] text-[#F5F1E8] border-t border-[#B89A62]/10 relative">
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Info Left */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="lg:col-span-6 space-y-6"
        >
          {data.eyebrow && (
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#B89A62] font-semibold block">
              {data.eyebrow}
            </span>
          )}

          <h2 className="font-serif-editorial text-3xl md:text-5xl font-light text-[#F5F1E8]">
            {data.title}
          </h2>

          <p className="text-xs md:text-sm text-[#F5F1E8]/80 font-light leading-relaxed">
            {data.description}
          </p>

          <div className="pt-2 flex items-center space-x-2 text-xs text-[#D8C7AD]">
            <MapPin className="w-4 h-4 text-[#B89A62]" />
            <span>{data.address}</span>
          </div>

          <a
            href={data.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 px-6 py-3 border border-[#B89A62]/40 text-[#F5F1E8] text-xs uppercase tracking-[0.2em] font-semibold hover:bg-[#B89A62] hover:text-[#171513] transition-all mt-4"
          >
            <Navigation className="w-4 h-4" />
            <span>Open in Google Maps</span>
          </a>
        </motion.div>

        {/* Landmarks Grid Right */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="lg:col-span-6 space-y-4"
        >
          {data.landmarks.map((lm, i) => (
            <div
              key={i}
              className="bg-[#1C1A17] border border-[#B89A62]/20 p-5 flex items-center justify-between hover:border-[#B89A62]/40 transition-colors"
            >
              <div>
                <h4 className="font-serif-editorial text-xl text-[#F5F1E8]">
                  {lm.name}
                </h4>
                {lm.description && (
                  <p className="text-[11px] text-[#F5F1E8]/60 font-light mt-0.5">
                    {lm.description}
                  </p>
                )}
              </div>
              <span className="text-[11px] font-mono text-[#B89A62] bg-[#12100E] px-3 py-1 border border-[#B89A62]/20 whitespace-nowrap">
                {lm.distance}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
