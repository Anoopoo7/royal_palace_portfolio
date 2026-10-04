import { defineType, defineField } from "./types-helper";
import { customMetaTagsField } from "./customMetaTagsField";

export const room = defineType({
  name: "room",
  title: "Room",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Room Name", type: "string", validation: (r) => r.required() }),
    defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "name", maxLength: 96 } }),
    defineField({ name: "shortDescription", title: "Short Description", type: "text", rows: 2 }),
    defineField({ name: "description", title: "Full Description", type: "text", rows: 5 }),
    defineField({ name: "featured", title: "Featured on Home", type: "boolean", initialValue: false }),
    defineField({ name: "heroImage", title: "Hero Image", type: "image", options: { hotspot: true } }),
    defineField({ name: "gallery", title: "Gallery Images", type: "array", of: [{ type: "image" }] }),
    defineField({ name: "capacity", title: "Guest Capacity", type: "number", initialValue: 2 }),
    defineField({ name: "beds", title: "Bed Configuration", type: "string" }),
    defineField({ name: "bathrooms", title: "Bathroom Details", type: "string" }),
    defineField({ name: "amenities", title: "Amenities", type: "array", of: [{ type: "string" }] }),
    defineField({ name: "highlights", title: "Key Highlights", type: "array", of: [{ type: "string" }] }),
    defineField({ name: "basePrice", title: "Display Base Price (INR)", type: "number" }),
    defineField({ name: "ctaLabel", title: "CTA Button Label", type: "string", initialValue: "Reserve Room" }),
    defineField({ name: "seoTitle", title: "SEO Title", type: "string" }),
    defineField({ name: "seoDescription", title: "SEO Description", type: "text" }),
    customMetaTagsField,
  ],
});
