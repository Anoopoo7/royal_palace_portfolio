import imageUrlBuilder from "@sanity/image-url";
import { sanityClient, isSanityConfigured } from "./client";
import { SanityImage } from "./types";

const builder = isSanityConfigured && sanityClient ? imageUrlBuilder(sanityClient) : null;

export function urlForImage(source: SanityImage | string | undefined | null): string {
  if (!source) {
    return "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1600&q=80";
  }

  if (typeof source === "string") {
    return source;
  }

  if (builder && source.asset?._ref) {
    return builder.image(source).auto("format").fit("max").url();
  }

  return "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1600&q=80";
}

/** Returns a Sanity image URL with explicit width & height dimensions */
export function urlForImageSized(
  source: SanityImage | string | undefined | null,
  width: number,
  height: number
): string {
  if (!source || typeof source === "string") return urlForImage(source);
  if (builder && source.asset?._ref) {
    return builder.image(source).width(width).height(height).auto("format").fit("crop").url();
  }
  return urlForImage(source);
}
