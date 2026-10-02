import { defineType, defineField } from "./types-helper";

export const navigation = defineType({
  name: "navigation",
  title: "Navigation Item",
  type: "document",
  fields: [
    defineField({ name: "label", title: "Label", type: "string", validation: (r) => r.required() }),
    defineField({ name: "url", title: "URL", type: "string", validation: (r) => r.required() }),
    defineField({ name: "openInNewTab", title: "Open in New Tab", type: "boolean", initialValue: false }),
    defineField({ name: "visible", title: "Visible", type: "boolean", initialValue: true }),
    defineField({ name: "order", title: "Display Order", type: "number", initialValue: 0 }),
  ],
});
