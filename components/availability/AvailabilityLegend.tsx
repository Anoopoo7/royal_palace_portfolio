export default function AvailabilityLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[10px] uppercase tracking-wider text-[#D8C7AD]/70">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded-sm bg-[#B89A62] flex-shrink-0" />
        <span>Selected</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded-sm bg-[#B89A62]/15 border border-[#B89A62]/20 flex-shrink-0" />
        <span>Your stay</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded-sm bg-[#1a1816] flex-shrink-0 relative">
          <div className="absolute inset-0 flex items-center justify-center text-[8px] text-[#F5F1E8]/25">✕</div>
        </div>
        <span>Booked</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded-sm border border-[#B89A62]/10 flex-shrink-0">
          <div className="w-full h-full flex items-center justify-center text-[8px] text-[#B89A62]/50">₹</div>
        </div>
        <span>Available</span>
      </div>
    </div>
  );
}
