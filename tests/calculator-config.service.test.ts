import { describe, expect, it, vi, beforeEach } from "vitest";

const findFirstMock = vi.fn();

vi.mock("@/lib/db/prisma", () => ({
  getDb: () => ({
    calculatorConfig: { findFirst: findFirstMock },
  }),
}));

vi.mock("@/lib/db/database-configured", () => ({
  isDatabaseConfigured: () => true,
}));

describe("calculator config service", () => {
  beforeEach(() => {
    findFirstMock.mockReset();
  });

  it("loads active config by key", async () => {
    findFirstMock.mockResolvedValue({
      id: "cfg-1",
      key: "salary-tax-2026",
      name: "Test",
      formulaJson: { baseSalary: 2530000 },
      effectiveFrom: new Date("2026-07-01"),
      effectiveTo: null,
    });
    const { getActiveCalculatorConfig } = await import(
      "@/lib/services/calculator-config.service"
    );
    const cfg = await getActiveCalculatorConfig("salary-tax-2026");
    expect(cfg?.formulaJson.baseSalary).toBe(2530000);
  });
});
