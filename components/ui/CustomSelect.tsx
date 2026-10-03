"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";

export interface CustomSelectOption {
  value: string;
  label: string;
}

export default function CustomSelect({
  value,
  onChange,
  options,
  placeholder,
  className = "",
}: {
  value: string;
  onChange: (val: string) => void;
  options: CustomSelectOption[];
  placeholder?: string;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-[#12100E] border border-[#B89A62]/20 text-[#F5F1E8] text-xs px-3.5 py-2.5 flex items-center justify-between focus:outline-none focus:border-[#B89A62] transition-colors cursor-pointer text-left"
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder || "Select option"}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-[#B89A62] shrink-0 ml-2 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full mt-1 bg-[#1A1714] border border-[#B89A62]/30 shadow-2xl z-50 max-h-60 overflow-y-auto py-1 rounded-none custom-scrollbar"
          >
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2 text-xs transition-colors flex items-center justify-between cursor-pointer ${
                  value === option.value
                    ? "bg-[#B89A62]/20 text-[#B89A62] font-semibold"
                    : "text-[#F5F1E8]/80 hover:bg-[#B89A62]/10 hover:text-[#F5F1E8]"
                }`}
              >
                <span className="truncate">{option.label}</span>
                {value === option.value && <Check className="w-3.5 h-3.5 text-[#B89A62] shrink-0 ml-2" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
