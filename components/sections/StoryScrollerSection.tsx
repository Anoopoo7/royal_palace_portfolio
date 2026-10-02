"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StoryScrollerSectionData } from "@/lib/sanity/types";
import SanityImg from "@/components/ui/SanityImg";

export default function StoryScrollerSection({ data }: { data: StoryScrollerSectionData }) {
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);

  const scenes = data.scenes && data.scenes.length > 0 ? data.scenes : [];
  const currentScene = scenes.length > 0 ? (scenes[activeSceneIndex] ?? scenes[0]) : null;

  return (
    <section className="py-24 bg-[#171513] text-[#F5F1E8] relative overflow-hidden border-t border-[#B89A62]/10">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          {data.eyebrow && (
            <span className="text-[10px] uppercase tracking-[0.35em] text-[#B89A62] font-semibold block mb-2">
              {data.eyebrow}
            </span>
          )}
          <h2 className="font-serif-editorial text-3xl md:text-5xl font-light text-[#F5F1E8]">
            {data.title || "A Day at Royal Palace"}
          </h2>
        </div>

        {/* Desktop Pinned Interactive Storyboard */}
        {scenes.length === 0 ? (
          <div className="hidden lg:flex items-center justify-center bg-[#12100E] border border-[#B89A62]/20 p-12 shadow-2xl text-[#D8C7AD]/40 text-xs uppercase tracking-widest">
            Add scenes in the Sanity Studio to display content here
          </div>
        ) : (
          <div className="hidden lg:grid grid-cols-12 gap-12 items-center bg-[#12100E] border border-[#B89A62]/20 p-8 shadow-2xl">
            {/* Media Frame Left */}
            <div className="col-span-7 relative aspect-[16/10] overflow-hidden border border-[#B89A62]/30 shadow-inner">
              <AnimatePresence mode="wait">
                {currentScene && (
                  <motion.div
                    key={currentScene._key}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.7 }}
                    className="w-full h-full"
                  >
                    <SanityImg
                      source={currentScene.media}
                      options={{ width: 1200, quality: 85 }}
                      alt={currentScene.title}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-t from-[#171513]/70 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 text-xs tracking-widest text-[#B89A62] font-mono">
                SCENE 0{activeSceneIndex + 1} / 0{scenes.length}
              </div>
            </div>

            {/* Story Narrative Right */}
            <div className="col-span-5 space-y-8">
              <div className="flex space-x-2 border-b border-[#B89A62]/20 pb-4">
                {scenes.map((scene, idx) => (
                  <button
                    key={scene._key}
                    onClick={() => setActiveSceneIndex(idx)}
                    className={`px-3 py-1 text-[10px] uppercase tracking-widest transition-all cursor-pointer ${
                      activeSceneIndex === idx
                        ? "bg-[#B89A62] text-[#171513] font-bold"
                        : "text-[#D8C7AD]/60 hover:text-[#F5F1E8]"
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {currentScene && (
                  <motion.div
                    key={currentScene._key}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-4"
                  >
                    <span className="text-[10px] uppercase tracking-[0.3em] text-[#B89A62] block">
                      {currentScene.subtitle}
                    </span>

                    <h3 className="font-serif-editorial text-3xl font-light text-[#F5F1E8]">
                      {currentScene.title}
                    </h3>

                    <p className="text-sm text-[#F5F1E8]/80 font-light leading-relaxed">
                      {currentScene.description}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="pt-4 flex items-center justify-between text-xs text-[#D8C7AD]/60">
                <button
                  disabled={activeSceneIndex === 0}
                  onClick={() => setActiveSceneIndex((prev) => Math.max(0, prev - 1))}
                  className="hover:text-[#B89A62] disabled:opacity-30 cursor-pointer"
                >
                  ← Previous Moment
                </button>
                <button
                  disabled={activeSceneIndex === scenes.length - 1}
                  onClick={() => setActiveSceneIndex((prev) => Math.min(scenes.length - 1, prev + 1))}
                  className="hover:text-[#B89A62] disabled:opacity-30 cursor-pointer"
                >
                  Next Moment →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Vertical Responsive Timeline */}
        {scenes.length > 0 && (
          <div className="lg:hidden space-y-12">
            {scenes.map((scene, idx) => (
              <motion.div
                key={scene._key}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="bg-[#12100E] border border-[#B89A62]/20 p-6 space-y-4 shadow-lg"
              >
                <div className="aspect-[16/10] overflow-hidden border border-[#B89A62]/20 relative">
                  <SanityImg
                    source={scene.media}
                    options={{ width: 800, quality: 80 }}
                    alt={scene.title}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-2 left-2 bg-[#171513]/90 text-[#B89A62] text-[9px] px-2 py-1 uppercase tracking-wider">
                    0{idx + 1} • {scene.subtitle}
                  </span>
                </div>
                <h3 className="font-serif-editorial text-2xl text-[#F5F1E8]">
                  {scene.title}
                </h3>
                <p className="text-xs text-[#F5F1E8]/80 font-light leading-relaxed">
                  {scene.description}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
