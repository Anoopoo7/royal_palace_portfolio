"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MOCK_NAVIGATION } from "@/lib/mock-data";
import SanityImg from "@/components/ui/SanityImg";
import type { SiteSettings, NavItem } from "@/lib/sanity/types";

interface FooterProps {
  settings: SiteSettings;
  navigation: NavItem[];
}

export default function Footer({ settings, navigation }: FooterProps) {
  const pathname = usePathname();
  const navItems = navigation.length > 0 ? navigation : MOCK_NAVIGATION;

  if (pathname?.startsWith("/studio")) {
    return null;
  }

  return (
    <footer className="bg-[#12100E] text-[#F5F1E8] border-t border-[#B89A62]/20 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-12 gap-12 pb-16 border-b border-[#B89A62]/10">
        {/* Brand Statement */}
        <div className="md:col-span-5 space-y-4">
          <Link href="/" className="inline-block">
            {settings.logo?.asset?._ref ? (
              <SanityImg
                source={settings.logo}
                alt={settings.propertyName ?? "Royal Palace"}
                className="h-11 w-auto object-contain"
              />
            ) : (
              <>
                <span className="font-serif-editorial text-2xl tracking-[0.25em] text-[#F5F1E8]">
                  {settings.propertyName ?? "ROYAL PALACE"}
                </span>
                <p className="text-[10px] uppercase tracking-[0.3em] text-[#D8C7AD] mt-1">
                  Private Resort Homestay • Varkala
                </p>
              </>
            )}
          </Link>
          <p className="text-sm text-[#F5F1E8]/70 leading-relaxed max-w-md font-light">
            {settings.tagline ??
              "A private luxury resort homestay on the red clay cliffs of Varkala, Kerala. Engineered for silent luxury, authentic coastal dining, and unhurried tropical living."}
          </p>
        </div>

        {/* Quick Links */}
        <div className="md:col-span-3 space-y-4">
          <h4 className="text-xs uppercase tracking-[0.25em] text-[#B89A62] font-semibold">
            Navigation
          </h4>
          <ul className="space-y-2 text-xs tracking-wider">
            {navItems.map((nav, index) => (
              <li key={`${nav._key}-${index}`}>
                <Link
                  href={nav.url}
                  className="text-[#F5F1E8]/70 hover:text-[#B89A62] transition-colors"
                >
                  {nav.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/booking" className="text-[#B89A62] hover:underline font-medium">
                Book Stay
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact Information */}
        <div className="md:col-span-4 space-y-4">
          <h4 className="text-xs uppercase tracking-[0.25em] text-[#B89A62] font-semibold">
            Location &amp; Contact
          </h4>
          <div className="space-y-2 text-xs text-[#F5F1E8]/70 font-light leading-relaxed">
            {settings.address && <p>{settings.address}</p>}
            {settings.phone && (
              <p>
                Phone:{" "}
                <a href={`tel:${settings.phone}`} className="hover:text-[#B89A62]">
                  {settings.phone}
                </a>
              </p>
            )}
            {settings.email && (
              <p>
                Email:{" "}
                <a href={`mailto:${settings.email}`} className="hover:text-[#B89A62]">
                  {settings.email}
                </a>
              </p>
            )}
            <div className="pt-2 flex flex-wrap gap-x-4 gap-y-1 items-center">
              {settings.instagramUrl && (
                <a
                  href={settings.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#D8C7AD] hover:text-[#B89A62] transition-colors"
                >
                  Instagram
                </a>
              )}
              {settings.facebookUrl && (
                <a
                  href={settings.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#D8C7AD] hover:text-[#B89A62] transition-colors"
                >
                  Facebook
                </a>
              )}
              {settings.googleMapsUrl && (
                <a
                  href={settings.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#D8C7AD] hover:text-[#B89A62] transition-colors"
                >
                  Google Maps
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Subfooter */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-8 flex flex-col md:flex-row justify-between items-center text-[11px] text-[#F5F1E8]/40 space-y-4 md:space-y-0 font-light">
        <p>
          © {new Date().getFullYear()}{" "}
          {(settings.propertyName ?? "ROYAL PALACE VARKALA").toUpperCase()}. All rights reserved.
        </p>
        <div className="flex space-x-6">
          <Link href="/privacy" className="hover:text-[#D8C7AD]">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-[#D8C7AD]">
            Terms of Stay
          </Link>
          <Link href="/cancellation" className="hover:text-[#D8C7AD]">
            Cancellation Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
