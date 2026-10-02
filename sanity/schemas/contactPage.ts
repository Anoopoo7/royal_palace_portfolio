import { defineType, defineField } from "./types-helper";

export const contactPage = defineType({
  name: "contactPage",
  title: "Contact Page",
  type: "document",
  fields: [
    defineField({
      name: "eyebrow",
      title: "Eyebrow Text",
      type: "string",
      initialValue: "CONCIERGE & DIRECT CONTACT",
    }),
    defineField({
      name: "heading",
      title: "Main Heading",
      type: "string",
      initialValue: "We Are Here to Welcome You",
    }),
    defineField({
      name: "subtitle",
      title: "Subtitle / Description",
      type: "text",
      rows: 3,
      initialValue:
        "Reach out directly for custom booking inquiries, group stay reservations, or travel guidance from Trivandrum International Airport.",
    }),
    defineField({
      name: "formTitle",
      title: "Inquiry Form Title",
      type: "string",
      initialValue: "Send an Inquiry",
    }),
    defineField({
      name: "formSubmitText",
      title: "Form Submit Button Text",
      type: "string",
      initialValue: "Submit Inquiry",
    }),
    defineField({
      name: "seoTitle",
      title: "SEO Title",
      type: "string",
      initialValue: "Contact & Location",
    }),
    defineField({
      name: "seoDescription",
      title: "SEO Description",
      type: "text",
      rows: 2,
      initialValue:
        "Get in touch with Royal Palace Varkala concierge for reservations and directions.",
    }),
  ],
});
