import { defineType, defineField } from "./types-helper";

export const homePage = defineType({
  name: "homePage",
  title: "Home Page Builder",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Page Title", type: "string", initialValue: "Homepage" }),
    defineField({
      name: "sections",
      title: "Page Sections (Drag to Reorder)",
      type: "array",
      of: [
        {
          type: "object",
          name: "heroSection",
          title: "1. Hero Section",
          fields: [
            defineField({ name: "enabled", title: "Enabled", type: "boolean", initialValue: true }),
            defineField({ name: "eyebrow", title: "Eyebrow Text", type: "string" }),
            defineField({ name: "heading", title: "Main Heading", type: "string" }),
            defineField({ name: "subtitle", title: "Subtitle Copy", type: "text", rows: 2 }),
            defineField({ name: "desktopVideoUrl", title: "Desktop Video URL", type: "url" }),
            defineField({ name: "mobileVideoUrl", title: "Mobile Video URL", type: "url" }),
            defineField({ name: "posterImage", title: "Poster Image", type: "image" }),
            defineField({ name: "primaryCtaText", title: "Primary Button Text", type: "string" }),
            defineField({ name: "secondaryCtaText", title: "Secondary Button Text", type: "string" }),
          ],
        },
        {
          type: "object",
          name: "bookingBarSection",
          title: "2. Booking Bar Section",
          fields: [
            defineField({ name: "enabled", title: "Enabled", type: "boolean", initialValue: true }),
            defineField({ name: "title", title: "Title", type: "string" }),
          ],
        },
        {
          type: "object",
          name: "editorialSection",
          title: "3. Editorial Brand Intro",
          fields: [
            defineField({ name: "enabled", title: "Enabled", type: "boolean", initialValue: true }),
            defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
            defineField({ name: "title", title: "Title", type: "string" }),
            defineField({ name: "bodyParagraphs", title: "Paragraphs", type: "array", of: [{ type: "text" }] }),
            defineField({ name: "imageUrl", title: "Image URL / Asset", type: "string" }),
            defineField({ name: "quote", title: "Pull Quote", type: "string" }),
          ],
        },
        {
          type: "object",
          name: "roomShowcaseSection",
          title: "4. Room Showcase",
          fields: [
            defineField({ name: "enabled", title: "Enabled", type: "boolean", initialValue: true }),
            defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
            defineField({ name: "title", title: "Title", type: "string" }),
            defineField({ name: "subtitle", title: "Subtitle", type: "string" }),
          ],
        },
        {
          type: "object",
          name: "storyScrollerSection",
          title: "5. Cinematic Story Scroller",
          fields: [
            defineField({ name: "enabled", title: "Enabled", type: "boolean", initialValue: true }),
            defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
            defineField({ name: "title", title: "Title", type: "string" }),
          ],
        },
        {
          type: "object",
          name: "experienceGridSection",
          title: "6. Varkala Experiences",
          fields: [
            defineField({ name: "enabled", title: "Enabled", type: "boolean", initialValue: true }),
            defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
            defineField({ name: "title", title: "Title", type: "string" }),
          ],
        },
        {
          type: "object",
          name: "dayTimelineSection",
          title: "7. A Day at Royal Palace",
          fields: [
            defineField({ name: "enabled", title: "Enabled", type: "boolean", initialValue: true }),
            defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
            defineField({ name: "title", title: "Title", type: "string" }),
          ],
        },
        {
          type: "object",
          name: "gallerySection",
          title: "8. Visual Journal Gallery",
          fields: [
            defineField({ name: "enabled", title: "Enabled", type: "boolean", initialValue: true }),
            defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
            defineField({ name: "title", title: "Title", type: "string" }),
          ],
        },
        {
          type: "object",
          name: "testimonialsSection",
          title: "9. Guest Stories",
          fields: [
            defineField({ name: "enabled", title: "Enabled", type: "boolean", initialValue: true }),
            defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
            defineField({ name: "title", title: "Title", type: "string" }),
          ],
        },
        {
          type: "object",
          name: "locationSection",
          title: "10. Location & Nearby",
          fields: [
            defineField({ name: "enabled", title: "Enabled", type: "boolean", initialValue: true }),
            defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
            defineField({ name: "title", title: "Title", type: "string" }),
          ],
        },
        {
          type: "object",
          name: "promotionSection",
          title: "11. Promotional Offer",
          fields: [
            defineField({ name: "enabled", title: "Enabled", type: "boolean", initialValue: true }),
          ],
        },
        {
          type: "object",
          name: "finalCtaSection",
          title: "12. Final Booking CTA",
          fields: [
            defineField({ name: "enabled", title: "Enabled", type: "boolean", initialValue: true }),
            defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
            defineField({ name: "heading", title: "Heading", type: "string" }),
            defineField({ name: "buttonText", title: "Button Text", type: "string" }),
          ],
        },
      ],
    }),
  ],
});
