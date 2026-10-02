import { useMemo } from "react";
import imageUrlBuilder from "@sanity/image-url";
import { sanityClient, isSanityConfigured } from "@/lib/sanity/client";
import type { SanityImage } from "@/lib/sanity/types";

const FALLBACK_URL =
  "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1600&q=80";

const builder =
  isSanityConfigured && sanityClient ? imageUrlBuilder(sanityClient) : null;

export interface SanityImageOptions {
  width?: number;
  height?: number;
  quality?: number;
  fit?: "clip" | "crop" | "fill" | "fillmax" | "max" | "scale" | "min";
  /** Fallback URL if the image cannot be resolved */
  fallback?: string;
}

/**
 * Resolves a Sanity image reference (or plain string URL) to a usable src string.
 *
 * @example
 * // In a component that receives data.posterImage: SanityImage | string | undefined
 * const posterSrc = useSanityImage(data.posterImage, { width: 1920, quality: 80 });
 * <img src={posterSrc} />
 */
export function useSanityImage(
  source: SanityImage | string | undefined | null,
  options: SanityImageOptions = {}
): string {
  const { width, height, quality = 80, fit = "max", fallback = FALLBACK_URL } = options;

  return useMemo(() => {
    if (!source) return fallback;

    // Plain URL string — return as-is
    if (typeof source === "string") return source;

    // Sanity image reference object
    if (builder && source.asset?._ref) {
      let img = builder.image(source).auto("format").fit(fit).quality(quality);
      if (width) img = img.width(width);
      if (height) img = img.height(height);
      return img.url();
    }

    return fallback;
  }, [source, width, height, quality, fit, fallback]);
}
