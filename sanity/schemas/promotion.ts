import { defineType, defineField } from "./types-helper";

export const promotion = defineType({
  name: "promotion",
  title: "Promotion Offer",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Promotion Title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "description", title: "Offer Description", type: "text", rows: 3 }),
    defineField({ name: "image", title: "Promotion Banner Image", type: "image" }),
    defineField({ name: "videoUrl", title: "Promotion Video URL", type: "url" }),
    defineField({ name: "ctaLabel", title: "CTA Button Text", type: "string", initialValue: "Claim Offer" }),
    defineField({ name: "ctaUrl", title: "CTA Target URL", type: "string", initialValue: "/booking" }),
    defineField({ name: "validFrom", title: "Valid From (Date)", type: "date" }),
    defineField({ name: "validUntil", title: "Valid Until (Date)", type: "date" }),
    defineField({ name: "enabled", title: "Enabled", type: "boolean", initialValue: true }),
  ],
});
