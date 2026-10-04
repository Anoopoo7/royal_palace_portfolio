import { defineType, defineField } from "./types-helper";
import { customMetaTagsField } from "./customMetaTagsField";

export const experiencesPage = defineType({
  name: "experiencesPage",
  title: "Experiences Listing Page",
  type: "document",
  fields: [
    defineField({
      name: "eyebrow",
      title: "Eyebrow Text",
      type: "string",
      initialValue: "CURATED EXPERIENCES",
    }),
    defineField({
      name: "heading",
      title: "Main Heading",
      type: "string",
      initialValue: "Discover Varkala & Beyond",
    }),
    defineField({
      name: "subtitle",
      title: "Subtitle / Description",
      type: "text",
      rows: 3,
      initialValue:
        "From dawn backwater kayaking to cliffside golden hour walks, we curate quiet, authentic journeys into Southern Kerala’s coastal culture.",
    }),
    defineField({
      name: "detailsCtaText",
      title: "Details CTA Button Text",
      type: "string",
      initialValue: "Explore Journey",
    }),
    defineField({
      name: "seoTitle",
      title: "SEO Title",
      type: "string",
      initialValue: "Varkala Experiences",
    }),
    defineField({
      name: "seoDescription",
      title: "SEO Description",
      type: "text",
      rows: 2,
      initialValue:
        "Explore cliffside walks, backwater kayaking, and authentic Malabar dining at Royal Palace Varkala.",
    }),
    customMetaTagsField,
  ],
});
