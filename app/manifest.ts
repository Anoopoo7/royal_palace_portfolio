import { MetadataRoute } from "next";
import { getSiteSettings } from "@/lib/sanity/queries";
import { urlForImageSized } from "@/lib/sanity/image";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const settings = await getSiteSettings();

  const name = settings.propertyName || "Royal Palace Varkala";
  const shortName = settings.pwaShortName || "Royal Palace";
  const themeColor = settings.pwaThemeColor || "#171513";
  const bgColor = settings.pwaBackgroundColor || "#171513";
  const display = settings.pwaDisplay || "standalone";

  const icons: MetadataRoute.Manifest["icons"] = [];

  if (settings.manifestIcon192) {
    icons.push({
      src: urlForImageSized(settings.manifestIcon192,192,192),
      sizes: "192x192",
      type: "image/png",
      purpose: "maskable",
    });
  }
  if (settings.manifestIcon512) {
    icons.push({
      src: urlForImageSized(settings.manifestIcon512,512,512),
      sizes: "512x512",
      type: "image/png",
      purpose: "any",
    });
  }

  // Fallback icons if none uploaded to Sanity yet
  if (icons.length === 0) {
    icons.push(
      { src: "/favicon.ico", sizes: "any", type: "image/x-icon" }
    );
  }

  return {
    name,
    short_name: shortName,
    description: settings.defaultSeoDescription || `${name} — Premium Resort Homestay in Varkala, Kerala`,
    start_url: "/",
    display,
    background_color: bgColor,
    theme_color: themeColor,
    icons,
    categories: ["travel", "lifestyle"],
    lang: "en",
  };
}
