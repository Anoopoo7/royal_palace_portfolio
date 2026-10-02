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
            defineField({ name: "desktopVideo", title: "Desktop Background Video", type: "file", options: { accept: "video/*" } }),
            defineField({ name: "mobileVideo", title: "Mobile Background Video", type: "file", options: { accept: "video/*" } }),
            defineField({ name: "posterImage", title: "Poster / Fallback Image", type: "image", options: { hotspot: true } }),
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
            defineField({ name: "image", title: "Section Image", type: "image", options: { hotspot: true } }),
            defineField({ name: "imageCaption", title: "Image Caption", type: "string" }),
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
            defineField({
              name: "scenes",
              title: "Scenes",
              type: "array",
              of: [
                {
                  type: "object",
                  name: "storyScene",
                  title: "Scene",
                  fields: [
                    defineField({ name: "title", title: "Scene Title", type: "string" }),
                    defineField({ name: "subtitle", title: "Scene Subtitle / Time Label", type: "string" }),
                    defineField({ name: "description", title: "Scene Description", type: "text", rows: 3 }),
                    defineField({
                      name: "media",
                      title: "Scene Image",
                      type: "image",
                      options: { hotspot: true },
                    }),
                    defineField({
                      name: "mediaType",
                      title: "Media Type",
                      type: "string",
                      options: { list: ["image", "video"] },
                      initialValue: "image",
                    }),
                    defineField({ name: "durationSeconds", title: "Auto-advance Duration (seconds)", type: "number" }),
                  ],
                  preview: {
                    select: { title: "title", subtitle: "subtitle", media: "media" },
                  },
                },
              ],
            }),
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
            defineField({ name: "subtitle", title: "Subtitle", type: "string" }),
            defineField({
              name: "items",
              title: "Timeline Items",
              type: "array",
              of: [
                {
                  type: "object",
                  name: "timelineItem",
                  title: "Timeline Item",
                  fields: [
                    defineField({ name: "time", title: "Time (e.g. 07:00 AM)", type: "string" }),
                    defineField({ name: "title", title: "Activity Title", type: "string" }),
                    defineField({ name: "description", title: "Description", type: "text", rows: 2 }),
                    defineField({ name: "iconName", title: "Icon Name (optional)", type: "string" }),
                  ],
                  preview: {
                    select: { title: "title", subtitle: "time" },
                  },
                },
              ],
            }),
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
            defineField({ name: "description", title: "Description", type: "text", rows: 3 }),
            defineField({ name: "address", title: "Full Address", type: "string" }),
            defineField({ name: "mapUrl", title: "Google Maps URL", type: "url" }),
            defineField({
              name: "landmarks",
              title: "Nearby Landmarks",
              type: "array",
              of: [
                {
                  type: "object",
                  name: "landmark",
                  title: "Landmark",
                  fields: [
                    defineField({ name: "name", title: "Place Name", type: "string" }),
                    defineField({ name: "distance", title: "Distance (e.g. 4 mins walk)", type: "string" }),
                    defineField({ name: "description", title: "Short Description", type: "string" }),
                  ],
                  preview: {
                    select: { title: "name", subtitle: "distance" },
                  },
                },
              ],
            }),
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
            defineField({ name: "subtitle", title: "Subtitle", type: "text", rows: 2 }),
            defineField({ name: "buttonText", title: "Button Text", type: "string" }),
            defineField({ name: "backgroundImage", title: "Background Image", type: "image", options: { hotspot: true } }),
          ],
        },
      ],
    }),
  ],
});
