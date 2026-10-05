import { defineType, defineField } from "./types-helper";
import { customMetaTagsField } from "./customMetaTagsField";

export const roomsPage = defineType({
  name: "roomsPage",
  title: "Rooms Listing Page",
  type: "document",
  fields: [
    defineField({
      name: "eyebrow",
      title: "Eyebrow Text",
      type: "string",
      initialValue: "ACCOMMODATIONS & SUITES",
    }),
    defineField({
      name: "heading",
      title: "Main Heading",
      type: "string",
      initialValue: "Architectural Sanctuaries",
    }),
    defineField({
      name: "subtitle",
      title: "Subtitle / Description",
      type: "text",
      rows: 3,
      initialValue:
        "Each suite and villa at Royal Palace is crafted from warm Kerala teak, natural stone, and expansive ocean balconies designed to capture slow coastal daylight.",
    }),
    defineField({
      name: "detailsCtaText",
      title: "View Suite CTA Text",
      type: "string",
      initialValue: "View Details",
    }),
    defineField({
      name: "villaBookCtaText",
      title: "Book Entire Villa CTA Text",
      type: "string",
      initialValue: "Book Entire Villa",
    }),
    defineField({
      name: "amenitiesHeading",
      title: "Amenities Section Heading",
      type: "string",
      initialValue: "Key Amenities",
    }),
    defineField({
      name: "seoTitle",
      title: "SEO Title",
      type: "string",
      initialValue: "Accommodations & Suites",
    }),
    defineField({
      name: "seoDescription",
      title: "SEO Description",
      type: "text",
      rows: 2,
      initialValue:
        "Discover luxury cliffside suites and heritage teak villas at Royal Palace Varkala.",
    }),
    customMetaTagsField,
  ],
});
