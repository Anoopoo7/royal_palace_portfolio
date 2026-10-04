import { defineType, defineField } from "./types-helper";
import { customMetaTagsField } from "./customMetaTagsField";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  groups: [
    { name: "general", title: "General" },
    { name: "contact", title: "Contact & Social" },
    { name: "seo", title: "SEO & Meta" },
    { name: "og", title: "Open Graph / Social Sharing" },
    { name: "twitter", title: "Twitter / X Card" },
    { name: "schema", title: "Google Business & Schema.org" },
    { name: "pwa", title: "Favicon & PWA Manifest" },
    { name: "robots", title: "Robots & Crawling" },
    { name: "customMeta", title: "Custom Meta Tags (Global)" },
  ],
  fields: [
    // ─── General ────────────────────────────────────────────────────────────────
    defineField({ name: "propertyName", title: "Property Name", type: "string", group: "general", validation: (r) => r.required() }),
    defineField({ name: "tagline", title: "Tagline / Sub-headline", type: "string", group: "general" }),
    defineField({ name: "logo", title: "Logo", type: "image", group: "general" }),
    defineField({ name: "siteUrl", title: "Site URL", description: "Production URL (e.g. https://royalpalacevarkala.com)", type: "url", group: "general" }),
    defineField({ name: "locale", title: "Locale", description: "e.g. en_IN", type: "string", initialValue: "en_IN", group: "general" }),

    // ─── Contact & Social ───────────────────────────────────────────────────────
    defineField({ name: "phone", title: "Phone Number", type: "string", group: "contact" }),
    defineField({ name: "whatsapp", title: "WhatsApp Number", type: "string", group: "contact" }),
    defineField({ name: "email", title: "Contact Email", type: "string", group: "contact" }),
    defineField({ name: "address", title: "Physical Address", type: "text", rows: 2, group: "contact" }),
    defineField({ name: "googleMapsUrl", title: "Google Maps URL", type: "url", group: "contact" }),
    defineField({ name: "instagramUrl", title: "Instagram URL", type: "url", group: "contact" }),
    defineField({ name: "facebookUrl", title: "Facebook URL", type: "url", group: "contact" }),
    defineField({ name: "tiktokUrl", title: "TikTok URL", type: "url", group: "contact" }),
    defineField({ name: "youtubeUrl", title: "YouTube URL", type: "url", group: "contact" }),

    // ─── SEO & Meta ─────────────────────────────────────────────────────────────
    defineField({ name: "defaultSeoTitle", title: "Default SEO Title", description: "Appears in browser tab and search results", type: "string", group: "seo" }),
    defineField({ name: "seoTitleTemplate", title: "SEO Title Template", description: 'e.g. "%s | Royal Palace Varkala" — %s is replaced with the page title', type: "string", initialValue: "%s | Royal Palace Varkala", group: "seo" }),
    defineField({ name: "defaultSeoDescription", title: "Default Meta Description", description: "150–160 characters ideal", type: "text", rows: 3, group: "seo" }),
    defineField({
      name: "seoKeywords",
      title: "Default Keywords",
      description: "Comma-separated keyword list",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
      group: "seo",
    }),
    defineField({ name: "canonicalUrl", title: "Canonical URL Override", description: "Leave blank to auto-generate from Site URL + path", type: "url", group: "seo" }),

    // ─── Open Graph ──────────────────────────────────────────────────────────────
    defineField({ name: "defaultOgTitle", title: "Default OG Title", type: "string", group: "og" }),
    defineField({ name: "defaultOgDescription", title: "Default OG Description", type: "text", rows: 3, group: "og" }),
    defineField({ name: "defaultOgImage", title: "Default OG Image", description: "Recommended: 1200×630 px", type: "image", group: "og" }),
    defineField({
      name: "ogType",
      title: "OG Type",
      type: "string",
      options: { list: ["website", "article", "product", "place"], layout: "radio" },
      initialValue: "website",
      group: "og",
    }),

    // ─── Twitter Card ────────────────────────────────────────────────────────────
    defineField({
      name: "twitterCardType",
      title: "Twitter Card Type",
      type: "string",
      options: { list: ["summary", "summary_large_image", "app", "player"], layout: "radio" },
      initialValue: "summary_large_image",
      group: "twitter",
    }),
    defineField({ name: "twitterHandle", title: "Twitter / X Handle", description: "@handle without @", type: "string", group: "twitter" }),
    defineField({ name: "twitterSiteHandle", title: "Twitter Site Handle", description: "@handle for site/brand", type: "string", group: "twitter" }),
    defineField({ name: "twitterDefaultImage", title: "Default Twitter Card Image", description: "Recommended: 1200×628 px", type: "image", group: "twitter" }),

    // ─── Schema.org / Google Business ───────────────────────────────────────────
    defineField({
      name: "businessType",
      title: "Business Type (Schema.org)",
      type: "string",
      options: { list: ["LodgingBusiness", "Hotel", "BedAndBreakfast", "Hostel", "Resort", "LocalBusiness"] },
      initialValue: "LodgingBusiness",
      group: "schema",
    }),
    defineField({ name: "priceRange", title: "Price Range", description: "e.g. ₹₹₹ or $$$", type: "string", initialValue: "₹₹₹", group: "schema" }),
    defineField({ name: "latitude", title: "Latitude", type: "string", initialValue: "8.7379", group: "schema" }),
    defineField({ name: "longitude", title: "Longitude", type: "string", initialValue: "76.7163", group: "schema" }),
    defineField({ name: "addressLocality", title: "City / Locality", type: "string", initialValue: "Varkala", group: "schema" }),
    defineField({ name: "addressRegion", title: "State / Region", type: "string", initialValue: "Kerala", group: "schema" }),
    defineField({ name: "addressCountry", title: "Country", type: "string", initialValue: "India", group: "schema" }),
    defineField({ name: "postalCode", title: "Postal Code", type: "string", group: "schema" }),
    defineField({ name: "checkInTime", title: "Check-in Time", description: "e.g. 14:00", type: "string", initialValue: "14:00", group: "schema" }),
    defineField({ name: "checkOutTime", title: "Check-out Time", description: "e.g. 11:00", type: "string", initialValue: "11:00", group: "schema" }),
    defineField({ name: "starRating", title: "Star Rating", description: "1–5", type: "number", group: "schema" }),
    defineField({ name: "aggregateRating", title: "Aggregate Rating Value", description: "e.g. 4.8", type: "number", group: "schema" }),
    defineField({ name: "ratingCount", title: "Total Ratings Count", type: "number", group: "schema" }),
    defineField({
      name: "currenciesAccepted",
      title: "Currencies Accepted",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
      initialValue: ["INR"],
      group: "schema",
    }),
    defineField({
      name: "paymentAccepted",
      title: "Payment Methods Accepted",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
      initialValue: ["Cash", "Credit Card", "UPI"],
      group: "schema",
    }),

    // ─── Favicon & PWA Manifest ──────────────────────────────────────────────────
    defineField({ name: "faviconIco", title: "Favicon (.ico)", description: "32×32 or 16×16 ICO file", type: "image", group: "pwa" }),
    defineField({ name: "favicon32", title: "Favicon 32×32 (PNG)", type: "image", group: "pwa" }),
    defineField({ name: "favicon16", title: "Favicon 16×16 (PNG)", type: "image", group: "pwa" }),
    defineField({ name: "appleIcon", title: "Apple Touch Icon (180×180 PNG)", type: "image", group: "pwa" }),
    defineField({ name: "manifestIcon192", title: "PWA Icon 192×192 (PNG)", type: "image", group: "pwa" }),
    defineField({ name: "manifestIcon512", title: "PWA Icon 512×512 (PNG)", type: "image", group: "pwa" }),
    defineField({ name: "pwaShortName", title: "PWA Short Name", description: "Short name for home screen (max 12 chars)", type: "string", initialValue: "Royal Palace", group: "pwa" }),
    defineField({ name: "pwaThemeColor", title: "PWA Theme Color", description: "Hex colour for browser UI chrome (e.g. #171513)", type: "string", initialValue: "#171513", group: "pwa" }),
    defineField({ name: "pwaBackgroundColor", title: "PWA Background Color", description: "Splash screen background (e.g. #171513)", type: "string", initialValue: "#171513", group: "pwa" }),
    defineField({
      name: "pwaDisplay",
      title: "PWA Display Mode",
      type: "string",
      options: { list: ["standalone", "browser", "minimal-ui", "fullscreen"], layout: "radio" },
      initialValue: "standalone",
      group: "pwa",
    }),

    // ─── Robots & Crawling ───────────────────────────────────────────────────────
    defineField({ name: "robotsIndex", title: "Allow Search Engine Indexing", description: "Uncheck to set noindex globally (e.g. staging)", type: "boolean", initialValue: true, group: "robots" }),
    defineField({ name: "robotsFollow", title: "Allow Link Following", type: "boolean", initialValue: true, group: "robots" }),
    defineField({
      name: "robotsDisallow",
      title: "Disallowed Paths",
      description: "Paths that should not be crawled (e.g. /api, /admin)",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
      initialValue: ["/api/", "/admin/", "/studio/"],
      group: "robots",
    }),
    defineField({ name: "googleVerification", title: "Google Search Console Verification Token", description: "Content value from <meta name='google-site-verification'>", type: "string", group: "robots" }),
    defineField({ name: "bingVerification", title: "Bing Webmaster Verification Token", type: "string", group: "robots" }),

    // ─── Global Custom Meta Tags ──────────────────────────────────────────────────
    { ...customMetaTagsField, group: "customMeta",
      description: "These meta tags will appear on EVERY page site-wide. Use for global authorship, geo, or classification tags.",
    },
  ],
});
