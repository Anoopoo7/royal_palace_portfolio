"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Users, Home, Search } from "lucide-react";
import { format, addDays } from "date-fns";

export default function BookingBar({
  compact = false,
  initialCheckIn,
  initialCheckOut,
  initialGuests = 2,
}: {
  compact?: boolean;
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialGuests?: number;
}) {
  const router = useRouter();
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const tomorrowStr = format(addDays(new Date(), 2), "yyyy-MM-dd");

  const [checkIn, setCheckIn] = useState(initialCheckIn || todayStr);
  const [checkOut, setCheckOut] = useState(initialCheckOut || tomorrowStr);
  const [guests, setGuests] = useState(initialGuests);
  const [roomsCount, setRoomsCount] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams({
      checkIn,
      checkOut,
      guests: guests.toString(),
      rooms: roomsCount.toString(),
    });
    router.push(`/booking?${params.toString()}`);
  };

  return (
    <div className={`w-full ${compact ? "" : "max-w-6xl mx-auto px-4 -mt-16 relative z-30"}`}>
      <form
        onSubmit={handleSubmit}
        className="bg-[#1C1A17] border border-[#B89A62]/30 p-4 md:p-6 shadow-[0_10px_40px_rgba(0,0,0,0.6)] backdrop-blur-md rounded-none text-[#F5F1E8]"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          {/* Check-In */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-[0.2em] text-[#D8C7AD] flex items-center gap-1.5 font-medium">
              <Calendar className="w-3 h-3 text-[#B89A62]" />
              Check-In Date
            </label>
            <input
              type="date"
              value={checkIn}
              min={todayStr}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-full bg-[#12100E] border border-[#B89A62]/20 text-xs text-[#F5F1E8] px-3.5 py-3 focus:outline-none focus:border-[#B89A62] font-sans"
              required
            />
          </div>

          {/* Check-Out */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-[0.2em] text-[#D8C7AD] flex items-center gap-1.5 font-medium">
              <Calendar className="w-3 h-3 text-[#B89A62]" />
              Check-Out Date
            </label>
            <input
              type="date"
              value={checkOut}
              min={checkIn || todayStr}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full bg-[#12100E] border border-[#B89A62]/20 text-xs text-[#F5F1E8] px-3.5 py-3 focus:outline-none focus:border-[#B89A62] font-sans"
              required
            />
          </div>

          {/* Guests & Rooms */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-[0.2em] text-[#D8C7AD] flex items-center gap-1.5 font-medium">
                <Users className="w-3 h-3 text-[#B89A62]" />
                Guests
              </label>
              <select
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                className="w-full bg-[#12100E] border border-[#B89A62]/20 text-xs text-[#F5F1E8] px-3 py-3 focus:outline-none focus:border-[#B89A62] font-sans"
              >
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <option key={num} value={num} className="bg-[#171513]">
                    {num} {num === 1 ? "Guest" : "Guests"}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-[0.2em] text-[#D8C7AD] flex items-center gap-1.5 font-medium">
                <Home className="w-3 h-3 text-[#B89A62]" />
                Rooms
              </label>
              <select
                value={roomsCount}
                onChange={(e) => setRoomsCount(Number(e.target.value))}
                className="w-full bg-[#12100E] border border-[#B89A62]/20 text-xs text-[#F5F1E8] px-3 py-3 focus:outline-none focus:border-[#B89A62] font-sans"
              >
                {[1, 2, 3].map((num) => (
                  <option key={num} value={num} className="bg-[#171513]">
                    {num} {num === 1 ? "Room" : "Rooms"}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Submit CTA */}
          <div>
            <button
              type="submit"
              className="w-full py-3.5 bg-[#B89A62] text-[#171513] text-xs font-semibold tracking-[0.2em] uppercase hover:bg-[#D4B67E] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Check Availability</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
