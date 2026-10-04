import type { Metadata } from "next";
import { Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getSiteSettings, getNavigation } from "@/lib/sanity/queries";
import { urlForImageSized } from "@/lib/sanity/image";
import { buildCustomMetaTags } from "@/lib/seo";
import "./globals.css";

const serifFont = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const sansFont = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();

  const siteUrl =
    settings.siteUrl ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000";

  const defaultTitle =
    settings.defaultSeoTitle || "Royal Palace | Premium Resort Homestay in Varkala, Kerala";
  const titleTemplate =
    settings.seoTitleTemplate || "%s | Royal Palace Varkala";
  const description =
    settings.defaultSeoDescription ||
    "A private stay in Varkala, Kerala. More than a stay — the starting point for an authentic Kerala coast experience.";
  const keywords =
    settings.seoKeywords && settings.seoKeywords.length > 0
      ? settings.seoKeywords
      : [
          "Royal Palace Varkala",
          "Resort Homestay Varkala",
          "Luxury Homestay Kerala",
          "Varkala Beach Resort",
          "Varkala Cliff Stay",
          "Private Villa Varkala",
        ];

  const ogImage = settings.defaultOgImage
    ? urlForImageSized(settings.defaultOgImage, 1200, 630)
    : undefined;

  const twitterImage = settings.twitterDefaultImage
    ? urlForImageSized(settings.twitterDefaultImage, 1200, 628)
    : ogImage;

  // Favicon URLs from Sanity (fall back to static /favicon.ico)
  const favicon32Url = settings.favicon32
    ? urlForImageSized(settings.favicon32, 32, 32)
    : "/favicon.ico";
  const favicon16Url = settings.favicon16
    ? urlForImageSized(settings.favicon16, 16, 16)
    : "/favicon.ico";
  const appleIconUrl = settings.appleIcon
    ? urlForImageSized(settings.appleIcon, 180, 180)
    : undefined;

  const verification: Record<string, string> = {};
  if (settings.googleVerification) verification.google = settings.googleVerification;
  if (settings.bingVerification) verification.other = settings.bingVerification;

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: defaultTitle,
      template: titleTemplate,
    },
    description,
    keywords,
    ...(settings.canonicalUrl ? { alternates: { canonical: settings.canonicalUrl } } : {}),
    openGraph: {
      title: settings.defaultOgTitle || defaultTitle,
      description: settings.defaultOgDescription || description,
      url: siteUrl,
      siteName: settings.propertyName || "Royal Palace Varkala",
      locale: settings.locale || "en_IN",
      type: (settings.ogType as "website" | "article") || "website",
      ...(ogImage ? { images: [{ url: ogImage, width: 1200, height: 630, alt: settings.propertyName }] } : {}),
    },
    twitter: {
      card: settings.twitterCardType || "summary_large_image",
      ...(settings.twitterHandle ? { creator: `@${settings.twitterHandle}` } : {}),
      ...(settings.twitterSiteHandle ? { site: `@${settings.twitterSiteHandle}` } : {}),
      title: settings.defaultOgTitle || defaultTitle,
      description: settings.defaultOgDescription || description,
      ...(twitterImage ? { images: [twitterImage] } : {}),
    },
    robots: {
      index: settings.robotsIndex ?? true,
      follow: settings.robotsFollow ?? true,
    },
    icons: {
      icon: [
        { url: favicon32Url, sizes: "32x32", type: "image/png" },
        { url: favicon16Url, sizes: "16x16", type: "image/png" },
      ],
      ...(appleIconUrl ? { apple: [{ url: appleIconUrl, sizes: "180x180" }] } : {}),
    },
    ...(Object.keys(verification).length > 0 ? { verification } : {}),
    other: buildCustomMetaTags(settings.customMetaTags),
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [settings, navigation] = await Promise.all([getSiteSettings(), getNavigation()]);

  const siteUrl =
    settings.siteUrl ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000";

  // Build Schema.org JSON-LD from Sanity fields
  const schemaOrg: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": settings.businessType || "LodgingBusiness",
    name: settings.propertyName ?? "Royal Palace Varkala",
    description:
      settings.defaultSeoDescription ||
      "A premium boutique resort homestay in Varkala, Kerala offering private luxury rooms, tropical calm, and curated coastal experiences.",
    url: siteUrl,
    telephone: settings.phone ?? undefined,
    email: settings.email ?? undefined,
    priceRange: settings.priceRange || "₹₹₹",
    address: {
      "@type": "PostalAddress",
      streetAddress: settings.address ?? undefined,
      addressLocality: settings.addressLocality || "Varkala",
      addressRegion: settings.addressRegion || "Kerala",
      postalCode: settings.postalCode ?? undefined,
      addressCountry: settings.addressCountry || "India",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: settings.latitude || "8.7379",
      longitude: settings.longitude || "76.7163",
    },
    ...(settings.checkInTime ? { checkinTime: settings.checkInTime } : {}),
    ...(settings.checkOutTime ? { checkoutTime: settings.checkOutTime } : {}),
    ...(settings.starRating ? { starRating: { "@type": "Rating", ratingValue: settings.starRating } } : {}),
    ...(settings.aggregateRating && settings.ratingCount
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: settings.aggregateRating,
            reviewCount: settings.ratingCount,
          },
        }
      : {}),
    ...(settings.currenciesAccepted ? { currenciesAccepted: settings.currenciesAccepted.join(", ") } : {}),
    ...(settings.paymentAccepted ? { paymentAccepted: settings.paymentAccepted.join(", ") } : {}),
    ...(settings.instagramUrl || settings.facebookUrl
      ? {
          sameAs: [settings.instagramUrl, settings.facebookUrl, settings.tiktokUrl, settings.youtubeUrl].filter(
            Boolean
          ),
        }
      : {}),
    ...(settings.defaultOgImage
      ? { image: urlForImageSized(settings.defaultOgImage, 1200, 800) }
      : {}),
  };

  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${serifFont.variable} ${sansFont.variable} h-full antialiased selection:bg-[#B89A62] selection:text-[#F5F1E8]`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
        />
        {/* PWA theme color */}
        <meta name="theme-color" content={settings.pwaThemeColor || "#171513"} />
        {/* Robots disallow overrides handled via robots.ts */}
      </head>
      <body className="min-h-full flex flex-col bg-[#171513] text-[#F5F1E8] font-sans">
        <Navbar settings={settings} navigation={navigation} />
        <main className="flex-1 w-full">{children}</main>
        <Footer settings={settings} navigation={navigation} />
      </body>
    </html>
  );
}

