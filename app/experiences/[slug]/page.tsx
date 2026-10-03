import { getExperienceBySlug } from "@/lib/sanity/queries";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Clock, MapPin } from "lucide-react";
import SanityImg from "@/components/ui/SanityImg";
import SanityVideo from "@/components/ui/SanityVideo";
import ImageGalleryLightbox from "@/components/ui/ImageGalleryLightbox";

export async function generateMetadata(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const exp = await getExperienceBySlug(slug);
  if (!exp) return { title: "Experience Not Found" };
  return { title: exp.title, description: exp.shortDescription };
}

export default async function ExperienceDetailPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const exp = await getExperienceBySlug(slug);

  if (!exp) {
    notFound();
  }

  return (
    <div className="pt-32 pb-24 bg-[#171513] text-[#F5F1E8] min-h-screen">
      <div className="max-w-5xl mx-auto px-6 md:px-12 space-y-12">
        <Link
          href="/experiences"
          className="text-[10px] uppercase tracking-[0.25em] text-[#B89A62] hover:underline"
        >
          ← Back to All Experiences
        </Link>

        <div className="space-y-4">
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#B89A62] font-semibold">
            {exp.category} Experience
          </span>
          <h1 className="font-serif-editorial text-4xl md:text-6xl font-light">
            {exp.title}
          </h1>
          <div className="flex space-x-6 text-xs text-[#D8C7AD] font-light">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#B89A62]" />
              {exp.duration}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#B89A62]" />
              {exp.location}
            </span>
          </div>
        </div>

        {/* Media Frame: Video player (if video is uploaded) */}
        {exp.video && (
          <div className="space-y-3">
            <div className="aspect-[16/9] overflow-hidden border border-[#B89A62]/30 shadow-2xl relative bg-[#12100E]">
              <SanityVideo
                source={exp.video}
                controls
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full"
              />
            </div>
            <span className="text-[10px] uppercase tracking-widest text-[#B89A62]/70 block text-right font-mono">
              ★ Featured Experience Video
            </span>
          </div>
        )}

        {/* Hero Image with Lightbox */}
        {exp.heroImage && (
          <ImageGalleryLightbox
            images={[exp.heroImage]}
            title={exp.title}
            className="grid grid-cols-1"
          />
        )}

        <div className="space-y-6 max-w-3xl">
          <h3 className="font-serif-editorial text-2xl text-[#F5F1E8]">
            Overview
          </h3>
          <p className="text-sm text-[#F5F1E8]/80 font-light leading-relaxed whitespace-pre-line">
            {exp.description || exp.shortDescription}
          </p>
        </div>

        {/* Experience Gallery with Lightbox Modal & Close Button */}
        {exp.gallery && exp.gallery.length > 0 && (
          <div className="space-y-6 pt-6 border-t border-[#B89A62]/20">
            <h3 className="font-serif-editorial text-2xl text-[#F5F1E8]">
              Experience Gallery
            </h3>
            <ImageGalleryLightbox
              images={exp.gallery}
              title={`${exp.title} Gallery`}
            />
          </div>
        )}

        <div className="bg-[#12100E] border border-[#B89A62]/20 p-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h4 className="font-serif-editorial text-xl text-[#F5F1E8]">
              Interested in this experience?
            </h4>
            <p className="text-xs text-[#F5F1E8]/60 font-light mt-1">
              Our concierge arranges all private transfers and local guides upon room reservation.
            </p>
          </div>
          <Link
            href="/availability"
            className="px-8 py-3.5 bg-[#B89A62] text-[#171513] text-xs font-semibold tracking-[0.2em] uppercase hover:bg-[#D4B67E] transition-all whitespace-nowrap"
          >
            {exp.ctaText || "Book Room & Experience"}
          </Link>
        </div>
      </div>
    </div>
  );
}


