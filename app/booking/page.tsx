"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { format, addDays } from "date-fns";
import { Calendar, Users, Home, CheckCircle2, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import { DbRoom } from "@/lib/db/booking-service";

function BookingFlowContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const todayStr = format(new Date(), "yyyy-MM-dd");
  const tomorrowStr = format(addDays(new Date(), 2), "yyyy-MM-dd");

  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Dates & Room, 2: Guest Details, 3: Review & Submit
  const [checkIn, setCheckIn] = useState(searchParams.get("checkIn") || todayStr);
  const [checkOut, setCheckOut] = useState(searchParams.get("checkOut") || tomorrowStr);
  const [guests, setGuests] = useState(Number(searchParams.get("guests")) || 2);
  const [roomsCount, setRoomsCount] = useState(Number(searchParams.get("rooms")) || 1);

  const [availableRooms, setAvailableRooms] = useState<DbRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<DbRoom | null>(null);
  const [requestedNights, setRequestedNights] = useState(1);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [availabilityError, setAvailabilityError] = useState("");

  // Guest details form state
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState("");

  // Fetch real-time availability when dates/guests change
  const fetchAvailability = async () => {
    setLoadingAvailability(true);
    setAvailabilityError("");
    try {
      const res = await fetch(
        `/api/availability?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}&rooms=${roomsCount}`
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to check availability");
      }
      setAvailableRooms(data.rooms || []);
      setRequestedNights(data.requestedNights || 1);

      // Preselect room if passed in URL
      const preselectedSlug = searchParams.get("room");
      if (preselectedSlug) {
        const match = data.rooms?.find((r: DbRoom) => r.slug === preselectedSlug);
        if (match) setSelectedRoom(match);
        else if (data.rooms?.length > 0) setSelectedRoom(data.rooms[0]);
      } else if (data.rooms?.length > 0) {
        setSelectedRoom(data.rooms[0]);
      }
    } catch (err: unknown) {
      setAvailabilityError(err instanceof Error ? err.message : "Error checking availability");
    } finally {
      setLoadingAvailability(false);
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, [checkIn, checkOut, guests, roomsCount]);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom) return;

    setSubmitting(true);
    setBookingError("");

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomSlug: selectedRoom.slug,
          checkIn,
          checkOut,
          guests,
          roomsCount,
          guestName,
          guestEmail,
          guestPhone,
          specialRequests,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to complete reservation");
      }

      // On successful server reservation creation:
      router.push(`/booking/confirmation/${data.bookingReference}`);
    } catch (err: unknown) {
      setBookingError(err instanceof Error ? err.message : "Booking submission error");
    } finally {
      setSubmitting(false);
    }
  };

  const totalPrice = selectedRoom
    ? selectedRoom.basePricePerNight * requestedNights * roomsCount
    : 0;

  return (
    <div className="pt-32 pb-24 bg-[#171513] text-[#F5F1E8] min-h-screen">
      <div className="max-w-6xl mx-auto px-6 md:px-12 space-y-12">
        {/* Header */}
        <div className="text-center space-y-3">
          <span className="text-[10px] uppercase tracking-[0.35em] text-[#B89A62] font-semibold">
            ROYAL PALACE RESERVATION
          </span>
          <h1 className="font-serif-editorial text-4xl md:text-6xl font-light">
            Reserve Your Private Stay
          </h1>
        </div>

        {/* Step Indicator */}
        <div className="flex justify-center items-center space-x-4 border-b border-[#B89A62]/20 pb-6 text-xs tracking-widest uppercase">
          <span className={`flex items-center gap-2 ${step === 1 ? "text-[#B89A62] font-semibold" : "text-[#D8C7AD]/50"}`}>
            1. Dates & Suite
          </span>
          <span>•</span>
          <span className={`flex items-center gap-2 ${step === 2 ? "text-[#B89A62] font-semibold" : "text-[#D8C7AD]/50"}`}>
            2. Guest Details
          </span>
          <span>•</span>
          <span className={`flex items-center gap-2 ${step === 3 ? "text-[#B89A62] font-semibold" : "text-[#D8C7AD]/50"}`}>
            3. Review & Confirm
          </span>
        </div>

        {/* Step 1: Select Dates & Room */}
        {step === 1 && (
          <div className="space-y-8">
            <div className="bg-[#1C1A17] border border-[#B89A62]/30 p-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider text-[#D8C7AD]">Check-In</label>
                <input
                  type="date"
                  value={checkIn}
                  min={todayStr}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full bg-[#12100E] border border-[#B89A62]/20 text-xs text-[#F5F1E8] px-3.5 py-3"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider text-[#D8C7AD]">Check-Out</label>
                <input
                  type="date"
                  value={checkOut}
                  min={checkIn}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full bg-[#12100E] border border-[#B89A62]/20 text-xs text-[#F5F1E8] px-3.5 py-3"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider text-[#D8C7AD]">Guests</label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  className="w-full bg-[#12100E] border border-[#B89A62]/20 text-xs text-[#F5F1E8] px-3.5 py-3"
                >
                  {[1, 2, 3, 4, 5, 6].map((g) => (
                    <option key={g} value={g}>
                      {g} Guests
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={fetchAvailability}
                className="w-full py-3.5 bg-[#B89A62] text-[#171513] text-xs font-semibold tracking-[0.2em] uppercase hover:bg-[#D4B67E] transition-all cursor-pointer"
              >
                Update Search
              </button>
            </div>

            {loadingAvailability ? (
              <div className="py-16 text-center text-[#B89A62] flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="text-xs uppercase tracking-widest">Checking Real-Time Inventory...</span>
              </div>
            ) : availabilityError ? (
              <div className="bg-red-900/20 border border-red-500/40 p-4 text-red-200 text-xs text-center">
                {availabilityError}
              </div>
            ) : availableRooms.length === 0 ? (
              <div className="bg-[#12100E] border border-[#B89A62]/20 p-12 text-center space-y-3">
                <p className="font-serif-editorial text-2xl text-[#F5F1E8]">No Rooms Available</p>
                <p className="text-xs text-[#D8C7AD]">Please try selecting different dates for your stay.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <h3 className="font-serif-editorial text-2xl text-[#F5F1E8]">
                  Available Suites ({availableRooms.length})
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {availableRooms.map((room) => {
                    const isSelected = selectedRoom?.slug === room.slug;
                    return (
                      <div
                        key={room.slug}
                        onClick={() => setSelectedRoom(room)}
                        className={`bg-[#12100E] border p-6 flex flex-col justify-between cursor-pointer transition-all ${
                          isSelected
                            ? "border-[#B89A62] bg-[#1C1A17] shadow-[0_0_25px_rgba(184,154,98,0.25)]"
                            : "border-[#B89A62]/20 hover:border-[#B89A62]/50"
                        }`}
                      >
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <h4 className="font-serif-editorial text-2xl text-[#F5F1E8]">
                              {room.name}
                            </h4>
                            {isSelected && <CheckCircle2 className="w-5 h-5 text-[#B89A62]" />}
                          </div>

                          <span className="text-[10px] uppercase tracking-wider text-[#B89A62] block">
                            {room.roomType} • Max {room.capacity} Guests
                          </span>

                          <div className="text-xs text-[#D8C7AD] pt-2 border-t border-[#B89A62]/10">
                            Rate: ₹{room.basePricePerNight.toLocaleString("en-IN")} / night
                          </div>
                        </div>

                        <button
                          type="button"
                          className={`mt-6 w-full py-2.5 text-xs uppercase tracking-widest font-semibold transition-all ${
                            isSelected
                              ? "bg-[#B89A62] text-[#171513]"
                              : "border border-[#B89A62]/40 text-[#F5F1E8] hover:bg-[#B89A62] hover:text-[#171513]"
                          }`}
                        >
                          {isSelected ? "Selected" : "Select Room"}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {selectedRoom && (
                  <div className="pt-6 flex justify-end">
                    <button
                      onClick={() => setStep(2)}
                      className="px-8 py-4 bg-[#B89A62] text-[#171513] text-xs font-semibold tracking-[0.2em] uppercase hover:bg-[#D4B67E] transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <span>Proceed to Guest Details</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Guest Details */}
        {step === 2 && (
          <div className="max-w-2xl mx-auto bg-[#1C1A17] border border-[#B89A62]/30 p-8 space-y-6 shadow-2xl">
            <h3 className="font-serif-editorial text-2xl text-[#F5F1E8] border-b border-[#B89A62]/20 pb-4">
              Enter Guest Details
            </h3>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-[#D8C7AD]">Full Name *</label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="e.g. Eleanor Vance"
                  className="w-full bg-[#12100E] border border-[#B89A62]/20 text-xs px-3.5 py-3 text-[#F5F1E8] focus:outline-none focus:border-[#B89A62]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-[#D8C7AD]">Email Address *</label>
                  <input
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="eleanor@example.com"
                    className="w-full bg-[#12100E] border border-[#B89A62]/20 text-xs px-3.5 py-3 text-[#F5F1E8] focus:outline-none focus:border-[#B89A62]"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-[#D8C7AD]">Phone Number *</label>
                  <input
                    type="tel"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-[#12100E] border border-[#B89A62]/20 text-xs px-3.5 py-3 text-[#F5F1E8] focus:outline-none focus:border-[#B89A62]"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-[#D8C7AD]">Special Requests / Dietary Needs</label>
                <textarea
                  rows={3}
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="e.g. Airport pickup, early check-in, vegetarian meals..."
                  className="w-full bg-[#12100E] border border-[#B89A62]/20 text-xs px-3.5 py-3 text-[#F5F1E8] focus:outline-none focus:border-[#B89A62]"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-3 border border-[#B89A62]/30 text-[#D8C7AD] text-xs uppercase tracking-widest hover:text-[#F5F1E8] cursor-pointer"
              >
                Back to Selection
              </button>

              <button
                disabled={!guestName || !guestEmail || !guestPhone}
                onClick={() => setStep(3)}
                className="px-8 py-3.5 bg-[#B89A62] text-[#171513] text-xs font-semibold tracking-[0.2em] uppercase hover:bg-[#D4B67E] disabled:opacity-40 transition-all cursor-pointer"
              >
                Review Reservation
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review & Submit */}
        {step === 3 && selectedRoom && (
          <div className="max-w-2xl mx-auto bg-[#1C1A17] border border-[#B89A62]/30 p-8 space-y-6 shadow-2xl">
            <h3 className="font-serif-editorial text-2xl text-[#F5F1E8] border-b border-[#B89A62]/20 pb-4">
              Review Reservation Details
            </h3>

            <div className="space-y-4 text-xs font-light text-[#F5F1E8]/90 bg-[#12100E] p-6 border border-[#B89A62]/20">
              <div className="flex justify-between pb-2 border-b border-[#B89A62]/10">
                <span className="text-[#D8C7AD]">Suite Choice:</span>
                <span className="font-medium text-[#F5F1E8]">{selectedRoom.name}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-[#B89A62]/10">
                <span className="text-[#D8C7AD]">Check-In:</span>
                <span className="font-mono text-[#F5F1E8]">{checkIn}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-[#B89A62]/10">
                <span className="text-[#D8C7AD]">Check-Out:</span>
                <span className="font-mono text-[#F5F1E8]">{checkOut}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-[#B89A62]/10">
                <span className="text-[#D8C7AD]">Duration:</span>
                <span>{requestedNights} Night(s)</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-[#B89A62]/10">
                <span className="text-[#D8C7AD]">Primary Guest:</span>
                <span>{guestName} ({guestEmail})</span>
              </div>
              <div className="flex justify-between pt-2 text-sm font-semibold text-[#B89A62]">
                <span>Total Amount Due:</span>
                <span className="font-serif text-lg">₹{totalPrice.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {bookingError && (
              <div className="bg-red-900/20 border border-red-500/40 p-4 text-red-200 text-xs">
                {bookingError}
              </div>
            )}

            <div className="pt-2 space-y-4">
              <button
                disabled={submitting}
                onClick={handleBookingSubmit}
                className="w-full py-4 bg-[#B89A62] text-[#171513] text-xs font-semibold tracking-[0.25em] uppercase hover:bg-[#D4B67E] disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xl"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing Reservation...</span>
                  </>
                ) : (
                  <span>Confirm Reservation</span>
                )}
              </button>

              <div className="flex justify-between text-[11px]">
                <button
                  onClick={() => setStep(2)}
                  className="text-[#D8C7AD] hover:underline cursor-pointer"
                >
                  ← Edit Guest Info
                </button>
                <span className="text-[#D8C7AD]/60 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#B89A62]" /> Pay on arrival or direct link
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="pt-32 pb-24 text-center text-[#B89A62]">Loading booking system...</div>}>
      <BookingFlowContent />
    </Suspense>
  );
}
