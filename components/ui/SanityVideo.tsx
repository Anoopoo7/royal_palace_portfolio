"use client";

import { useSanityVideo, SanityVideoOptions } from "@/hooks/useSanityVideo";
import type { SanityFile } from "@/lib/sanity/types";

interface SanityVideoProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
  source: SanityFile | string | undefined | null;
  options?: SanityVideoOptions;
}

/**
 * Drop-in <video> replacement that accepts a Sanity file reference or plain URL string.
 */
export default function SanityVideo({ source, options = {}, ...videoProps }: SanityVideoProps) {
  const src = useSanityVideo(source, options);
  if (!src) return null;
  return <video src={src} {...videoProps} />;
}
