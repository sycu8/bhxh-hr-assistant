import { request } from "@playwright/test";

/** Làm nóng các route động trước khi chạy test song song. */
export default async function globalSetup() {
  const port = process.env.PLAYWRIGHT_PORT ?? "3099";
  const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${port}`;
  const ctx = await request.newContext();
  const warmPaths = ["/", "/ask-hr", "/legal-updates", "/faq"];

  for (const path of warmPaths) {
    for (let attempt = 0; attempt < 12; attempt++) {
      const res = await ctx.get(`${baseURL}${path}`);
      if (res.status() < 500) break;
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  await ctx.dispose();
}
