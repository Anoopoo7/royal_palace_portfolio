"use client";

import { useSanityImage, SanityImageOptions } from "@/hooks/useSanityImage";
import type { SanityImage } from "@/lib/sanity/types";

interface SanityImgProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> {
  source: SanityImage | string | undefined | null;
  options?: SanityImageOptions;
}

/**
 * Drop-in <img> replacement that accepts a Sanity image reference or plain URL.
 * Uses useSanityImage internally so it works inside .map() loops.
 *
 * @example
 * <SanityImg source={room.heroImage} options={{ width: 800, quality: 80 }} alt={room.name} className="..." />
 */
export default function SanityImg({ source, options = {}, alt = "", ...imgProps }: SanityImgProps) {
  const src = useSanityImage(source, options);
  // eslint-disable-next-line jsx-a11y/alt-text
  return <img src={src} alt={alt} {...imgProps} />;
}
