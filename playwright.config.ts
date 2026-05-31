import { defineConfig, devices } from "@playwright/test";

/** Port riêng — tránh reuse server `next start` cũ còn treo sau lần test trước. */
const port = process.env.PLAYWRIGHT_PORT ?? "3199";
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 1,
  workers: 1,
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
        command: "node scripts/start-e2e-server.mjs",
        /** Route động hay lỗi nếu build cũ — dùng làm health check. */
        url: `${baseURL}/cong-cu-luong-thue`,
        reuseExistingServer: false,
        timeout: 180_000,
        stdout: "pipe",
        stderr: "pipe",
      },
});
