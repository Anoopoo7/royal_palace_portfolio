import { useMemo } from "react";
import { sanityClient, isSanityConfigured } from "@/lib/sanity/client";
import type { SanityFile } from "@/lib/sanity/types";

/**
 * Resolves a Sanity file asset reference into a streamable URL.
 *
 * Sanity file objects look like:
 *   { _type: 'file', asset: { _ref: 'file-abc123-mp4', _type: 'reference' } }
 *
 * The CDN URL is derived by parsing the _ref, e.g.:
 *   file-<hash>-<ext>  →  https://cdn.sanity.io/files/<projectId>/<dataset>/<hash>.<ext>
 *
 * @example
 * const videoSrc = useSanityVideo(data.desktopVideo, { fallback: "https://..." });
 * <video src={videoSrc} />
 */

export interface SanityVideoOptions {
  /** Fallback URL if the file cannot be resolved */
  fallback?: string;
}

export function useSanityVideo(
  source: SanityFile | string | undefined | null,
  options: SanityVideoOptions = {}
): string {
  const { fallback = "" } = options;

  return useMemo(() => {
    if (!source) return fallback;

    // Plain URL string — return as-is
    if (typeof source === "string") return source;

    const ref = source?.asset?._ref;
    if (!ref) return fallback;

    // Sanity file _ref format: "file-<hash>-<extension>"
    // e.g. "file-0af32e78cb386a57415fe478126354f0e7f8069f-mp4"
    const match = ref.match(/^file-([a-f0-9]+)-([a-z0-9]+)$/);
    if (!match) return fallback;

    const [, hash, ext] = match;

    if (isSanityConfigured && sanityClient) {
      const { projectId, dataset } = sanityClient.config();
      return `https://cdn.sanity.io/files/${projectId}/${dataset}/${hash}.${ext}`;
    }

    return fallback;
  }, [source, fallback]);
}
