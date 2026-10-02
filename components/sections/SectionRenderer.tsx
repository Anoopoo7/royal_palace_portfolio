"use client";

import { HomeSection, RoomCMS, ExperienceCMS, TestimonialCMS, GalleryItemCMS, PromotionCMS } from "@/lib/sanity/types";
import HeroSection from "./HeroSection";
import BookingBar from "../booking/BookingBar";
import EditorialSection from "./EditorialSection";
import RoomShowcaseSection from "./RoomShowcaseSection";
import StoryScrollerSection from "./StoryScrollerSection";
import ExperienceGridSection from "./ExperienceGridSection";
import DayTimelineSection from "./DayTimelineSection";
import GallerySection from "./GallerySection";
import TestimonialsSection from "./TestimonialsSection";
import LocationSection from "./LocationSection";
import PromotionSection from "./PromotionSection";
import FinalCTASection from "./FinalCTASection";

interface SectionRendererProps {
  sections: HomeSection[];
  rooms?: RoomCMS[];
  experiences?: ExperienceCMS[];
  testimonials?: TestimonialCMS[];
  galleryItems?: GalleryItemCMS[];
  promotion?: PromotionCMS | null;
}

export default function SectionRenderer({
  sections,
  rooms,
  experiences = [],
  testimonials,
  galleryItems,
  promotion,
}: SectionRendererProps) {
  if (!sections || sections.length === 0) return null;
  return (
    <div className="w-full">
      {sections.map((section) => {
        if (section.enabled === false) return null;
        switch (section._type) {
          case "heroSection":
            return <HeroSection key={section._key} data={section} />;
          case "bookingBarSection":
            return <BookingBar key={section._key} />;
          case "editorialSection":
            return <EditorialSection key={section._key} data={section} />;
          case "roomShowcaseSection":
            return <RoomShowcaseSection key={section._key} data={section} rooms={rooms} />;
          case "storyScrollerSection":
            return <StoryScrollerSection key={section._key} data={section} />;
          case "experienceGridSection":
            return <ExperienceGridSection key={section._key} data={section} experiences={experiences?.filter(each => each?.featured)} />;
          case "dayTimelineSection":
            return <DayTimelineSection key={section._key} data={section} />;
          case "gallerySection":
            return <GallerySection key={section._key} data={section} items={galleryItems?.filter(each => each?.featured)} />;
          case "testimonialsSection":
            return <TestimonialsSection key={section._key} data={section} testimonials={testimonials} />;
          case "locationSection":
            return <LocationSection key={section._key} data={section} />;
          case "promotionSection":
            return <PromotionSection key={section._key} data={section} promotion={promotion} />;
          case "finalCtaSection":
            return <FinalCTASection key={section._key} data={section} />;
          default:
            // Gracefully ignore unknown section types
            console.warn(`Unknown section type: ${(section as { _type: string })._type}`);
            return null;
        }
      })}
    </div>
  );
}

