import { defineField } from "./types-helper";

/**
 * Reusable custom meta tags field.
 * Renders as an array of { name, content } objects in Sanity Studio.
 * Each entry maps to <meta name="..." content="..."> on the page.
 *
 * Examples:
 *   { name: "robots", content: "noindex" }
 *   { name: "author", content: "Royal Palace" }
 *   { name: "geo.region", content: "IN-KL" }
 *   { name: "classification", content: "Luxury Homestay" }
 */
export const customMetaTagsField = defineField({
  name: "customMetaTags",
  title: "Custom Meta Tags",
  description:
    "Add any <meta name='...' content='...'> tags. These render directly on this page's <head>. " +
    "Use for geo tags, authorship, schema hints, or any non-standard SEO fields.",
  type: "array",
  of: [
    {
      type: "object",
      name: "metaTag",
      title: "Meta Tag",
      fields: [
        defineField({
          name: "name",
          title: "Name",
          description: 'e.g. "author", "geo.region", "robots", "classification"',
          type: "string",
          validation: (r) => r.required(),
        }),
        defineField({
          name: "content",
          title: "Content",
          description: 'e.g. "Royal Palace", "IN-KL", "noindex"',
          type: "string",
          validation: (r) => r.required(),
        }),
      ],
      preview: {
        select: { title: "name", subtitle: "content" },
      },
    },
  ],
});
