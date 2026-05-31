import { describe, expect, it } from "vitest";
import { POST } from "@/app/api/calculators/salary-tax/route";

async function postSalaryTax(body: Record<string, unknown>) {
  const req = new Request("http://localhost/api/calculators/salary-tax", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return POST(req);
}

describe("POST /api/calculators/salary-tax", () => {
  it("returns 200 and net salary for gross-to-net", async () => {
    const res = await postSalaryTax({
      mode: "gross-to-net",
      grossSalary: 35_000_000,
      insuranceSalaryBase: 35_000_000,
      region: "I",
      dependentCount: 0,
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.result.summary.grossSalary).toBe(35_000_000);
    expect(json.data.result.summary.netSalary).toBeGreaterThan(0);
    expect(json.data.result.summary.netSalary).toBeLessThan(35_000_000);
  });

  it("returns 400 for invalid payload", async () => {
    const res = await postSalaryTax({
      mode: "gross-to-net",
      grossSalary: -1,
      insuranceSalaryBase: 10_000_000,
      region: "I",
      dependentCount: 0,
    });
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.status).toBeLessThan(500);
  });

  it("returns 200 for net-to-gross mode", async () => {
    const res = await postSalaryTax({
      mode: "net-to-gross",
      targetNetSalary: 30_000_000,
      insuranceSalaryBase: 30_000_000,
      region: "II",
      dependentCount: 1,
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.result.summary.netSalary).toBeGreaterThanOrEqual(29_500_000);
  });
});
