import { test, expect } from "@playwright/test";
import { PUBLIC_ROUTE_SPECS } from "../tests/fixtures/public-routes";
import { expectPageText, gotoStable } from "./helpers";

const hasDb = Boolean(process.env.DATABASE_URL);

for (const spec of PUBLIC_ROUTE_SPECS) {
  test(`page ${spec.path} renders without error`, async ({ page }) => {
    test.skip(spec.requiresDb && !hasDb, "DATABASE_URL not set");

    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    const response = await gotoStable(page, spec.path);
    expect(response, `no response for ${spec.path}`).not.toBeNull();
    expect(response!.status(), `HTTP status for ${spec.path}`).toBeLessThan(500);

    if (spec.finalUrl) {
      await expect(page).toHaveURL(spec.finalUrl);
    }

    await expectPageText(page, spec.mustContain);

    await expect(page.locator("body")).not.toContainText("Application error");
    await expect(page.locator("body")).not.toContainText("Internal Server Error");

    const fatal = errors.filter(
      (e) =>
        !e.includes("favicon") &&
        !e.includes("hydration") &&
        !e.includes("Download the React DevTools") &&
        !/Failed to load resource.*500/.test(e),
    );
    expect(fatal, `console/page errors on ${spec.path}:\n${fatal.join("\n")}`).toEqual([]);
  });
}

test("footer credits author with LinkedIn", async ({ page }) => {
  await gotoStable(page, "/hoi-dap");
  const authorLink = page.getByRole("link", { name: "Lê Sỹ Cường" });
  await expect(authorLink).toBeVisible({ timeout: 15_000 });
  await expect(authorLink).toHaveAttribute("href", "https://www.linkedin.com/in/sycule/");
});
