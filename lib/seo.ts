import { CustomMetaTag } from "@/lib/sanity/types";

export function buildCustomMetaTags(tags?: CustomMetaTag[]): Record<string, string | number | (string | number)[]> {
  if (!tags || !Array.isArray(tags)) return {};

  const other: Record<string, string | string[]> = {};

  for (const tag of tags) {
    if (!tag.name || !tag.content) continue;
    
    // If the tag name already exists, convert to array to support multiple tags with same name
    if (other[tag.name]) {
      if (Array.isArray(other[tag.name])) {
        (other[tag.name] as string[]).push(tag.content);
      } else {
        other[tag.name] = [other[tag.name] as string, tag.content];
      }
    } else {
      other[tag.name] = tag.content;
    }
  }

  return other;
}
