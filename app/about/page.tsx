import { getAboutPageData } from "@/lib/sanity/queries";
import Link from "next/link";
import SanityImg from "@/components/ui/SanityImg";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const pageData = await getAboutPageData();
  return {
    title: pageData.seoTitle || "About Royal Palace",
    description:
      pageData.seoDescription ||
      "The story behind Royal Palace private resort homestay in Varkala, Kerala.",
  };
}

export default async function AboutPage() {
  const pageData = await getAboutPageData();

  return (
    <div className="pt-32 pb-24 bg-[#171513] text-[#F5F1E8] min-h-screen">
      <div className="max-w-4xl mx-auto px-6 md:px-12 space-y-16">
        <div className="text-center space-y-4">
          {pageData.eyebrow && (
            <span className="text-[10px] uppercase tracking-[0.35em] text-[#B89A62] font-semibold">
              {pageData.eyebrow}
            </span>
          )}
          <h1 className="font-serif-editorial text-4xl md:text-6xl font-light">
            {pageData.heading || "Slow Hospitality in Kerala"}
          </h1>
        </div>

        {pageData.heroImage && (
          <div className="aspect-[16/9] overflow-hidden border border-[#B89A62]/30 shadow-2xl relative">
            <SanityImg
              source={pageData.heroImage}
              options={{ width: 1400, height: 787, fit: "crop" }}
              alt={pageData.heading || "Royal Palace Varkala Architecture"}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {((pageData.storyParagraphs && pageData.storyParagraphs.length > 0) || pageData.storyTitle) && (
          <div className="space-y-6 text-sm text-[#F5F1E8]/80 font-light leading-relaxed">
            {pageData.storyTitle && (
              <h2 className="font-serif-editorial text-3xl text-[#F5F1E8]">
                {pageData.storyTitle}
              </h2>
            )}
            {pageData.storyParagraphs?.map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>
        )}

        <div className="bg-[#12100E] border border-[#B89A62]/20 p-8 text-center space-y-4">
          <h3 className="font-serif-editorial text-2xl text-[#F5F1E8]">
            {pageData.ctaTitle || "Plan Your Varkala Escape"}
          </h3>
          {pageData.ctaSubtitle && (
            <p className="text-xs text-[#F5F1E8]/70 max-w-md mx-auto">
              {pageData.ctaSubtitle}
            </p>
          )}
          <Link
            href="/availability"
            className="inline-block px-8 py-3.5 bg-[#B89A62] text-[#171513] text-xs font-semibold tracking-[0.2em] uppercase hover:bg-[#D4B67E] transition-all"
          >
            {pageData.ctaButtonText || "Check Room Availability"}
          </Link>
        </div>
      </div>
    </div>
  );
}

