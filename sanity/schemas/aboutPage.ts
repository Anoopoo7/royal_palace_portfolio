import { defineType, defineField } from "./types-helper";

export const aboutPage = defineType({
  name: "aboutPage",
  title: "About Page",
  type: "document",
  fields: [
    defineField({
      name: "eyebrow",
      title: "Eyebrow Text",
      type: "string",
      initialValue: "OUR PHILOSOPHY",
    }),
    defineField({
      name: "heading",
      title: "Main Heading",
      type: "string",
      initialValue: "Slow Hospitality in Kerala",
    }),
    defineField({
      name: "heroImage",
      title: "Hero Image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "storyTitle",
      title: "Story Section Title",
      type: "string",
      initialValue: "Crafted for Unhurried Living",
    }),
    defineField({
      name: "storyParagraphs",
      title: "Story Paragraphs",
      type: "array",
      of: [{ type: "text", rows: 4 }],
      initialValue: [
        "Royal Palace was conceived as an architectural antidote to fast-paced commercial resorts. Located on the serene red clay cliffs of Varkala, the property celebrates natural Malabar teak wood, open garden courtyards, and sea breezes.",
        "Every detail — from our daily coastal sea catch cooked over banana leaves to sunrise backwater kayaking — is curated to help guests reconnect with nature and quiet living.",
      ],
    }),
    defineField({
      name: "ctaTitle",
      title: "CTA Card Title",
      type: "string",
      initialValue: "Plan Your Varkala Escape",
    }),
    defineField({
      name: "ctaSubtitle",
      title: "CTA Card Subtitle",
      type: "string",
      initialValue: "Experience private ocean view suites and personalized Kerala hospitality.",
    }),
    defineField({
      name: "ctaButtonText",
      title: "CTA Button Text",
      type: "string",
      initialValue: "Check Room Availability",
    }),
    defineField({
      name: "seoTitle",
      title: "SEO Title",
      type: "string",
      initialValue: "About Royal Palace",
    }),
    defineField({
      name: "seoDescription",
      title: "SEO Description",
      type: "text",
      rows: 2,
      initialValue: "The story behind Royal Palace private resort homestay in Varkala, Kerala.",
    }),
  ],
});
