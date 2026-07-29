import { describe, expect, it } from "vitest";

const BASE =
  process.env.UAT_BASE_URL?.trim() || "https://bhxh.orangecloud.vn";

async function fetchText(path: string) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Cache-Control": "no-cache" },
  });
  return { res, text: await res.text() };
}

describe("UAT realistic scenarios (regression)", () => {
  const networkTimeout = 30_000;

  it(
    "SC-02 login SSR shell exposes welcome + email hint (not client-only button)",
    async () => {
    const { res, text } = await fetchText("/login");
    expect(res.status).toBe(200);
    expect(text).toContain("Chào mừng trở lại");
    expect(text).toContain("email công ty");
    expect(text).toContain("Đăng nhập nhân viên");
    // Nút "Gửi mã OTP" chỉ sau hydrate — kiểm tra E2E portal-auth.spec.ts
    expect(text.includes("Gửi mã OTP")).toBe(false);
    },
    networkTimeout,
  );

  it(
    "SC-05 salary-tax API returns net take-home",
    async () => {
    const res = await fetch(`${BASE}/api/calculators/salary-tax`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "gross-to-net",
        grossSalary: 35_000_000,
        insuranceSalaryBase: 35_000_000,
        region: "I",
        dependentCount: 0,
      }),
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data?.result?.summary?.netSalary).toBeGreaterThan(0);
    },
    networkTimeout,
  );

  it(
    "SC-06 social insurance API returns employee total",
    async () => {
    const res = await fetch(
      `${BASE}/api/calculators/social-insurance-contribution`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ salaryBase: 20_000_000 }),
      },
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data?.result?.employee?.total).toBeGreaterThan(0);
    },
    networkTimeout,
  );

  it(
    "SC-08 OTP request returns JSON envelope (not HTML error page)",
    async () => {
    const res = await fetch(`${BASE}/api/v1/auth/otp/request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "employee@fpt.com" }),
    });
    expect(res.status).toBeLessThan(500);
    expect(res.headers.get("content-type")).toContain("application/json");
    const json = await res.json();
    expect(json.success).toBe(true);
    },
    networkTimeout,
  );

  it(
    "SC-10 unauthenticated profile redirects to login",
    async () => {
    const res = await fetch(`${BASE}/my-hr/profile`, { redirect: "manual" });
    expect([302, 307]).toContain(res.status);
    expect(res.headers.get("location")).toMatch(/\/login/);
    },
    networkTimeout,
  );
});
