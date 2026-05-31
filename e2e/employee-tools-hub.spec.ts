import { test, expect } from "@playwright/test";
import { EMPLOYEE_TOOL_GROUPS } from "../src/lib/navigation/employee-tools";

test.describe("Công cụ cho Nhân viên hub", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/calculators");
  });

  test("shows all tool groups and CTAs", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Công cụ cho Nhân viên",
    );
    for (const group of EMPLOYEE_TOOL_GROUPS) {
      await expect(page.getByRole("heading", { name: group.title })).toBeVisible();
    }
    const ctaCount = EMPLOYEE_TOOL_GROUPS.reduce((n, g) => n + g.tools.length, 0);
    await expect(page.locator("section a.inline-flex")).toHaveCount(ctaCount);
  });

  test("every tool CTA navigates without 5xx", async ({ page }) => {
    const hrefs = [
      ...new Set(EMPLOYEE_TOOL_GROUPS.flatMap((g) => g.tools.map((t) => t.href))),
    ];

    for (const href of hrefs) {
      const res = await page.goto(href, { waitUntil: "domcontentloaded" });
      expect(res?.status() ?? 0, `failed loading ${href}`).toBeLessThan(500);
      await expect(page.locator("body")).not.toContainText("Application error");
      await expect(page.locator("body")).not.toContainText("Internal Server Error");
    }
  });
});
