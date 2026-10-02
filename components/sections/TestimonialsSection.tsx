"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import { TestimonialsSectionData, TestimonialCMS } from "@/lib/sanity/types";
import SanityImg from "@/components/ui/SanityImg";

export default function TestimonialsSection({
  data,
  testimonials,
}: {
  data: TestimonialsSectionData;
  testimonials?: TestimonialCMS[];
}) {
  return (
    <section className="py-24 bg-[#171513] text-[#F5F1E8] border-t border-[#B89A62]/10 relative">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        <div className="text-center mb-16">
          {data.eyebrow && (
            <span className="text-[10px] uppercase tracking-[0.35em] text-[#B89A62] font-semibold block mb-2">
              {data.eyebrow}
            </span>
          )}
          <h2 className="font-serif-editorial text-3xl md:text-5xl font-light text-[#F5F1E8]">
            {data.title}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials?.map((test, idx) => (
            <motion.div
              key={test._id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.15 }}
              className="bg-[#12100E] border border-[#B89A62]/20 p-8 space-y-6 flex flex-col justify-between shadow-xl"
            >
              <div className="space-y-4">
                <Quote className="w-8 h-8 text-[#B89A62]/40" />
                <p className="font-serif-editorial text-lg text-[#F5F1E8]/90 italic leading-relaxed">
                  "{test.quote}"
                </p>
              </div>

              <div className="border-t border-[#B89A62]/10 pt-4 flex justify-between items-center text-xs">
                <div className="flex items-center gap-3">
                  {test.guestImage && (
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-[#B89A62]/30 flex-shrink-0 relative">
                      <SanityImg
                        source={test.guestImage}
                        alt={test.guestName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <h4 className="font-medium text-[#F5F1E8]">{test.guestName}</h4>
                    <p className="text-[10px] text-[#D8C7AD] font-light">{test.guestLocation}</p>
                  </div>
                </div>
                <span className="text-[9px] uppercase tracking-widest text-[#B89A62] border border-[#B89A62]/20 px-2 py-0.5">
                  {test.source}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

