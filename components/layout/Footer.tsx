"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MOCK_SITE_SETTINGS, MOCK_NAVIGATION } from "@/lib/mock-data";

export default function Footer() {
  const pathname = usePathname();

  if (pathname?.startsWith("/studio")) {
    return null;
  }

  return (
    <footer className="bg-[#12100E] text-[#F5F1E8] border-t border-[#B89A62]/20 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-12 gap-12 pb-16 border-b border-[#B89A62]/10">
        {/* Brand Statement */}
        <div className="md:col-span-5 space-y-4">
          <Link href="/" className="inline-block">
            <span className="font-serif-editorial text-2xl tracking-[0.25em] text-[#F5F1E8]">
              ROYAL PALACE
            </span>
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#D8C7AD] mt-1">
              Private Resort Homestay • Varkala
            </p>
          </Link>
          <p className="text-sm text-[#F5F1E8]/70 leading-relaxed max-w-md font-light">
            A private luxury resort homestay on the red clay cliffs of Varkala, Kerala. Engineered for silent luxury, authentic coastal dining, and unhurried tropical living.
          </p>
        </div>

        {/* Quick Links */}
        <div className="md:col-span-3 space-y-4">
          <h4 className="text-xs uppercase tracking-[0.25em] text-[#B89A62] font-semibold">
            Navigation
          </h4>
          <ul className="space-y-2 text-xs tracking-wider">
            {MOCK_NAVIGATION.map((nav) => (
              <li key={nav._key}>
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
            Location & Contact
          </h4>
          <div className="space-y-2 text-xs text-[#F5F1E8]/70 font-light leading-relaxed">
            <p>{MOCK_SITE_SETTINGS.address}</p>
            <p>
              Phone:{" "}
              <a href={`tel:${MOCK_SITE_SETTINGS.phone}`} className="hover:text-[#B89A62]">
                {MOCK_SITE_SETTINGS.phone}
              </a>
            </p>
            <p>
              Email:{" "}
              <a href={`mailto:${MOCK_SITE_SETTINGS.email}`} className="hover:text-[#B89A62]">
                {MOCK_SITE_SETTINGS.email}
              </a>
            </p>
            <div className="pt-2 flex space-x-4">
              <a
                href={MOCK_SITE_SETTINGS.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#D8C7AD] hover:text-[#B89A62] transition-colors"
              >
                Instagram
              </a>
              <span>•</span>
              <a
                href={MOCK_SITE_SETTINGS.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#D8C7AD] hover:text-[#B89A62] transition-colors"
              >
                Facebook
              </a>
              <span>•</span>
              <a
                href={MOCK_SITE_SETTINGS.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#D8C7AD] hover:text-[#B89A62] transition-colors"
              >
                Google Maps
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Subfooter */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-8 flex flex-col md:flex-row justify-between items-center text-[11px] text-[#F5F1E8]/40 space-y-4 md:space-y-0 font-light">
        <p>© {new Date().getFullYear()} ROYAL PALACE VARKALA. All rights reserved.</p>
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
