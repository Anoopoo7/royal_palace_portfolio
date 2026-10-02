import { defineType, defineField } from "./types-helper";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  fields: [
    defineField({ name: "propertyName", title: "Property Name", type: "string", validation: (r) => r.required() }),
    defineField({ name: "tagline", title: "Tagline", type: "string" }),
    defineField({ name: "logo", title: "Logo", type: "image" }),
    defineField({ name: "phone", title: "Phone Number", type: "string" }),
    defineField({ name: "whatsapp", title: "WhatsApp Number", type: "string" }),
    defineField({ name: "email", title: "Contact Email", type: "string" }),
    defineField({ name: "address", title: "Physical Address", type: "text", rows: 2 }),
    defineField({ name: "googleMapsUrl", title: "Google Maps URL", type: "url" }),
    defineField({ name: "instagramUrl", title: "Instagram URL", type: "url" }),
    defineField({ name: "facebookUrl", title: "Facebook URL", type: "url" }),
    defineField({ name: "defaultSeoTitle", title: "Default SEO Title", type: "string" }),
    defineField({ name: "defaultSeoDescription", title: "Default SEO Description", type: "text", rows: 3 }),
    defineField({ name: "defaultOgImage", title: "Default OG Image", type: "image" }),
  ],
});
