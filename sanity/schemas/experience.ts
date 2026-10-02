import { defineType, defineField } from "./types-helper";

export const experience = defineType({
  name: "experience",
  title: "Experience",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Experience Title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "title", maxLength: 96 } }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: ["Coastal", "Adventure", "Cultural", "Wellness", "Dining"],
      },
    }),
    defineField({ name: "shortDescription", title: "Short Description", type: "text", rows: 2 }),
    defineField({ name: "description", title: "Full Description", type: "text", rows: 5 }),
    defineField({ name: "heroImage", title: "Hero Image", type: "image", options: { hotspot: true } }),
    defineField({ name: "gallery", title: "Gallery Images", type: "array", of: [{ type: "image" }] }),
    defineField({ name: "video", title: "Experience Video", type: "file", options: { accept: "video/*" } }),
    defineField({ name: "duration", title: "Duration", type: "string" }),
    defineField({ name: "location", title: "Location", type: "string" }),
    defineField({ name: "featured", title: "Featured on Home", type: "boolean", initialValue: false }),
    defineField({ name: "ctaText", title: "CTA Text", type: "string" }),
  ],
});
