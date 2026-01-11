import "dotenv/config";
import { defineConfig } from "cypress";
import { resetDatabase } from "./test/db-utils.js";

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      on("task", {
        "db:reset": async () => {
          await resetDatabase();
          return null;
        },
      });
    },
    baseUrl: "http://localhost:3000",
    viewportWidth: 1280,
    viewportHeight: 800,
  },
});
