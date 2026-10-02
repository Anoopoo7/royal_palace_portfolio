import type { Metadata } from "next";
import { Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
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

export const metadata: Metadata = {
  title: {
    default: "Royal Palace | Premium Resort Homestay in Varkala, Kerala",
    template: "%s | Royal Palace Varkala",
  },
  description:
    "A private stay in Varkala, Kerala. More than a stay — the starting point for an authentic Kerala coast experience.",
  keywords: [
    "Royal Palace Varkala",
    "Resort Homestay Varkala",
    "Luxury Homestay Kerala",
    "Varkala Beach Resort",
    "Varkala Cliff Stay",
    "Private Villa Varkala",
  ],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  openGraph: {
    title: "Royal Palace | Premium Resort Homestay in Varkala, Kerala",
    description:
      "A private boutique resort homestay overlooking the cliff & coast of Varkala, Kerala. Quiet luxury, tropical elegance, cinematic slow living.",
    url: "https://royalpalacevarkala.com",
    siteName: "Royal Palace Varkala",
    locale: "en_IN",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${serifFont.variable} ${sansFont.variable} h-full antialiased selection:bg-[#B89A62] selection:text-[#F5F1E8]`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LodgingBusiness",
              name: "Royal Palace Varkala",
              description:
                "A premium boutique resort homestay in Varkala, Kerala offering private luxury rooms, tropical calm, and curated coastal experiences.",
              address: {
                "@type": "PostalAddress",
                addressLocality: "Varkala",
                addressRegion: "Kerala",
                addressCountry: "India",
              },
              geo: {
                "@type": "GeoCoordinates",
                latitude: "8.7379",
                longitude: "76.7163",
              },
              url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
              telephone: "+91 98765 43210",
              priceRange: "₹₹₹",
            }),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#171513] text-[#F5F1E8] font-sans">
        <Navbar />
        <main className="flex-1 w-full">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
