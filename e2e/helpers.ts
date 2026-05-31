import { expect, type Page } from "@playwright/test";

export async function gotoStable(page: Page, path: string) {
  let lastResponse = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    lastResponse = await page.goto(path, {
      waitUntil: "domcontentloaded",
      timeout: 45_000,
    });
    if (lastResponse && lastResponse.status() < 500) {
      await page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => undefined);
      return lastResponse;
    }
    await page.waitForTimeout(600);
  }
  return lastResponse;
}

/** Chờ nội dung client render (sau khi shell HTML đã tải). */
export async function expectPageText(
  page: Page,
  text: string,
  options?: { timeout?: number },
) {
  await expect(page.locator("body")).toContainText(text, {
    ignoreCase: true,
    timeout: options?.timeout ?? 20_000,
  });
}

export function mainNav(page: Page) {
  return page.getByRole("navigation", { name: "Điều hướng chính" });
}
