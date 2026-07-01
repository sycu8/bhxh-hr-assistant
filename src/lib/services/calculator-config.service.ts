import type { CalculatorConfigStatus } from "@prisma/client";
import { getDb } from "@/lib/db/prisma";
import { isDatabaseConfigured } from "@/lib/db/database-configured";
import {
  DEFAULT_SOCIAL_INSURANCE_RATES,
  readRatesFromEnv,
  type SocialInsuranceRates,
} from "@/lib/services/calculator.service";
import {
  getActiveBaseSalary,
  getActiveBaseSalaryEffectiveFrom,
} from "@/lib/services/salary-tax-rules";

export type CalculatorFormulaJson = {
  baseSalary?: number;
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

export type SalaryTaxContext = {
  rates: SocialInsuranceRates;
  baseSalary: number;
  baseSalaryEffectiveFrom: string;
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
  if (!isDatabaseConfigured()) return null;
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
  const ctx = await resolveSalaryTaxContext();
  return ctx.rates;
}

export async function resolveSalaryTaxContext(
  at: Date = new Date(),
): Promise<SalaryTaxContext> {
  let baseSalary = getActiveBaseSalary(at);
  let baseSalaryEffectiveFrom = getActiveBaseSalaryEffectiveFrom(at);
  let rates = readRatesFromEnv();

  try {
    const cfg = await getActiveCalculatorConfig("salary-tax-2026", at);
    const formula = cfg?.formulaJson;
    if (formula?.baseSalary != null) {
      baseSalary = formula.baseSalary;
      baseSalaryEffectiveFrom = cfg!.effectiveFrom.toISOString().slice(0, 10);
    }
    const er = formula?.employeeRates;
    if (er) {
      rates = {
        employeeBhxh: er.bhxh ?? DEFAULT_SOCIAL_INSURANCE_RATES.employeeBhxh,
        employeeBhyt: er.bhyt ?? DEFAULT_SOCIAL_INSURANCE_RATES.employeeBhyt,
        employeeBhtn: er.bhtn ?? DEFAULT_SOCIAL_INSURANCE_RATES.employeeBhtn,
      };
    }
  } catch {
    // fallback to code defaults
  }

  return { rates, baseSalary, baseSalaryEffectiveFrom };
}
