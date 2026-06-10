import { defineConfig, devices } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3001";
const authFile = path.join(__dirname, "playwright/.auth/publisher.json");
const hasAuth = fs.existsSync(authFile);

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "publisher-gate",
      testMatch: /publisher-auth-gate\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "publisher-workflow",
      testMatch: /publisher-workflow\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        storageState: hasAuth ? authFile : undefined,
      },
    },
  ],
  webServer: process.env.PLAYWRIGHT_SKIP_WEBSERVER
    ? undefined
    : {
        command: "npm run dev -- -p 3001",
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
