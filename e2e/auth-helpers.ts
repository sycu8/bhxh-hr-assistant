import { expect, type APIRequestContext, type Page } from "@playwright/test";

export const QA_EMPLOYEE_EMAIL = "employee@fpt.com";
export const QA_ADMIN_EMAIL = "admin@fpt.com";
export const QA_ADMIN_PASSWORD = "Admin@123456";
export const QA_OTP_CODE = process.env.E2E_FIXED_OTP ?? "424242";

export const hasDb = Boolean(process.env.DATABASE_URL);

export async function loginEmployeeViaUi(
  page: Page,
  email = QA_EMPLOYEE_EMAIL,
) {
  await page.goto("/login");
  await page.getByLabel("Email công ty").fill(email);
  await page.getByRole("button", { name: "Gửi mã OTP" }).click();
  await expect(page.getByText("Mã OTP đã gửi tới")).toBeVisible({
    timeout: 20_000,
  });
  await page.getByLabel("Mã OTP").fill(QA_OTP_CODE);
  await page.getByRole("button", { name: "Đăng nhập" }).click();
  await page.waitForURL(/\/my-hr/, { timeout: 20_000 });
}

export async function loginAdminViaUi(
  page: Page,
  email = QA_ADMIN_EMAIL,
  password = QA_ADMIN_PASSWORD,
) {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Mật khẩu").fill(password);
  await page.getByRole("button", { name: "Đăng nhập" }).click();
  await page.waitForURL(/\/admin(?!\/login)/, { timeout: 20_000 });
}

export async function requestOtpApi(
  request: APIRequestContext,
  email: string,
) {
  return request.post("/api/v1/auth/otp/request", {
    data: { email },
    headers: { "Content-Type": "application/json" },
  });
}

export async function expectJsonResponse(res: {
  headers: () => Record<string, string>;
  json: () => Promise<unknown>;
}) {
  const contentType = res.headers()["content-type"] ?? "";
  expect(contentType).toContain("application/json");
  return res.json() as Promise<{
    success?: boolean;
    error?: { message?: string };
  }>;
}
