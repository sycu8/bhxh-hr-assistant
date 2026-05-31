import { test, expect } from "@playwright/test";
import { PUBLIC_ROUTE_SPECS } from "../tests/fixtures/public-routes";

const hasDb = Boolean(process.env.DATABASE_URL);

for (const spec of PUBLIC_ROUTE_SPECS) {
  test(`page ${spec.path} renders without error`, async ({ page }) => {
    test.skip(spec.requiresDb && !hasDb, "DATABASE_URL not set");

    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    const response = await page.goto(spec.path, { waitUntil: "domcontentloaded" });
    expect(response, `no response for ${spec.path}`).not.toBeNull();
    expect(response!.status(), `HTTP status for ${spec.path}`).toBeLessThan(500);

    if (spec.finalUrl) {
      await expect(page).toHaveURL(spec.finalUrl);
    }

    await expect(page.locator("body")).toContainText(spec.mustContain, {
      ignoreCase: true,
    });

    const fatal = errors.filter(
      (e) =>
        !e.includes("favicon") &&
        !e.includes("hydration") &&
        !e.includes("Download the React DevTools"),
    );
    expect(fatal, `console/page errors on ${spec.path}:\n${fatal.join("\n")}`).toEqual([]);
  });
}
