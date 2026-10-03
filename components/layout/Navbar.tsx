"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Calendar, MessageSquare, User } from "lucide-react";
import { MOCK_NAVIGATION } from "@/lib/mock-data";
import SanityImg from "@/components/ui/SanityImg";
import type { SiteSettings, NavItem } from "@/lib/sanity/types";

interface NavbarProps {
  settings: SiteSettings;
  navigation: NavItem[];
}

export default function Navbar({ settings, navigation }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navItems = navigation.length > 0 ? navigation : MOCK_NAVIGATION;
  const whatsappNumber = settings.whatsapp?.replace(/\D/g, "") ?? "";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Hide header on studio route
  if (pathname?.startsWith("/studio")) {
    return null;
  }

  const isHome = pathname === "/";

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled || !isHome
            ? "bg-[#171513]/90 backdrop-blur-md border-b border-[#B89A62]/20 py-4 shadow-xl"
            : "bg-gradient-to-b from-[#171513]/80 via-[#171513]/30 to-transparent py-6"
          }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="group flex items-center gap-3">
            {settings.logo?.asset?._ref ? (
              <SanityImg
                source={settings.logo}
                options={{ height: 48 }}
                alt={settings.propertyName ?? "Royal Palace"}
                className="h-10 md:h-12 w-auto object-contain"
              />
            ) : (
              <span className="flex flex-col">
                <span className="font-serif-editorial text-xl md:text-2xl font-light tracking-[0.2em] text-[#F5F1E8] group-hover:text-[#B89A62] transition-colors">
                  {settings.propertyName ?? "ROYAL PALACE"}
                </span>
                <span className="text-[9px] uppercase tracking-[0.3em] text-[#D8C7AD] font-sans">
                  Varkala • Kerala
                </span>
              </span>
            )}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navItems.map((item, index) => {
              const active = pathname === item.url;
              return (
                <Link
                  key={`${item._key}-${index}`}
                  href={item.url}
                  className={`text-xs uppercase tracking-[0.2em] transition-colors relative py-1 ${active ? "text-[#B89A62]" : "text-[#F5F1E8]/80 hover:text-[#F5F1E8]"
                    }`}
                >
                  {item.label}
                  {active && (
                    <motion.span
                      layoutId="activeIndicator"
                      className="absolute bottom-0 left-0 right-0 h-[1px] bg-[#B89A62]"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden lg:flex items-center space-x-5">
            {whatsappNumber && (
              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#D8C7AD] hover:text-[#B89A62] transition-colors p-2"
                title="WhatsApp Concierge"
              >
                <MessageSquare className="w-4 h-4" />
              </a>
            )}

            <Link
              href="/account"
              className="text-[#D8C7AD] hover:text-[#B89A62] transition-colors p-2 flex items-center gap-1.5 text-xs uppercase tracking-wider"
              title="My Account & Bookings"
            >
              <User className="w-4 h-4 text-[#B89A62]" />
              <span>Account</span>
            </Link>

            <Link
              href="/booking"
              className="px-5 py-2.5 bg-[#B89A62] text-[#171513] text-xs font-semibold tracking-[0.18em] uppercase transition-all duration-300 hover:bg-[#D4B67E] hover:shadow-[0_0_20px_rgba(184,154,98,0.4)] flex items-center gap-2"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Book Stay</span>
            </Link>
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="lg:hidden flex items-center gap-3">
            <Link
              href="/booking"
              className="px-3.5 py-1.5 bg-[#B89A62] text-[#171513] text-[10px] font-semibold tracking-wider uppercase"
            >
              Book
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#F5F1E8] focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Fullscreen Navigation Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: "-100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "-100%" }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-40 bg-[#171513] flex flex-col justify-between p-8 pt-24"
          >
            {/* Mobile menu logo */}
            <div className="absolute top-6 left-8">
              <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                {settings.logo?.asset?._ref ? (
                  <SanityImg
                    source={settings.logo}
                    options={{ height: 40 }}
                    alt={settings.propertyName ?? "Royal Palace"}
                    className="h-9 w-auto object-contain"
                  />
                ) : (
                  <span className="font-serif-editorial text-xl text-[#F5F1E8]">
                    {settings.propertyName ?? "ROYAL PALACE"}
                  </span>
                )}
              </Link>
            </div>

            <div className="flex flex-col space-y-6">
              {navItems.map((item, index) => (
                <motion.div
                  key={item._key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                >
                  <Link
                    href={item.url}
                    onClick={() => setMobileMenuOpen(false)}
                    className="font-serif-editorial text-3xl text-[#F5F1E8] hover:text-[#B89A62] transition-colors"
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="border-t border-[#B89A62]/20 pt-6 space-y-4">
              <Link
                href="/booking"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-4 bg-[#B89A62] text-[#171513] text-center text-xs font-semibold tracking-[0.2em] uppercase block"
              >
                CHECK AVAILABILITY
              </Link>
              <div className="flex justify-between text-xs text-[#D8C7AD] pt-2">
                <span>Varkala, Kerala, India</span>
                {settings.phone && (
                  <a href={`tel:${settings.phone}`} className="hover:text-[#B89A62]">
                    {settings.phone}
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
