import { describe, expect, it } from "vitest";
import {
  CalculatorService,
  computeSocialInsuranceContribution,
  DEFAULT_SOCIAL_INSURANCE_RATES,
} from "@/lib/services/calculator.service";
import {
  getBhtnCapByRegion,
  SALARY_TAX_RULES_2026,
} from "@/lib/services/salary-tax-rules";
import { salaryTaxCalculatorSchema } from "@/lib/validators/calculator.schema";

describe("computeSocialInsuranceContribution", () => {
  it("computes employee contributions from salary base and fixed rates", () => {
    const salary = 20_000_000;
    const result = computeSocialInsuranceContribution(salary, {
      employeeBhxh: 0.08,
      employeeBhyt: 0.015,
      employeeBhtn: 0.01,
    });

    expect(result.employee.bhxh).toBe(1_600_000);
    expect(result.employee.bhyt).toBe(300_000);
    expect(result.employee.bhtn).toBe(200_000);
    expect(result.employee.total).toBe(2_100_000);
    expect(result.formulaExplanation.length).toBeGreaterThan(20);
    expect(result.disclaimer).toContain("HR");
  });

  it("uses default rates when none passed", () => {
    const result = computeSocialInsuranceContribution(10_000_000);

    expect(result.rates.employeeBhxh).toBe(
      DEFAULT_SOCIAL_INSURANCE_RATES.employeeBhxh,
    );
    expect(result.employee.total).toBe(
      Math.round(10_000_000 * 0.08) +
        Math.round(10_000_000 * 0.015) +
        Math.round(10_000_000 * 0.01),
    );
  });
});

describe("salary tax rules 2026", () => {
  it("exposes the 2026 family deductions and region caps", () => {
    expect(SALARY_TAX_RULES_2026.personalDeduction).toBe(15_500_000);
    expect(SALARY_TAX_RULES_2026.dependentDeduction).toBe(6_200_000);
    expect(getBhtnCapByRegion("I")).toBe(106_200_000);
    expect(getBhtnCapByRegion("IV")).toBe(74_000_000);
  });
});

describe("CalculatorService.computeSalaryTax", () => {
  const service = new CalculatorService();

  it("caps BHXH/BHYT and BHTN bases before computing deductions", () => {
    const result = service.computeSalaryTax({
      mode: "gross-to-net",
      grossSalary: 120_000_000,
      insuranceSalaryBase: 120_000_000,
      region: "I",
      dependentCount: 0,
    });

    expect(result.breakdown.insurance.bhxhBase).toBe(46_800_000);
    expect(result.breakdown.insurance.bhytBase).toBe(46_800_000);
    expect(result.breakdown.insurance.bhtnBase).toBe(106_200_000);
    expect(result.breakdown.insurance.bhxh).toBe(3_744_000);
    expect(result.breakdown.insurance.bhyt).toBe(702_000);
    expect(result.breakdown.insurance.bhtn).toBe(1_062_000);
  });

  it("computes family deductions and 2026 progressive tax for gross to net", () => {
    const result = service.computeSalaryTax({
      mode: "gross-to-net",
      grossSalary: 35_000_000,
      insuranceSalaryBase: 35_000_000,
      region: "I",
      dependentCount: 1,
    });

    expect(result.breakdown.familyDeduction).toBe(21_700_000);
    expect(result.breakdown.taxableIncome).toBe(9_625_000);
    expect(result.breakdown.personalIncomeTax).toBe(481_250);
    expect(result.summary.netSalary).toBe(30_843_750);
  });

  it("solves net to gross by reusing the same forward salary function", () => {
    const forward = service.computeSalaryTax({
      mode: "gross-to-net",
      grossSalary: 28_000_000,
      insuranceSalaryBase: 28_000_000,
      region: "I",
      dependentCount: 0,
    });

    const reverse = service.computeSalaryTax({
      mode: "net-to-gross",
      targetNetSalary: forward.summary.netSalary,
      insuranceSalaryBase: 28_000_000,
      region: "I",
      dependentCount: 0,
    });

    expect(Math.abs(reverse.summary.grossSalary - 28_000_000)).toBeLessThanOrEqual(
      2,
    );
    expect(
      Math.abs(reverse.summary.netSalary - forward.summary.netSalary),
    ).toBeLessThanOrEqual(2);
  });

  it("returns detailed take-home output from the calculator service", () => {
    const result = service.computeSalaryTax({
      mode: "take-home",
      grossSalary: 30_000_000,
      insuranceSalaryBase: 30_000_000,
      region: "I",
      dependentCount: 0,
    });

    expect(result.mode).toBe("take-home");
    expect(result.summary.netSalary).toBe(26_215_000);
    expect(result.breakdown.personalIncomeTax).toBe(635_000);
    expect(result.breakdown.insurance.total).toBe(3_150_000);
  });

  it("does not charge personal income tax when taxable income is below zero", () => {
    const result = service.computeSalaryTax({
      mode: "gross-to-net",
      grossSalary: 12_000_000,
      insuranceSalaryBase: 12_000_000,
      region: "I",
      dependentCount: 0,
    });

    expect(result.breakdown.taxableIncome).toBe(0);
    expect(result.breakdown.personalIncomeTax).toBe(0);
    expect(result.summary.netSalary).toBe(10_740_000);
  });
});

describe("salaryTaxCalculatorSchema", () => {
  it("validates unified salary tax calculator input", () => {
    const parsed = salaryTaxCalculatorSchema.parse({
      mode: "gross-to-net",
      grossSalary: 35_000_000,
      insuranceSalaryBase: 35_000_000,
      region: "I",
      dependentCount: 1,
    });

    expect(parsed.mode).toBe("gross-to-net");
    expect(parsed.region).toBe("I");
    expect(parsed.dependentCount).toBe(1);
  });
});
