import {
  getHomePageSections,
  getRooms,
  getExperiences,
  getTestimonials,
  getGalleryItems,
} from "@/lib/sanity/queries";
import SectionRenderer from "@/components/sections/SectionRenderer";

export const revalidate = 60; // Revalidate CMS data every minute

export default async function HomePage() {
  const [sections, rooms, experiences, testimonials, galleryItems] = await Promise.all([
    getHomePageSections(),
    getRooms(),
    getExperiences(),
    getTestimonials(),
    getGalleryItems(),
  ]);

  return (
    <SectionRenderer
      sections={sections}
      rooms={rooms}
      experiences={experiences}
      testimonials={testimonials}
      galleryItems={galleryItems}
    />
  );
}
