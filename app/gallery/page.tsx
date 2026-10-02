import { getGalleryItems } from "@/lib/sanity/queries";
import GallerySection from "@/components/sections/GallerySection";

export const metadata = {
  title: "Visual Journal & Gallery",
  description: "Explore photos of Royal Palace Varkala architecture, suites, and surrounding Kerala coast.",
};

export default async function GalleryPage() {
  const galleryItems = await getGalleryItems();

  return (
    <div className="pt-24 bg-[#171513] min-h-screen">
      <GallerySection
        data={{
          _key: "page-gallery",
          _type: "gallerySection",
          eyebrow: "ARCHITECTURAL PORTFOLIO",
          title: "Visual Journal",
          subtitle: "Moments of stillness, teak architecture, and Varkala sea daylight.",
        }}
        items={galleryItems}
      />
    </div>
  );
}
