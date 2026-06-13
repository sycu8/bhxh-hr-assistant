import type { CalculatorConfigStatus } from "@prisma/client";
import { getDb } from "@/lib/db/prisma";
import {
  DEFAULT_SOCIAL_INSURANCE_RATES,
  readRatesFromEnv,
  type SocialInsuranceRates,
} from "@/lib/services/calculator.service";

export type CalculatorFormulaJson = {
  baseSalary?: number;
  upcomingBaseSalary?: number;
  bhxhCapMultiplier?: number;
  employeeRates?: {
    bhxh?: number;
    bhyt?: number;
    bhtn?: number;
  };
  taxBrackets?: Array<{ upTo: number | null; rate: number }>;
  personalDeduction?: number;
  dependentDeduction?: number;
};

export async function getActiveCalculatorConfig(
  key: string,
  at: Date = new Date(),
): Promise<{
  id: string;
  key: string;
  name: string;
  formulaJson: CalculatorFormulaJson;
  effectiveFrom: Date;
  effectiveTo: Date | null;
} | null> {
  const db = getDb();
  const row = await db.calculatorConfig.findFirst({
    where: {
      key,
      status: "ACTIVE" satisfies CalculatorConfigStatus,
      effectiveFrom: { lte: at },
      OR: [{ effectiveTo: null }, { effectiveTo: { gte: at } }],
    },
    orderBy: [{ effectiveFrom: "desc" }, { version: "desc" }],
  });
  if (!row) return null;
  return {
    id: row.id,
    key: row.key,
    name: row.name,
    formulaJson: row.formulaJson as CalculatorFormulaJson,
    effectiveFrom: row.effectiveFrom,
    effectiveTo: row.effectiveTo,
  };
}

export async function resolveSocialInsuranceRates(): Promise<SocialInsuranceRates> {
  try {
    const cfg = await getActiveCalculatorConfig("salary-tax-2026");
    const er = cfg?.formulaJson?.employeeRates;
    if (!er) return readRatesFromEnv();
    return {
      employeeBhxh: er.bhxh ?? DEFAULT_SOCIAL_INSURANCE_RATES.employeeBhxh,
      employeeBhyt: er.bhyt ?? DEFAULT_SOCIAL_INSURANCE_RATES.employeeBhyt,
      employeeBhtn: er.bhtn ?? DEFAULT_SOCIAL_INSURANCE_RATES.employeeBhtn,
    };
  } catch {
    return readRatesFromEnv();
  }
}
