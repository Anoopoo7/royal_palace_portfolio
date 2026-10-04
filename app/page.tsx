import {
  getHomePageSections,
  getRooms,
  getExperiences,
  getTestimonials,
  getGalleryItems,
  getActivePromotion,
  getHomePageData,
} from "@/lib/sanity/queries";
import SectionRenderer from "@/components/sections/SectionRenderer";
import { Metadata } from "next";
import { buildCustomMetaTags } from "@/lib/seo";

export const revalidate = 60; // Revalidate CMS data every minute

export async function generateMetadata(): Promise<Metadata> {
  const pageData = await getHomePageData();
  return {
    title: pageData.seoTitle || pageData.title || "Royal Palace Varkala",
    description: pageData.seoDescription,
    other: buildCustomMetaTags(pageData.customMetaTags),
  };
}

export default async function HomePage() {
  const [sections, rooms, experiences, testimonials, galleryItems, promotion] = await Promise.all([
    getHomePageSections(),
    getRooms(),
    getExperiences(),
    getTestimonials(),
    getGalleryItems(),
    getActivePromotion(),
  ]);

  return (
    <SectionRenderer
      sections={sections}
      rooms={rooms}
      experiences={experiences}
      testimonials={testimonials}
      galleryItems={galleryItems}
      promotion={promotion}
    />
  );
}

