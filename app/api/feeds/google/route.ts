import { NextResponse } from "next/server";
import { getRooms, getSiteSettings } from "@/lib/sanity/queries";
import { urlForImageSized } from "@/lib/sanity/image";

export async function GET() {
  try {
    const [rooms, settings] = await Promise.all([
      getRooms(),
      getSiteSettings(),
    ]);

    const siteUrl =
      settings.siteUrl ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "http://localhost:3000";

    const title = settings.propertyName || "Royal Palace Varkala";
    const description = settings.defaultSeoDescription || "Premium Resort Homestay in Varkala, Kerala";

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>${escapeXml(title)}</title>
    <link>${siteUrl}</link>
    <description>${escapeXml(description)}</description>
`;

    rooms.forEach((room) => {
      // Find a valid image for the feed
      let imageUrl = "";
      if (room.heroImage) {
        imageUrl = urlForImageSized(room.heroImage, 1200, 800);
      } else if (room.gallery && room.gallery.length > 0) {
        imageUrl = urlForImageSized(room.gallery[0], 1200, 800);
      }

      // Base price in INR format
      const price = room.basePrice ? `${room.basePrice.toFixed(2)} INR` : "0.00 INR";

      xml += `    <item>
      <g:id>${escapeXml(room._id)}</g:id>
      <g:title>${escapeXml(room.name)}</g:title>
      <g:description>${escapeXml(room.shortDescription || room.name)}</g:description>
      <g:link>${siteUrl}/rooms/${room.slug.current}</g:link>
      ${imageUrl ? `<g:image_link>${escapeXml(imageUrl)}</g:image_link>` : ""}
      <g:availability>in stock</g:availability>
      <g:price>${price}</g:price>
      <g:condition>new</g:condition>
      <g:product_type>Hotel Room</g:product_type>
      <g:brand>${escapeXml(title)}</g:brand>
    </item>\n`;
    });

    xml += `  </channel>\n</rss>`;

    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Error generating Google Shopping feed:", error);
    return new NextResponse("Error generating feed", { status: 500 });
  }
}

// Utility to safely escape special characters for XML
function escapeXml(unsafe: string) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
