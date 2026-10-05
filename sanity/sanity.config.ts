import { schemaTypes } from "./schemas";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "o3q973rv";
const productionDataset = process.env.SANITY_STUDIO_PRODUCTION_DATASET || "production";
const developmentDataset = process.env.SANITY_STUDIO_DEVELOPMENT_DATASET || "development";

export const sanityStudioConfig = {
  name: "production",
  title: "Royal Palace Resort (Production)",
  projectId,
  dataset: productionDataset,
  basePath: "/production",
  schema: {
    types: schemaTypes,
  },
};

export const sanityStudioConfigDev = {
  name: "development",
  title: "Royal Palace Resort (Development)",
  projectId,
  dataset: developmentDataset,
  basePath: "/development",
  schema: {
    types: schemaTypes,
  },
};

export default sanityStudioConfig;
