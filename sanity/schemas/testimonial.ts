import { defineType, defineField } from "./types-helper";

export const testimonial = defineType({
  name: "testimonial",
  title: "Testimonial",
  type: "document",
  fields: [
    defineField({ name: "quote", title: "Quote", type: "text", rows: 3, validation: (r) => r.required() }),
    defineField({ name: "guestName", title: "Guest Name", type: "string", validation: (r) => r.required() }),
    defineField({ name: "guestLocation", title: "Guest Location", type: "string" }),
    defineField({
      name: "source",
      title: "Review Source",
      type: "string",
      options: { list: ["Google", "TripAdvisor", "Direct Guest", "Airbnb"] },
    }),
    defineField({ name: "guestImage", title: "Guest Photo", type: "image" }),
    defineField({ name: "featured", title: "Featured", type: "boolean", initialValue: true }),
    defineField({ name: "order", title: "Display Order", type: "number", initialValue: 0 }),
  ],
});
