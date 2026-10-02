import { getRooms, getRoomsPageData } from "@/lib/sanity/queries";
import Link from "next/link";
import { Users, Bed } from "lucide-react";
import SanityImg from "@/components/ui/SanityImg";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const pageData = await getRoomsPageData();
  return {
    title: pageData.seoTitle || "Accommodations & Suites",
    description:
      pageData.seoDescription ||
      "Discover luxury cliffside suites and heritage teak villas at Royal Palace Varkala.",
  };
}

export default async function RoomsPage() {
  const [rooms, pageData] = await Promise.all([getRooms(), getRoomsPageData()]);

  return (
    <div className="pt-32 pb-24 bg-[#171513] text-[#F5F1E8] min-h-screen">
      <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          {pageData.eyebrow && (
            <span className="text-[10px] uppercase tracking-[0.35em] text-[#B89A62] font-semibold">
              {pageData.eyebrow}
            </span>
          )}
          <h1 className="font-serif-editorial text-4xl md:text-6xl font-light">
            {pageData.heading || "Architectural Sanctuaries"}
          </h1>
          {pageData.subtitle && (
            <p className="text-xs md:text-sm text-[#F5F1E8]/70 font-light leading-relaxed">
              {pageData.subtitle}
            </p>
          )}
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
                <SanityImg
                  source={room.heroImage}
                  alt={room.name}
                  className="w-full h-full object-cover"
                />
                {room.basePrice && (
                  <div className="absolute top-4 right-4 bg-[#171513]/90 text-[#B89A62] text-xs px-3 py-1 font-mono border border-[#B89A62]/30">
                    Starting at ₹{room.basePrice.toLocaleString("en-IN")} / night
                  </div>
                )}
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

                {room.amenities && room.amenities.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <h4 className="text-[10px] uppercase tracking-widest text-[#B89A62]">
                      {pageData.amenitiesHeading || "Key Amenities"}
                    </h4>
                    <ul className="grid grid-cols-2 gap-1.5 text-[11px] text-[#F5F1E8]/70 font-light">
                      {room.amenities.map((amenity, i) => (
                        <li key={i} className="flex items-center gap-1">
                          <span className="text-[#B89A62]">•</span> {amenity}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="pt-4 flex flex-col sm:flex-row gap-4">
                  <Link
                    href={`/booking?room=${room.slug.current}`}
                    className="px-6 py-3.5 bg-[#B89A62] text-[#171513] text-xs font-semibold tracking-[0.2em] uppercase text-center hover:bg-[#D4B67E] transition-all"
                  >
                    {pageData.bookCtaText || "Book This Room"}
                  </Link>
                  <Link
                    href={`/rooms/${room.slug.current}`}
                    className="px-6 py-3.5 border border-[#B89A62]/40 text-[#F5F1E8] text-xs font-medium tracking-[0.2em] uppercase text-center hover:bg-[#B89A62] hover:text-[#171513] transition-all"
                  >
                    {pageData.detailsCtaText || "View Details"}
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

