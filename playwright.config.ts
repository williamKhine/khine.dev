import { defineConfig, devices } from "@playwright/test";

const baseURL = "http://localhost:3105";

export default defineConfig({
  testDir: "./tests",
  use: { baseURL, ...devices["Desktop Chrome"] },
  webServer: {
    command: "npm run dev -- --hostname localhost --port 3105",
    url: baseURL,
    timeout: 60_000,
  },
});
