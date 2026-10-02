"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Users, Bed, Sparkles, ArrowRight } from "lucide-react";
import { RoomShowcaseSectionData, RoomCMS } from "@/lib/sanity/types";
import { MOCK_ROOMS } from "@/lib/mock-data";

export default function RoomShowcaseSection({
  data,
  rooms = MOCK_ROOMS,
}: {
  data: RoomShowcaseSectionData;
  rooms?: RoomCMS[];
}) {
  return (
    <section className="py-24 bg-[#12100E] text-[#F5F1E8] border-t border-[#B89A62]/10 relative">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Section Header */}
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
            href="/rooms"
            className="text-xs uppercase tracking-[0.2em] text-[#D8C7AD] hover:text-[#B89A62] transition-colors flex items-center gap-2 group"
          >
            <span>View All Accommodations</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Room Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {rooms.map((room, idx) => (
            <motion.div
              key={room._id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: idx * 0.15 }}
              className="bg-[#1C1A17] border border-[#B89A62]/20 flex flex-col justify-between group hover:border-[#B89A62]/50 transition-all duration-500 shadow-xl"
            >
              <div>
                {/* Image */}
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={room.heroImage as string}
                    alt={room.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-4 right-4 bg-[#171513]/80 backdrop-blur-md px-3 py-1 text-[11px] text-[#B89A62] border border-[#B89A62]/30 font-medium">
                    From ₹{room.basePrice.toLocaleString("en-IN")} / night
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  <h3 className="font-serif-editorial text-2xl font-light text-[#F5F1E8] group-hover:text-[#B89A62] transition-colors">
                    {room.name}
                  </h3>

                  <p className="text-xs text-[#F5F1E8]/70 font-light leading-relaxed line-clamp-3">
                    {room.shortDescription}
                  </p>

                  <div className="flex items-center space-x-4 text-[11px] text-[#D8C7AD] pt-2 border-t border-[#B89A62]/10">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[#B89A62]" />
                      Up to {room.capacity} Guests
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Bed className="w-3.5 h-3.5 text-[#B89A62]" />
                      {room.beds}
                    </span>
                  </div>

                  {room.highlights && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {room.highlights.map((h, i) => (
                        <span
                          key={i}
                          className="text-[9px] uppercase tracking-wider bg-[#171513] text-[#D8C7AD] px-2 py-0.5 border border-[#B89A62]/10"
                        >
                          {h}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Action */}
              <div className="p-6 pt-0">
                <Link
                  href={`/rooms/${room.slug.current}`}
                  className="w-full py-3 bg-transparent border border-[#B89A62]/40 text-[#F5F1E8] text-center text-xs font-semibold tracking-[0.18em] uppercase block hover:bg-[#B89A62] hover:text-[#171513] transition-all"
                >
                  {room.ctaLabel || "Explore Suite"}
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
