import { defineConfig, devices } from "@playwright/test";

const baseURL =
  process.env.PLAYWRIGHT_BASE_URL ||
  process.env.E2E_BASE_URL ||
  "http://localhost:3000";
const shouldStartLocalServer =
  !process.env.PLAYWRIGHT_BASE_URL && !process.env.E2E_BASE_URL;

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30000,
  fullyParallel: true,
  forbidOnly: false,
  retries: 0,
  workers: 1,
  reporter: "html",
  use: {
    baseURL,
    trace: "on-first-retry",
    video: "retain-on-failure",
    screenshot: "only-on-failure",
    headless: false,
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  webServer: shouldStartLocalServer
    ? {
        command: "npm run dev",
        url: "http://localhost:3000",
        reuseExistingServer: true,
        timeout: 120000,
      }
    : undefined,
});
