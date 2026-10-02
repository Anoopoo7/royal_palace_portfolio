import { defineCliConfig } from "sanity/cli";

export default defineCliConfig({
  api: {
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "o3q973rv",
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "development",
  },
  studioHost: "royal-palace-varkala",
  deployment: {
    appId: "rbd5fjnd3hr7b10oi8vmbvm7",
  },
});
