import { defineConfig, devices } from "@playwright/test";

const port = process.env.PLAYWRIGHT_PORT ?? "3099";
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${port}`;

export default defineConfig({
  globalSetup: "./e2e/global-setup.ts",
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : 4,
  reporter: [["list"], ["json", { outputFile: "e2e/test-results.json" }]],
  timeout: 60_000,
  use: {
    baseURL,
    trace: "on-first-retry",
    locale: "vi-VN",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: process.env.PLAYWRIGHT_SKIP_WEBSERVER
    ? undefined
    : {
        command: `pnpm exec next start -H 127.0.0.1 -p ${port}`,
        /** Warm dynamic route hay lỗi 500 lần request đầu sau khi process mới lên. */
        url: `${baseURL}/ask-hr`,
        /** Luôn khởi động server mới sau build — tránh reuse instance cũ (500 trên /ask-hr). */
        reuseExistingServer: false,
        timeout: 180_000,
        stdout: "pipe",
        stderr: "pipe",
      },
});
