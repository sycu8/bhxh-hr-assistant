import { test, expect } from "@playwright/test";
import {
  QA_EMPLOYEE_EMAIL,
  expectJsonResponse,
  hasDb,
  loginEmployeeViaUi,
  requestOtpApi,
} from "./auth-helpers";
import { gotoStable } from "./helpers";

test.describe("Employee login", () => {
  test("login page renders OTP form", async ({ page }) => {
    await gotoStable(page, "/login");
    await expect(page.getByRole("heading", { name: /Chào mừng trở lại/i })).toBeVisible();
    await expect(page.getByLabel("Email công ty")).toBeVisible();
    await expect(page.getByRole("button", { name: "Gửi mã OTP" })).toBeVisible();
  });

  test("OTP API returns JSON not HTML", async ({ request }) => {
    test.skip(!hasDb, "DATABASE_URL not set");
    const res = await requestOtpApi(request, QA_EMPLOYEE_EMAIL);
    expect(res.status()).toBeLessThan(500);
    const json = await expectJsonResponse(res);
    expect(json.success).toBe(true);
  });

  test("full OTP login reaches profile", async ({ page }) => {
    test.skip(!hasDb, "DATABASE_URL not set");
    await loginEmployeeViaUi(page);
    await expect(page.getByRole("heading", { name: /Hồ sơ của tôi/i })).toBeVisible({
      timeout: 15_000,
    });
  });
});

test.describe("Employee route guards", () => {
  test("unauthenticated /my-hr redirects to login", async ({ page }) => {
    await page.goto("/my-hr/profile");
    await expect(page).toHaveURL(/\/login/);
    expect(page.url()).toContain("next=");
  });

  test("unauthenticated /pay/payslips redirects to login", async ({ page }) => {
    await page.goto("/pay/payslips");
    await expect(page).toHaveURL(/\/login/);
  });
});
