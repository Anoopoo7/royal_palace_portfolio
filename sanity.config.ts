import { defineConfig, Template } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./sanity/schemas";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "o3q973rv";
const productionDataset = process.env.SANITY_STUDIO_PRODUCTION_DATASET || "production";
const developmentDataset = process.env.SANITY_STUDIO_DEVELOPMENT_DATASET || "development";

// Singleton document types that should only have a single document instance
const singletonTypes = new Set([
  "siteSettings",
  "homePage",
  "roomsPage",
  "experiencesPage",
  "aboutPage",
  "contactPage",
]);

const sharedConfig = {
  projectId,
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Content Studio")
          .items([
            // Singleton: Site Settings
            S.listItem()
              .title("Site Settings")
              .id("siteSettings")
              .child(
                S.document()
                  .schemaType("siteSettings")
                  .documentId("siteSettings")
              ),
            // Singleton: Home Page
            S.listItem()
              .title("Home Page Builder")
              .id("homePage")
              .child(
                S.document()
                  .schemaType("homePage")
                  .documentId("homePage")
              ),
            // Singleton: Rooms Listing Page
            S.listItem()
              .title("Rooms Listing Page")
              .id("roomsPage")
              .child(
                S.document()
                  .schemaType("roomsPage")
                  .documentId("roomsPage")
              ),
            // Singleton: Experiences Listing Page
            S.listItem()
              .title("Experiences Listing Page")
              .id("experiencesPage")
              .child(
                S.document()
                  .schemaType("experiencesPage")
                  .documentId("experiencesPage")
              ),
            // Singleton: About Page
            S.listItem()
              .title("About Page")
              .id("aboutPage")
              .child(
                S.document()
                  .schemaType("aboutPage")
                  .documentId("aboutPage")
              ),
            // Singleton: Contact Page
            S.listItem()
              .title("Contact Page")
              .id("contactPage")
              .child(
                S.document()
                  .schemaType("contactPage")
                  .documentId("contactPage")
              ),

            S.divider(),

            // Regular document lists (Collections)
            ...S.documentTypeListItems().filter(
              (listItem) => !singletonTypes.has(listItem.getId() || "")
            ),
          ]),
    }),
    visionTool(),
  ],
  schema: {
    types: schemaTypes,
    // Filter out singleton types from "Create new document" dropdown
    templates: (templates: Template[]) =>
      templates.filter(({ schemaType }) => !singletonTypes.has(schemaType)),
  },
};

export default defineConfig([
  {
    ...sharedConfig,
    name: "production",
    title: "Royal Palace Resort",
    basePath: "/production",
    dataset: productionDataset,
  },
  {
    ...sharedConfig,
    name: "development",
    title: "Royal Palace Resort (Test)",
    basePath: "/development",
    dataset: developmentDataset,
  },
]);
