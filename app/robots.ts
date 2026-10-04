import { MetadataRoute } from "next";
import { getSiteSettings } from "@/lib/sanity/queries";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await getSiteSettings();

  const siteUrl =
    settings.siteUrl ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000";

  const disallow =
    settings.robotsDisallow && settings.robotsDisallow.length > 0
      ? settings.robotsDisallow
      : ["/api/", "/admin/", "/studio/"];

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow,
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
