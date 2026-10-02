import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "o3q973rv";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "development";
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-03-01";

export const isSanityConfigured = Boolean(projectId) && projectId !== "placeholder-project-id";

export const sanityClient = isSanityConfigured
  ? createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: process.env.NODE_ENV === "production",
      token: process.env.SANITY_API_READ_TOKEN,
    })
  : null;

export async function fetchSanityQuery<T>(query: string, params: Record<string, unknown> = {}): Promise<T | null> {
  if (!isSanityConfigured || !sanityClient) {
    return null;
  }
  try {
    return await sanityClient.fetch<T>(query, params);
  } catch (error) {
    console.warn("Sanity fetch warning:", error);
    return null;
  }
}
