"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, Calendar, Users, Home, Loader2, AlertTriangle } from "lucide-react";
import { formatDisplayDate, formatINR } from "@/lib/booking/dates";
import type { Booking } from "@/lib/booking/types";

export default function BookingConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params?.reference as string;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bookingId) return;
    const fetchBooking = async () => {
      try {
        const res = await fetch(`/api/bookings/${bookingId}`);
        const data = await res.json();
        if (!data.success) throw new Error(data.message || "Booking not found");
        setBooking(data.booking);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load booking");
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="pt-32 pb-24 min-h-screen bg-[#171513] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#B89A62] mr-2" />
        <span className="text-xs uppercase tracking-widest text-[#B89A62]">Loading confirmation...</span>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="pt-32 pb-24 min-h-screen bg-[#171513] flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <AlertTriangle className="w-8 h-8 text-red-400 mx-auto" />
          <p className="font-serif-editorial text-2xl text-[#F5F1E8]">Booking Not Found</p>
          <p className="text-xs text-[#D8C7AD]/60">{error || "We couldn't find your reservation."}</p>
          <button onClick={() => router.push("/booking")} className="text-[#B89A62] text-xs underline">
            Return to Booking
          </button>
        </div>
      </div>
    );
  }

  const nights = booking.nightlyBreakdown.length;

  return (
    <div className="pt-28 md:pt-32 pb-24 bg-[#171513] text-[#F5F1E8] min-h-screen">
      <div className="max-w-2xl mx-auto px-6 md:px-12 space-y-10">
        {/* Success header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center space-y-4"
        >
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-[#B89A62]/15 border border-[#B89A62]/30 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-[#B89A62]" />
            </div>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.4em] text-[#B89A62]">
              Reservation Confirmed
            </p>
            <h1 className="font-serif-editorial text-3xl md:text-4xl font-light text-[#F5F1E8] mt-2">
              Thank You, {booking.guestName.split(" ")[0]}
            </h1>
            <p className="text-xs text-[#D8C7AD]/60 mt-2 font-light">
              Your reservation at Royal Palace Home Stay has been confirmed.
            </p>
          </div>
          <div className="inline-block bg-[#1C1A17] border border-[#B89A62]/20 px-5 py-2.5 text-center">
            <p className="text-[9px] uppercase tracking-widest text-[#D8C7AD]/50">Booking Reference</p>
            <p className="font-mono text-lg text-[#B89A62] font-semibold tracking-widest mt-0.5">
              {booking.bookingId}
            </p>
          </div>
        </motion.div>

        {/* Booking details */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
          className="bg-[#1C1A17] border border-[#B89A62]/20 p-6 md:p-8 space-y-6"
        >
          {/* Stay dates */}
          <div className="grid grid-cols-3 gap-4 pb-6 border-b border-[#B89A62]/10">
            <div className="flex flex-col items-center text-center space-y-1">
              <Calendar className="w-4 h-4 text-[#B89A62]" />
              <p className="text-[9px] uppercase tracking-wider text-[#D8C7AD]/50">Check-in</p>
              <p className="text-sm text-[#F5F1E8] font-light">{formatDisplayDate(booking.checkIn)}</p>
              <p className="text-[10px] text-[#D8C7AD]/50">From 2:00 PM</p>
            </div>
            <div className="flex flex-col items-center text-center space-y-1">
              <Home className="w-4 h-4 text-[#B89A62]" />
              <p className="text-[9px] uppercase tracking-wider text-[#D8C7AD]/50">Duration</p>
              <p className="text-sm text-[#F5F1E8] font-light">{nights} night{nights !== 1 ? "s" : ""}</p>
              <p className="text-[10px] text-[#D8C7AD]/50">Entire homestay</p>
            </div>
            <div className="flex flex-col items-center text-center space-y-1">
              <Calendar className="w-4 h-4 text-[#B89A62]" />
              <p className="text-[9px] uppercase tracking-wider text-[#D8C7AD]/50">Check-out</p>
              <p className="text-sm text-[#F5F1E8] font-light">{formatDisplayDate(booking.checkOut)}</p>
              <p className="text-[10px] text-[#D8C7AD]/50">By 11:00 AM</p>
            </div>
          </div>

          {/* Guest info */}
          <div className="space-y-2 text-xs">
            <p className="text-[9px] uppercase tracking-wider text-[#D8C7AD]/50 mb-3">Guest Information</p>
            <div className="flex justify-between">
              <span className="text-[#D8C7AD]/60">Name</span>
              <span className="text-[#F5F1E8]">{booking.guestName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#D8C7AD]/60">Email</span>
              <span className="text-[#F5F1E8]">{booking.guestEmail}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#D8C7AD]/60">Phone</span>
              <span className="text-[#F5F1E8]">{booking.guestPhone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#D8C7AD]/60">Guests</span>
              <span className="text-[#F5F1E8]">{booking.numberOfGuests}</span>
            </div>
            {booking.specialRequests && (
              <div className="flex justify-between">
                <span className="text-[#D8C7AD]/60">Requests</span>
                <span className="text-[#F5F1E8] text-right max-w-[200px]">{booking.specialRequests}</span>
              </div>
            )}
          </div>

          {/* Price breakdown */}
          <div className="space-y-1.5 pt-4 border-t border-[#B89A62]/10">
            <p className="text-[9px] uppercase tracking-wider text-[#D8C7AD]/50 mb-3">Price Breakdown</p>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {booking.nightlyBreakdown.map((n) => (
                <div key={n.date} className="flex justify-between text-xs">
                  <span className="text-[#D8C7AD]/60">{formatDisplayDate(n.date)}</span>
                  <span className="text-[#F5F1E8]/80">{formatINR(n.price)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-[#B89A62]/20 mt-2">
              <span className="text-xs uppercase tracking-widest text-[#D8C7AD]">Total Paid on Arrival</span>
              <span className="font-serif-editorial text-2xl text-[#B89A62]">
                {formatINR(booking.totalAmount)}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Next steps */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center space-y-4"
        >
          <p className="text-xs text-[#D8C7AD]/50 font-light max-w-sm mx-auto leading-relaxed">
            A confirmation will be shared via WhatsApp or email. Payment is due on arrival at the property.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="/"
              className="text-xs uppercase tracking-wider text-[#D8C7AD]/60 hover:text-[#B89A62] transition-colors"
            >
              ← Return Home
            </a>
            <span className="text-[#B89A62]/20 hidden sm:block">|</span>
            <a
              href="/experiences"
              className="text-xs uppercase tracking-wider text-[#B89A62] hover:text-[#D4B67E] transition-colors"
            >
              Explore Experiences →
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
