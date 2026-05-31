export const SALARY_TAX_RULES_2026 = {
  taxYear: 2026,
  personalDeduction: 15_500_000,
  dependentDeduction: 6_200_000,
  personalDeductionEffectiveFrom: "2026-01-01",
  salaryIncomeTaxEffectiveFrom: "2026-01-01",
  baseSalary: 2_340_000,
  baseSalaryEffectiveFrom: "2024-07-01",
  regionalMinimumWages: {
    I: 5_310_000,
    II: 4_730_000,
    III: 4_140_000,
    IV: 3_700_000,
  },
  regionalMinimumWageEffectiveFrom: "2026-01-01",
  employeeRates: {
    bhxh: 0.08,
    bhyt: 0.015,
    bhtn: 0.01,
  },
  monthlyTaxBrackets: [
    { upTo: 10_000_000, rate: 0.05 },
    { upTo: 30_000_000, rate: 0.1 },
    { upTo: 60_000_000, rate: 0.2 },
    { upTo: 100_000_000, rate: 0.3 },
    { upTo: Number.POSITIVE_INFINITY, rate: 0.35 },
  ],
} as const;

export type SalaryRegion = keyof typeof SALARY_TAX_RULES_2026.regionalMinimumWages;

export function getBhxhBhytCap() {
  return SALARY_TAX_RULES_2026.baseSalary * 20;
}

export function getBhtnCapByRegion(region: SalaryRegion) {
  return SALARY_TAX_RULES_2026.regionalMinimumWages[region] * 20;
}
