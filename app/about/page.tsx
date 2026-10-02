import Link from "next/link";
import { MOCK_SITE_SETTINGS } from "@/lib/mock-data";

export const metadata = {
  title: "About Royal Palace",
  description: "The story behind Royal Palace private resort homestay in Varkala, Kerala.",
};

export default function AboutPage() {
  return (
    <div className="pt-32 pb-24 bg-[#171513] text-[#F5F1E8] min-h-screen">
      <div className="max-w-4xl mx-auto px-6 md:px-12 space-y-16">
        <div className="text-center space-y-4">
          <span className="text-[10px] uppercase tracking-[0.35em] text-[#B89A62] font-semibold">
            OUR PHILOSOPHY
          </span>
          <h1 className="font-serif-editorial text-4xl md:text-6xl font-light">
            Slow Hospitality in Kerala
          </h1>
        </div>

        <div className="aspect-[16/9] overflow-hidden border border-[#B89A62]/30 shadow-2xl">
          <img
            src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1600&q=80"
            alt="Royal Palace Varkala Architecture"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="space-y-6 text-sm text-[#F5F1E8]/80 font-light leading-relaxed">
          <h2 className="font-serif-editorial text-3xl text-[#F5F1E8]">
            Crafted for Unhurried Living
          </h2>
          <p>
            Royal Palace was conceived as an architectural antidote to fast-paced commercial resorts. Located on the serene red clay cliffs of Varkala, the property celebrates natural Malabar teak wood, open garden courtyards, and sea breezes.
          </p>
          <p>
            Every detail — from our daily coastal sea catch cooked over banana leaves to sunrise backwater kayaking — is curated to help guests reconnect with nature and quiet living.
          </p>
        </div>

        <div className="bg-[#12100E] border border-[#B89A62]/20 p-8 text-center space-y-4">
          <h3 className="font-serif-editorial text-2xl text-[#F5F1E8]">
            Plan Your Varkala Escape
          </h3>
          <p className="text-xs text-[#F5F1E8]/70 max-w-md mx-auto">
            Experience private ocean view suites and personalized Kerala hospitality.
          </p>
          <Link
            href="/booking"
            className="inline-block px-8 py-3.5 bg-[#B89A62] text-[#171513] text-xs font-semibold tracking-[0.2em] uppercase hover:bg-[#D4B67E] transition-all"
          >
            Check Room Availability
          </Link>
        </div>
      </div>
    </div>
  );
}
