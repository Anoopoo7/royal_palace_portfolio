import type { Metadata } from "next";
import AvailabilityCalendar from "@/components/availability/AvailabilityCalendar";

export const metadata: Metadata = {
  title: "Availability & Pricing | Royal Palace Varkala",
  description:
    "Check real-time availability and daily rates for Royal Palace Home Stay, Varkala. Browse open dates, see live pricing, and plan your stay.",
};

export default function AvailabilityPage() {
  return (
    <div className="pt-28 md:pt-32 pb-24 bg-[#171513] text-[#F5F1E8] min-h-screen">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="mb-12 md:mb-16 space-y-4 max-w-2xl">
          <span className="text-[10px] uppercase tracking-[0.4em] text-[#B89A62] font-semibold">
            Availability & Pricing
          </span>
          <h1 className="font-serif-editorial text-4xl md:text-6xl font-light leading-tight text-[#F5F1E8]">
            Plan Your
            <br />
            <span className="italic text-[#B89A62]">Royal Stay</span>
          </h1>
          <p className="text-sm text-[#D8C7AD]/80 font-light leading-relaxed max-w-lg">
            Browse live availability for Royal Palace Home Stay. Select your dates to see real-time
            pricing and proceed to your reservation.
          </p>
        </div>

        {/* Two-column layout: calendar + sticky info panel */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-12 xl:gap-16">
          {/* Calendar — takes 2/3 */}
          <div className="xl:col-span-2">
            <AvailabilityCalendar navigateToBooking />
          </div>

          {/* Info sidebar — sticky on desktop */}
          <div className="xl:col-span-1">
            <div className="xl:sticky xl:top-32 space-y-6">
              {/* Property summary */}
              <div className="border border-[#B89A62]/20 p-6 space-y-4">
                <p className="text-[10px] uppercase tracking-[0.3em] text-[#B89A62]">
                  The Property
                </p>
                <h2 className="font-serif-editorial text-2xl text-[#F5F1E8] font-light">
                  Royal Palace
                  <br />
                  Home Stay
                </h2>
                <p className="text-xs text-[#D8C7AD]/70 leading-relaxed font-light">
                  A private coastal retreat on the red-clay cliffs of Varkala, Kerala. The entire
                  property is yours — no shared spaces, no other guests.
                </p>
                <div className="pt-2 space-y-2 text-xs text-[#D8C7AD]/60 border-t border-[#B89A62]/10">
                  <div className="flex justify-between">
                    <span>Location</span>
                    <span className="text-[#F5F1E8]/70">Varkala, Kerala</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Style</span>
                    <span className="text-[#F5F1E8]/70">Entire Homestay</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Check-in</span>
                    <span className="text-[#F5F1E8]/70">2:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Check-out</span>
                    <span className="text-[#F5F1E8]/70">11:00 AM</span>
                  </div>
                </div>
              </div>

              {/* Booking info */}
              <div className="border border-[#B89A62]/20 p-6 space-y-3">
                <p className="text-[10px] uppercase tracking-[0.3em] text-[#B89A62]">
                  How to Book
                </p>
                <ol className="space-y-2.5 text-xs text-[#D8C7AD]/70 font-light leading-relaxed">
                  <li className="flex gap-2.5">
                    <span className="text-[#B89A62] font-semibold w-4 flex-shrink-0">1.</span>
                    <span>Select your check-in date on the calendar</span>
                  </li>
                  <li className="flex gap-2.5">
                    <span className="text-[#B89A62] font-semibold w-4 flex-shrink-0">2.</span>
                    <span>Select your check-out date</span>
                  </li>
                  <li className="flex gap-2.5">
                    <span className="text-[#B89A62] font-semibold w-4 flex-shrink-0">3.</span>
                    <span>Review the nightly pricing breakdown</span>
                  </li>
                  <li className="flex gap-2.5">
                    <span className="text-[#B89A62] font-semibold w-4 flex-shrink-0">4.</span>
                    <span>Click Continue to enter your details</span>
                  </li>
                </ol>
              </div>

              {/* Contact for custom dates */}
              <div className="bg-[#1C1A17] border border-[#B89A62]/20 p-6 space-y-3">
                <p className="text-[10px] uppercase tracking-[0.3em] text-[#B89A62]">
                  Need help?
                </p>
                <p className="text-xs text-[#D8C7AD]/70 font-light leading-relaxed">
                  For custom requests, extended stays, or group arrangements, contact us directly.
                </p>
                <a
                  href="/contact"
                  className="inline-block text-xs text-[#B89A62] hover:text-[#D4B67E] transition-colors uppercase tracking-wider underline underline-offset-2"
                >
                  Contact Us →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
