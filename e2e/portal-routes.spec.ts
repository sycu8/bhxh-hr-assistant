import { test, expect } from "@playwright/test";
import { hasDb, loginEmployeeViaUi, QA_ADMIN_EMAIL, QA_ADMIN_PASSWORD } from "./auth-helpers";
import { gotoStable } from "./helpers";

const EMPLOYEE_ROUTES = [
  { path: "/my-hr/profile", mustContain: "Hồ sơ" },
  { path: "/time/leave", mustContain: "Nghỉ phép" },
  { path: "/pay/payslips", mustContain: "Phiếu lương" },
  { path: "/my-hr/policies", mustContain: "Chính sách" },
  { path: "/my-hr/tickets", mustContain: "ticket" },
  { path: "/my-hr/documents", mustContain: "Giấy tờ" },
  { path: "/bao-hiem/history", mustContain: "BHXH" },
] as const;

test.describe("Employee portal pages (authenticated)", () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!hasDb, "DATABASE_URL not set");
    await loginEmployeeViaUi(page);
  });

  for (const spec of EMPLOYEE_ROUTES) {
    test(`${spec.path} loads without 5xx`, async ({ page }) => {
      const res = await gotoStable(page, spec.path);
      expect(res!.status()).toBeLessThan(500);
      await expect(page.locator("body")).toContainText(spec.mustContain, {
        ignoreCase: true,
      });
      await expect(page.locator("body")).not.toContainText("Application error");
    });
  }

  test("leave form can be filled", async ({ page }) => {
    await gotoStable(page, "/time/leave");
    const start = page.locator('input[name="startDate"]');
    const end = page.locator('input[name="endDate"]');
    await expect(start).toBeVisible();
    await start.fill("2026-07-01");
    await end.fill("2026-07-02");
    await page.locator('textarea[name="reason"]').fill("QA test leave");
    await expect(page.getByRole("button", { name: /Gửi đăng ký/i })).toBeEnabled();
  });
});

test.describe("Admin CMS", () => {
  test("admin login page renders", async ({ page }) => {
    await gotoStable(page, "/admin/login");
    await expect(page.getByRole("heading", { name: /Đăng nhập CMS/i })).toBeVisible();
  });

  test("unauthenticated /admin redirects to login", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("admin can access dashboard", async ({ page }) => {
    test.skip(!hasDb, "DATABASE_URL not set");
    await page.goto("/admin/login");
    await page.getByLabel("Email").fill(QA_ADMIN_EMAIL);
    await page.getByLabel("Mật khẩu").fill(QA_ADMIN_PASSWORD);
    await page.getByRole("button", { name: "Đăng nhập" }).click();
    await page.waitForURL(/\/admin(?!\/login)/, { timeout: 20_000 });
    await expect(page.locator("body")).not.toContainText("Application error");
  });
});

test.describe("HR console", () => {
  test("unauthenticated /hr redirects", async ({ page }) => {
    await page.goto("/hr");
    await expect(page).toHaveURL(/\/(admin\/login|login)/);
  });
});
