import { defineType, defineField } from "./types-helper";

export const galleryItem = defineType({
  name: "galleryItem",
  title: "Gallery Item",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string" }),
    defineField({ name: "media", title: "Media Image", type: "image", options: { hotspot: true } }),
    defineField({
      name: "type",
      title: "Media Type",
      type: "string",
      options: { list: ["image", "video"] },
      initialValue: "image",
    }),
    defineField({ name: "video", title: "Video File (If video type)", type: "file", options: { accept: "video/*" } }),
    defineField({ name: "caption", title: "Caption", type: "string" }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: { list: ["Architectural", "Rooms", "Varkala", "Dining", "Slow Living"] },
    }),
    defineField({ name: "featured", title: "Featured on Home", type: "boolean", initialValue: true }),
    defineField({
      name: "size",
      title: "Grid Span Size",
      type: "string",
      options: { list: ["standard", "large", "tall", "wide"] },
      initialValue: "standard",
    }),
  ],
});
