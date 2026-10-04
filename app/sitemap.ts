import { MetadataRoute } from "next";
import { getSiteSettings, getRooms, getExperiences } from "@/lib/sanity/queries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [settings, rooms, experiences] = await Promise.all([
    getSiteSettings(),
    getRooms(),
    getExperiences(),
  ]);

  const baseUrl =
    settings.siteUrl ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000";

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/rooms",
    "/experiences",
    "/gallery",
    "/about",
    "/contact",
    "/availability",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: route === "" ? 1.0 : route === "/availability" ? 0.9 : 0.8,
  }));

  const roomRoutes: MetadataRoute.Sitemap = rooms.map((room) => ({
    url: `${baseUrl}/rooms/${room.slug.current}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const experienceRoutes: MetadataRoute.Sitemap = experiences.map((exp) => ({
    url: `${baseUrl}/experiences/${exp.slug.current}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...roomRoutes, ...experienceRoutes];
}
