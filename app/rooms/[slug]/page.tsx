import { getRoomBySlug, getRooms } from "@/lib/sanity/queries";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Users, Bed, Check, ShieldCheck, Calendar } from "lucide-react";

export async function generateMetadata(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const room = await getRoomBySlug(slug);
  if (!room) return { title: "Room Not Found" };
  return {
    title: room.name,
    description: room.shortDescription,
  };
}

export default async function RoomDetailPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const room = await getRoomBySlug(slug);

  if (!room) {
    notFound();
  }

  const allRooms = await getRooms();
  const relatedRooms = allRooms.filter((r) => r.slug.current !== room.slug.current);

  return (
    <div className="pt-32 pb-24 bg-[#171513] text-[#F5F1E8] min-h-screen">
      <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-16">
        {/* Header */}
        <div className="space-y-4">
          <Link
            href="/rooms"
            className="text-[10px] uppercase tracking-[0.25em] text-[#B89A62] hover:underline"
          >
            ← Back to Accommodations
          </Link>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <h1 className="font-serif-editorial text-4xl md:text-6xl font-light text-[#F5F1E8]">
                {room.name}
              </h1>
              <p className="text-xs md:text-sm text-[#D8C7AD] font-light mt-2 max-w-2xl">
                {room.shortDescription}
              </p>
            </div>
            <div className="bg-[#12100E] border border-[#B89A62]/30 p-4 text-center lg:text-right">
              <span className="text-[10px] uppercase tracking-widest text-[#D8C7AD] block">Starting Rate</span>
              <span className="font-serif-editorial text-3xl text-[#B89A62]">
                ₹{room.basePrice.toLocaleString("en-IN")}
              </span>
              <span className="text-[11px] text-[#F5F1E8]/60"> / night</span>
            </div>
          </div>
        </div>

        {/* Hero & Gallery */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 aspect-[16/10] overflow-hidden border border-[#B89A62]/30">
            <img
              src={room.heroImage as string}
              alt={room.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="lg:col-span-4 grid grid-cols-2 lg:grid-cols-1 gap-4">
            {room.gallery?.slice(0, 2).map((img, i) => (
              <div key={i} className="aspect-[16/10] overflow-hidden border border-[#B89A62]/20">
                <img
                  src={img as string}
                  alt={`${room.name} detail ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-8 border-t border-[#B89A62]/20">
          <div className="lg:col-span-8 space-y-8">
            <div>
              <h3 className="font-serif-editorial text-2xl text-[#F5F1E8] mb-4">
                About this Sanctuary
              </h3>
              <p className="text-sm text-[#F5F1E8]/80 font-light leading-relaxed whitespace-pre-line">
                {room.description || room.shortDescription}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-[#12100E] border border-[#B89A62]/20 p-6">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#B89A62] block">Capacity</span>
                <span className="text-sm font-medium text-[#F5F1E8]">{room.capacity} Guests</span>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#B89A62] block">Bedding</span>
                <span className="text-sm font-medium text-[#F5F1E8]">{room.beds}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#B89A62] block">Ensuite</span>
                <span className="text-sm font-medium text-[#F5F1E8]">{room.bathrooms}</span>
              </div>
            </div>

            <div>
              <h3 className="font-serif-editorial text-2xl text-[#F5F1E8] mb-4">
                Amenities & Inclusions
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {room.amenities.map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-3 text-xs text-[#F5F1E8]/80 font-light">
                    <Check className="w-4 h-4 text-[#B89A62]" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-serif-editorial text-2xl text-[#F5F1E8] mb-4">
                Stay Policies
              </h3>
              <div className="text-xs text-[#F5F1E8]/70 space-y-2 font-light bg-[#12100E] p-6 border border-[#B89A62]/20">
                <p>• Check-in: 02:00 PM | Check-out: 11:00 AM</p>
                <p>• Complimentary Kerala breakfast included for all occupants.</p>
                <p>• Free cancellation up to 7 days prior to check-in date.</p>
              </div>
            </div>
          </div>

          {/* Sticky Booking CTA Card */}
          <div className="lg:col-span-4">
            <div className="bg-[#1C1A17] border border-[#B89A62]/40 p-8 sticky top-28 space-y-6 shadow-2xl">
              <h3 className="font-serif-editorial text-2xl text-[#F5F1E8] border-b border-[#B89A62]/20 pb-4">
                Reserve Room
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between text-xs text-[#D8C7AD]">
                  <span>Nightly Rate</span>
                  <span className="font-mono text-[#F5F1E8]">₹{room.basePrice.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-xs text-[#D8C7AD]">
                  <span>Taxes & Service</span>
                  <span className="text-[10px] text-[#B89A62]">Calculated at checkout</span>
                </div>
              </div>

              <Link
                href={`/booking?room=${room.slug.current}`}
                className="w-full py-4 bg-[#B89A62] text-[#171513] text-center text-xs font-semibold tracking-[0.2em] uppercase block hover:bg-[#D4B67E] transition-all"
              >
                Book {room.name}
              </Link>

              <div className="flex items-center gap-2 text-[10px] text-[#D8C7AD]/70 justify-center">
                <ShieldCheck className="w-4 h-4 text-[#B89A62]" />
                <span>Best rate guarantee & instant confirmation</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
