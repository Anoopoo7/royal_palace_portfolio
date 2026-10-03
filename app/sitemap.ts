import { MetadataRoute } from "next";
import { MOCK_ROOMS, MOCK_EXPERIENCES } from "@/lib/mock-data";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const staticRoutes = [
    "",
    "/rooms",
    "/experiences",
    "/gallery",
    "/about",
    "/contact",
    "/availability",
    "/booking",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1.0 : route === "/availability" || route === "/booking" ? 0.9 : 0.8,
  }));

  const roomRoutes = MOCK_ROOMS.map((room) => ({
    url: `${baseUrl}/rooms/${room.slug.current}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const experienceRoutes = MOCK_EXPERIENCES.map((exp) => ({
    url: `${baseUrl}/experiences/${exp.slug.current}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...roomRoutes, ...experienceRoutes];
}
