"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Maximize2, ChevronLeft, ChevronRight } from "lucide-react";
import SanityImg from "@/components/ui/SanityImg";
import type { SanityImage } from "@/lib/sanity/types";

interface ImageGalleryLightboxProps {
  images: (SanityImage | string)[];
  title?: string;
  className?: string;
}

export default function ImageGalleryLightbox({
  images,
  title = "Gallery Image",
  className = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6",
}: ImageGalleryLightboxProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const activeImage = selectedIndex !== null ? images[selectedIndex] : null;

  const handleNext = useCallback(() => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex + 1) % images.length);
    }
  }, [selectedIndex, images.length]);

  const handlePrev = useCallback(() => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex - 1 + images.length) % images.length);
    }
  }, [selectedIndex, images.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (e.key === "Escape") setSelectedIndex(null);
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, handleNext, handlePrev]);

  if (!images || images.length === 0) return null;

  return (
    <>
      {/* Gallery Grid */}
      <div className={className}>
        {images.map((img, idx) => (
          <motion.div
            key={idx}
            whileHover={{ scale: 1.02 }}
            onClick={() => setSelectedIndex(idx)}
            className="aspect-[16/10] overflow-hidden border border-[#B89A62]/30 shadow-lg relative group cursor-pointer bg-[#12100E]"
          >
            <SanityImg
              source={img}
              options={{ width: 800, height: 500, fit: "crop" }}
              alt={`${title} ${idx + 1}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {/* Expand Hover Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#171513]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-4">
              <span className="text-[10px] uppercase tracking-widest text-[#B89A62]">
                Click to expand
              </span>
              <div className="p-1.5 bg-[#171513]/80 border border-[#B89A62]/40 rounded-full text-[#B89A62]">
                <Maximize2 className="w-4 h-4" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Full View Lightbox Modal */}
      <AnimatePresence>
        {activeImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#171513]/95 backdrop-blur-xl flex flex-col justify-between p-4 md:p-8"
            onClick={() => setSelectedIndex(null)}
          >
            {/* Top Toolbar */}
            <div className="flex justify-between items-center z-10">
              <div className="text-xs text-[#D8C7AD] font-light">
                <span className="text-[#B89A62] font-semibold">{selectedIndex! + 1}</span> / {images.length}
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedIndex(null);
                }}
                className="p-2.5 bg-[#12100E] border border-[#B89A62]/40 text-[#F5F1E8] hover:text-[#B89A62] hover:border-[#B89A62] transition-all rounded-full shadow-2xl group"
                aria-label="Close Full View"
              >
                <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>

            {/* Main Lightbox Content */}
            <div
              className="relative flex-1 flex items-center justify-center my-4 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Prev Button */}
              {images.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrev();
                  }}
                  className="absolute left-2 md:left-6 z-20 p-3 bg-[#12100E]/80 border border-[#B89A62]/30 text-[#F5F1E8] hover:bg-[#B89A62] hover:text-[#171513] transition-all rounded-full"
                  aria-label="Previous Image"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}

              {/* Main Image */}
              <motion.div
                key={selectedIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="max-h-[80vh] max-w-[90vw] relative border border-[#B89A62]/30 shadow-2xl overflow-hidden bg-[#12100E]"
              >
                <SanityImg
                  source={activeImage}
                  options={{ width: 1800, quality: 95 }}
                  alt={title}
                  className="max-h-[80vh] max-w-[90vw] object-contain"
                />
              </motion.div>

              {/* Next Button */}
              {images.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  className="absolute right-2 md:right-6 z-20 p-3 bg-[#12100E]/80 border border-[#B89A62]/30 text-[#F5F1E8] hover:bg-[#B89A62] hover:text-[#171513] transition-all rounded-full"
                  aria-label="Next Image"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}
            </div>

            {/* Bottom Caption / Title */}
            <div className="text-center z-10 pb-2">
              <h4 className="font-serif-editorial text-xl text-[#F5F1E8]">
                {title}
              </h4>
              <p className="text-[11px] text-[#D8C7AD]/60 font-light mt-0.5">
                Press ESC or click close to exit
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
