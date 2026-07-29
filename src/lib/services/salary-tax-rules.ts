/** Mốc 00:00 ICT ngày 01/7/2026 — lương cơ sở mới & Luật Dân số. */
const JULY_2026_EFFECTIVE_AT = new Date("2026-07-01T00:00:00+07:00");

export const SALARY_TAX_RULES_2026 = {
  taxYear: 2026,
  personalDeduction: 15_500_000,
  dependentDeduction: 6_200_000,
  personalDeductionEffectiveFrom: "2026-01-01",
  salaryIncomeTaxEffectiveFrom: "2026-01-01",
  /** Mức áp dụng từ 01/7/2026 (Nghị định 161/2026/NĐ-CP). */
  baseSalary: 2_530_000,
  baseSalaryEffectiveFrom: "2026-07-01",
  /** Mức trước 01/7/2026. */
  previousBaseSalary: 2_340_000,
  previousBaseSalaryEffectiveFrom: "2024-07-01",
  previousBaseSalaryEffectiveUntil: "2026-06-30",
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

export function getActiveBaseSalary(at: Date = new Date()): number {
  return at >= JULY_2026_EFFECTIVE_AT
    ? SALARY_TAX_RULES_2026.baseSalary
    : SALARY_TAX_RULES_2026.previousBaseSalary;
}

export function getActiveBaseSalaryEffectiveFrom(at: Date = new Date()): string {
  return at >= JULY_2026_EFFECTIVE_AT
    ? SALARY_TAX_RULES_2026.baseSalaryEffectiveFrom
    : SALARY_TAX_RULES_2026.previousBaseSalaryEffectiveFrom;
}

export function getBhxhBhytCap(
  at: Date = new Date(),
  baseSalary: number = getActiveBaseSalary(at),
) {
  return baseSalary * 20;
}

/** Trần BHXH/BHYT từ 01/7/2026 (2,53M × 20 = 50,6M). */
export function getUpcomingBhxhBhytCap() {
  return getBhxhBhytCap(JULY_2026_EFFECTIVE_AT, SALARY_TAX_RULES_2026.baseSalary);
}

export function getBhtnCapByRegion(region: SalaryRegion) {
  return SALARY_TAX_RULES_2026.regionalMinimumWages[region] * 20;
}
