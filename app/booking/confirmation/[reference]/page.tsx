import { getReservationByReference } from "@/lib/db/booking-service";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Calendar, MapPin, Phone, Mail, ShieldCheck } from "lucide-react";
import { MOCK_SITE_SETTINGS } from "@/lib/mock-data";

export async function generateMetadata(props: { params: Promise<{ reference: string }> }) {
  const { reference } = await props.params;
  return {
    title: `Booking Confirmation ${reference}`,
    description: "Your reservation details at Royal Palace Varkala",
  };
}

export default async function BookingConfirmationPage(props: { params: Promise<{ reference: string }> }) {
  const { reference } = await props.params;
  const reservation = await getReservationByReference(reference);

  if (!reservation) {
    notFound();
  }

  return (
    <div className="pt-32 pb-24 bg-[#171513] text-[#F5F1E8] min-h-screen">
      <div className="max-w-3xl mx-auto px-6 md:px-12 space-y-8">
        {/* Success Banner */}
        <div className="bg-[#12100E] border border-[#B89A62]/40 p-8 text-center space-y-4 shadow-2xl">
          <CheckCircle2 className="w-16 h-16 text-[#B89A62] mx-auto" />
          <span className="text-[10px] uppercase tracking-[0.35em] text-[#B89A62] font-semibold block">
            RESERVATION CONFIRMED
          </span>
          <h1 className="font-serif-editorial text-4xl md:text-5xl font-light text-[#F5F1E8]">
            We Look Forward to Your Arrival
          </h1>
          <div className="pt-2">
            <span className="text-xs text-[#D8C7AD] uppercase tracking-wider block">Booking Reference</span>
            <span className="font-mono text-2xl font-bold text-[#B89A62] tracking-widest">
              {reservation.bookingReference}
            </span>
          </div>
        </div>

        {/* Reservation Breakdown Card */}
        <div className="bg-[#1C1A17] border border-[#B89A62]/20 p-8 space-y-6 shadow-xl">
          <h3 className="font-serif-editorial text-2xl text-[#F5F1E8] border-b border-[#B89A62]/20 pb-4">
            Reservation Summary
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-[#F5F1E8]/90 font-light">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#B89A62] block">Reserved Accommodation</span>
              <span className="text-base font-medium text-[#F5F1E8] mt-0.5 block">{reservation.roomName}</span>
            </div>

            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#B89A62] block">Guests</span>
              <span className="text-base font-medium text-[#F5F1E8] mt-0.5 block">{reservation.guests} Guest(s)</span>
            </div>

            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#B89A62] block">Check-In Date</span>
              <span className="font-mono text-sm text-[#F5F1E8] mt-0.5 block">{reservation.checkIn} (from 2:00 PM)</span>
            </div>

            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#B89A62] block">Check-Out Date</span>
              <span className="font-mono text-sm text-[#F5F1E8] mt-0.5 block">{reservation.checkOut} (until 11:00 AM)</span>
            </div>

            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#B89A62] block">Primary Guest Name</span>
              <span className="text-sm font-medium text-[#F5F1E8] mt-0.5 block">{reservation.guestName}</span>
            </div>

            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#B89A62] block">Total Stay Amount</span>
              <span className="font-serif text-xl font-medium text-[#B89A62] mt-0.5 block">
                ₹{reservation.totalAmount.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          {reservation.specialRequests && (
            <div className="pt-4 border-t border-[#B89A62]/10 text-xs">
              <span className="text-[10px] uppercase tracking-wider text-[#B89A62] block">Special Requests</span>
              <p className="text-[#F5F1E8]/80 font-light mt-1 italic">"{reservation.specialRequests}"</p>
            </div>
          )}
        </div>

        {/* Next Steps & Property Contact */}
        <div className="bg-[#12100E] border border-[#B89A62]/20 p-8 space-y-4">
          <h3 className="font-serif-editorial text-2xl text-[#F5F1E8]">
            Next Steps & Arrival Guidance
          </h3>
          <ul className="text-xs text-[#F5F1E8]/70 space-y-2 font-light">
            <li>• A detailed confirmation email has been dispatched to {reservation.guestEmail}.</li>
            <li>• Need airport transfer from Trivandrum (TRV)? Connect directly with our concierge.</li>
            <li>• Payment can be settled upon arrival via card, UPI, or cash.</li>
          </ul>

          <div className="pt-4 border-t border-[#B89A62]/10 flex flex-col sm:flex-row justify-between items-center text-xs gap-4">
            <div className="flex items-center space-x-2 text-[#D8C7AD]">
              <Phone className="w-4 h-4 text-[#B89A62]" />
              <span>Hotline: {MOCK_SITE_SETTINGS.phone}</span>
            </div>
            <Link
              href="/"
              className="px-6 py-2.5 bg-[#B89A62] text-[#171513] text-[11px] font-semibold tracking-widest uppercase hover:bg-[#D4B67E] transition-all"
            >
              Return to Homepage
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
