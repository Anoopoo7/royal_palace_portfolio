import { schemaTypes } from "./schemas";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "o3q973rv";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "development";

export const sanityStudioConfig = {
  name: "royal-palace-studio",
  title: "Royal Palace Resort Studio",
  projectId,
  dataset,
  basePath: "/studio",
  schema: {
    types: schemaTypes,
  },
};

export default sanityStudioConfig;
