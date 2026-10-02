"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Maximize2 } from "lucide-react";
import { GallerySectionData, GalleryItemCMS } from "@/lib/sanity/types";
import { MOCK_GALLERY } from "@/lib/mock-data";

export default function GallerySection({
  data,
  items = MOCK_GALLERY,
}: {
  data: GallerySectionData;
  items?: GalleryItemCMS[];
}) {
  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(null);

  const activeItem = activeLightboxIndex !== null ? items[activeLightboxIndex] : null;

  return (
    <section className="py-24 bg-[#12100E] text-[#F5F1E8] border-t border-[#B89A62]/10 relative">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center max-w-2xl mx-auto mb-16">
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

        {/* Asymmetric Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-6">
          {items.map((item, idx) => {
            // Asymmetric sizing span
            let spanClass = "lg:col-span-6";
            if (idx % 4 === 0) spanClass = "lg:col-span-7 aspect-[16/10]";
            else if (idx % 4 === 1) spanClass = "lg:col-span-5 aspect-[4/5]";
            else if (idx % 4 === 2) spanClass = "lg:col-span-4 aspect-[4/5]";
            else spanClass = "lg:col-span-8 aspect-[16/9]";

            return (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                onClick={() => setActiveLightboxIndex(idx)}
                className={`relative overflow-hidden group cursor-pointer border border-[#B89A62]/20 shadow-xl ${spanClass}`}
              >
                <img
                  src={item.media as string}
                  alt={item.title}
                  className="w-full h-full object-cover filter brightness-90 group-hover:brightness-100 group-hover:scale-105 transition-all duration-700"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#171513]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                  <div className="flex justify-between items-end w-full">
                    <div>
                      <span className="text-[9px] uppercase tracking-widest text-[#B89A62]">
                        {item.category}
                      </span>
                      <h4 className="font-serif-editorial text-xl text-[#F5F1E8]">
                        {item.title}
                      </h4>
                    </div>
                    <Maximize2 className="w-5 h-5 text-[#B89A62]" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {activeItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#171513]/95 backdrop-blur-lg flex items-center justify-center p-6"
            onClick={() => setActiveLightboxIndex(null)}
          >
            <button
              onClick={() => setActiveLightboxIndex(null)}
              className="absolute top-6 right-6 text-[#F5F1E8] hover:text-[#B89A62] p-2"
              aria-label="Close Lightbox"
            >
              <X className="w-8 h-8" />
            </button>

            <div
              className="max-w-5xl max-h-[85vh] relative text-center space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={activeItem.media as string}
                alt={activeItem.title}
                className="max-h-[70vh] max-w-full object-contain mx-auto border border-[#B89A62]/30 shadow-2xl"
              />
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#B89A62]">
                  {activeItem.category}
                </span>
                <h3 className="font-serif-editorial text-2xl text-[#F5F1E8]">
                  {activeItem.title}
                </h3>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
