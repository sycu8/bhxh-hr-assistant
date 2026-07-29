import { test, expect } from "@playwright/test";
import { gotoStable } from "./helpers";

const MOBILE_VIEWPORTS = [
  { width: 390, height: 844, name: "iPhone 14" },
  { width: 320, height: 568, name: "iPhone SE" },
] as const;

for (const viewport of MOBILE_VIEWPORTS) {
  test.describe(`Mobile layout (${viewport.name})`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    test("FAQ detail fits viewport without horizontal overflow", async ({ page }) => {
      await gotoStable(page, "/hoi-dap/bat-buoc-tham-gia-bhxh");

      const overflow = await page.evaluate(() => {
        const doc = document.documentElement;
        return doc.scrollWidth - doc.clientWidth;
      });

      expect(overflow).toBeLessThanOrEqual(1);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    });

    test("header navigation fits viewport", async ({ page }) => {
      await gotoStable(page, "/");

      const overflow = await page.evaluate(() => {
        const doc = document.documentElement;
        return doc.scrollWidth - doc.clientWidth;
      });

      expect(overflow).toBeLessThanOrEqual(1);
    });
  });
}
