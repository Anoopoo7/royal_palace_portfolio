import { getRooms } from "@/lib/sanity/queries";
import Link from "next/link";
import { Users, Bed } from "lucide-react";

export const metadata = {
  title: "Accommodations & Suites",
  description: "Discover luxury cliffside suites and heritage teak villas at Royal Palace Varkala.",
};

export default async function RoomsPage() {
  const rooms = await getRooms();

  return (
    <div className="pt-32 pb-24 bg-[#171513] text-[#F5F1E8] min-h-screen">
      <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-[10px] uppercase tracking-[0.35em] text-[#B89A62] font-semibold">
            ACCOMMODATIONS & SUITES
          </span>
          <h1 className="font-serif-editorial text-4xl md:text-6xl font-light">
            Architectural Sanctuaries
          </h1>
          <p className="text-xs md:text-sm text-[#F5F1E8]/70 font-light leading-relaxed">
            Each suite and villa at Royal Palace is crafted from warm Kerala teak, natural stone, and expansive ocean balconies designed to capture slow coastal daylight.
          </p>
        </div>

        <div className="space-y-16">
          {rooms.map((room, idx) => (
            <div
              key={room._id}
              className={`bg-[#12100E] border border-[#B89A62]/20 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-6 md:p-10 shadow-2xl ${
                idx % 2 === 1 ? "lg:flex-row-reverse" : ""
              }`}
            >
              <div className="lg:col-span-7 aspect-[16/10] overflow-hidden border border-[#B89A62]/30 relative">
                <img
                  src={room.heroImage as string}
                  alt={room.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 bg-[#171513]/90 text-[#B89A62] text-xs px-3 py-1 font-mono border border-[#B89A62]/30">
                  Starting at ₹{room.basePrice.toLocaleString("en-IN")} / night
                </div>
              </div>

              <div className="lg:col-span-5 space-y-6">
                <h2 className="font-serif-editorial text-3xl md:text-4xl text-[#F5F1E8]">
                  {room.name}
                </h2>
                <p className="text-xs text-[#F5F1E8]/80 font-light leading-relaxed">
                  {room.description || room.shortDescription}
                </p>

                <div className="flex space-x-6 text-xs text-[#D8C7AD] pt-2 border-t border-[#B89A62]/10">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-[#B89A62]" />
                    {room.capacity} Guests Max
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Bed className="w-4 h-4 text-[#B89A62]" />
                    {room.beds}
                  </span>
                </div>

                <div className="space-y-2 pt-2">
                  <h4 className="text-[10px] uppercase tracking-widest text-[#B89A62]">
                    Key Amenities
                  </h4>
                  <ul className="grid grid-cols-2 gap-1.5 text-[11px] text-[#F5F1E8]/70 font-light">
                    {room.amenities.map((amenity, i) => (
                      <li key={i} className="flex items-center gap-1">
                        <span className="text-[#B89A62]">•</span> {amenity}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row gap-4">
                  <Link
                    href={`/booking?room=${room.slug.current}`}
                    className="px-6 py-3.5 bg-[#B89A62] text-[#171513] text-xs font-semibold tracking-[0.2em] uppercase text-center hover:bg-[#D4B67E] transition-all"
                  >
                    Book This Room
                  </Link>
                  <Link
                    href={`/rooms/${room.slug.current}`}
                    className="px-6 py-3.5 border border-[#B89A62]/40 text-[#F5F1E8] text-xs font-medium tracking-[0.2em] uppercase text-center hover:bg-[#B89A62] hover:text-[#171513] transition-all"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
