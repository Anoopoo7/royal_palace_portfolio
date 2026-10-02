"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Compass, Clock, MapPin, ArrowRight } from "lucide-react";
import { ExperienceGridSectionData, ExperienceCMS } from "@/lib/sanity/types";
import { MOCK_EXPERIENCES } from "@/lib/mock-data";

export default function ExperienceGridSection({
  data,
  experiences = MOCK_EXPERIENCES,
}: {
  data: ExperienceGridSectionData;
  experiences?: ExperienceCMS[];
}) {
  return (
    <section className="py-24 bg-[#12100E] text-[#F5F1E8] border-t border-[#B89A62]/10 relative">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 space-y-4 md:space-y-0">
          <div>
            {data.eyebrow && (
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#B89A62] font-semibold block mb-2">
                {data.eyebrow}
              </span>
            )}
            <h2 className="font-serif-editorial text-3xl md:text-5xl font-light text-[#F5F1E8]">
              {data.title}
            </h2>
          </div>

          <Link
            href="/experiences"
            className="text-xs uppercase tracking-[0.2em] text-[#D8C7AD] hover:text-[#B89A62] transition-colors flex items-center gap-2 group"
          >
            <span>Explore All Experiences</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {experiences.map((exp, idx) => (
            <motion.div
              key={exp._id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.15 }}
              className="bg-[#1C1A17] border border-[#B89A62]/20 flex flex-col justify-between group hover:border-[#B89A62]/50 transition-all shadow-xl"
            >
              <div>
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={exp.heroImage as string}
                    alt={exp.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <span className="absolute top-4 left-4 bg-[#171513]/80 backdrop-blur-md px-3 py-1 text-[10px] uppercase tracking-wider text-[#B89A62] border border-[#B89A62]/30">
                    {exp.category}
                  </span>
                </div>

                <div className="p-6 space-y-4">
                  <h3 className="font-serif-editorial text-2xl font-light text-[#F5F1E8] group-hover:text-[#B89A62] transition-colors">
                    {exp.title}
                  </h3>
                  <p className="text-xs text-[#F5F1E8]/70 font-light leading-relaxed">
                    {exp.shortDescription}
                  </p>

                  <div className="flex flex-col space-y-1.5 text-[11px] text-[#D8C7AD] pt-2 border-t border-[#B89A62]/10">
                    <span className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-[#B89A62]" />
                      Duration: {exp.duration}
                    </span>
                    <span className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#B89A62]" />
                      Location: {exp.location}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0">
                <Link
                  href={`/experiences/${exp.slug.current}`}
                  className="w-full py-3 border border-[#B89A62]/40 text-[#F5F1E8] text-center text-xs font-semibold tracking-[0.18em] uppercase block hover:bg-[#B89A62] hover:text-[#171513] transition-all"
                >
                  {exp.ctaText || "View Details"}
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
