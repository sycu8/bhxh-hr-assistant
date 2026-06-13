import {
  getBhxhBhytCap,
  getBhtnCapByRegion,
  SALARY_TAX_RULES_2026,
  type SalaryRegion,
} from "@/lib/services/salary-tax-rules";

export type SocialInsuranceRates = {
  employeeBhxh: number;
  employeeBhyt: number;
  employeeBhtn: number;
};

export type SalaryTaxMode =
  | "social-insurance"
  | "gross-to-net"
  | "net-to-gross"
  | "take-home";

export type SalaryTaxInput = {
  mode: SalaryTaxMode;
  grossSalary?: number;
  targetNetSalary?: number;
  insuranceSalaryBase: number;
  region: SalaryRegion;
  dependentCount: number;
};

export type SocialInsuranceContributionResult = {
  salaryBase: number;
  rates: SocialInsuranceRates;
  employee: {
    bhxh: number;
    bhyt: number;
    bhtn: number;
    total: number;
  };
  formulaExplanation: string;
  disclaimer: string;
};

export type SalaryTaxResult = {
  mode: SalaryTaxMode;
  summary: {
    grossSalary: number;
    insuranceSalaryBase: number;
    netSalary: number;
    totalEmployeeInsurance: number;
    personalIncomeTax: number;
    totalDeductions: number;
    taxableIncome: number;
  };
  breakdown: {
    insurance: {
      salaryBase: number;
      bhxhBase: number;
      bhytBase: number;
      bhtnBase: number;
      bhxh: number;
      bhyt: number;
      bhtn: number;
      total: number;
      bhxhBhytCap: number;
      bhtnCap: number;
      rates: SocialInsuranceRates;
    };
    personalDeduction: number;
    dependentDeductionPerPerson: number;
    dependentCount: number;
    familyDeduction: number;
    taxableIncome: number;
    personalIncomeTax: number;
    taxBrackets: Array<{
      label: string;
      taxableAmount: number;
      rate: number;
      tax: number;
    }>;
  };
  legalBasis: {
    taxYear: number;
    personalDeductionEffectiveFrom: string;
    salaryIncomeTaxEffectiveFrom: string;
    regionalMinimumWageEffectiveFrom: string;
    baseSalaryEffectiveFrom: string;
  };
  note: string;
};

export const DEFAULT_SOCIAL_INSURANCE_RATES: SocialInsuranceRates = {
  employeeBhxh: SALARY_TAX_RULES_2026.employeeRates.bhxh,
  employeeBhyt: SALARY_TAX_RULES_2026.employeeRates.bhyt,
  employeeBhtn: SALARY_TAX_RULES_2026.employeeRates.bhtn,
};

function roundVnd(value: number) {
  return Math.round(value);
}

export function readRatesFromEnv(): SocialInsuranceRates {
  const num = (value: string | undefined, fallback: number) => {
    const parsed = value != null && value !== "" ? Number(value) : Number.NaN;
    return Number.isFinite(parsed) && parsed >= 0 && parsed <= 1
      ? parsed
      : fallback;
  };

  return {
    employeeBhxh: num(
      process.env.BHXH_EMPLOYEE_RATE,
      DEFAULT_SOCIAL_INSURANCE_RATES.employeeBhxh,
    ),
    employeeBhyt: num(
      process.env.BHYT_EMPLOYEE_RATE,
      DEFAULT_SOCIAL_INSURANCE_RATES.employeeBhyt,
    ),
    employeeBhtn: num(
      process.env.BHTN_EMPLOYEE_RATE,
      DEFAULT_SOCIAL_INSURANCE_RATES.employeeBhtn,
    ),
  };
}

export function computeSocialInsuranceContribution(
  salaryBase: number,
  rates: SocialInsuranceRates = DEFAULT_SOCIAL_INSURANCE_RATES,
): SocialInsuranceContributionResult {
  const bhxh = Math.round(salaryBase * rates.employeeBhxh);
  const bhyt = Math.round(salaryBase * rates.employeeBhyt);
  const bhtn = Math.round(salaryBase * rates.employeeBhtn);
  const total = bhxh + bhyt + bhtn;

  const formulaExplanation =
    `BHXH = lương đóng bảo hiểm × ${rates.employeeBhxh}; ` +
    `BHYT = lương đóng bảo hiểm × ${rates.employeeBhyt}; ` +
    `BHTN = lương đóng bảo hiểm × ${rates.employeeBhtn}. ` +
    "Tỷ lệ có thể thay đổi theo quy định hiện hành và thỏa thuận lao động.";

  const disclaimer =
    "Kết quả chỉ mang tính minh họa theo tỷ lệ cấu hình. Trần/mức lương đóng bảo hiểm, phụ cấp, " +
    "và tỷ lệ cụ thể phải được HR/C&B xác nhận theo hồ sơ thực tế và văn bản pháp luật hiện hành.";

  return {
    salaryBase,
    rates: { ...rates },
    employee: { bhxh, bhyt, bhtn, total },
    formulaExplanation,
    disclaimer,
  };
}

function buildInsuranceBreakdown(
  insuranceSalaryBase: number,
  region: SalaryRegion,
  rates: SocialInsuranceRates = DEFAULT_SOCIAL_INSURANCE_RATES,
) {
  const bhxhBhytCap = getBhxhBhytCap();
  const bhtnCap = getBhtnCapByRegion(region);
  const bhxhBase = Math.min(insuranceSalaryBase, bhxhBhytCap);
  const bhytBase = Math.min(insuranceSalaryBase, bhxhBhytCap);
  const bhtnBase = Math.min(insuranceSalaryBase, bhtnCap);
  const bhxh = roundVnd(bhxhBase * rates.employeeBhxh);
  const bhyt = roundVnd(bhytBase * rates.employeeBhyt);
  const bhtn = roundVnd(bhtnBase * rates.employeeBhtn);

  return {
    salaryBase: roundVnd(insuranceSalaryBase),
    bhxhBase,
    bhytBase,
    bhtnBase,
    bhxh,
    bhyt,
    bhtn,
    total: bhxh + bhyt + bhtn,
    bhxhBhytCap,
    bhtnCap,
    rates,
  };
}

function buildFamilyDeduction(dependentCount: number) {
  return {
    personalDeduction: SALARY_TAX_RULES_2026.personalDeduction,
    dependentDeductionPerPerson: SALARY_TAX_RULES_2026.dependentDeduction,
    dependentCount,
    familyDeduction:
      SALARY_TAX_RULES_2026.personalDeduction +
      dependentCount * SALARY_TAX_RULES_2026.dependentDeduction,
  };
}

function computeProgressiveTax(taxableIncome: number) {
  if (taxableIncome <= 0) {
    return {
      total: 0,
      taxBrackets: [] as SalaryTaxResult["breakdown"]["taxBrackets"],
    };
  }

  let remaining = taxableIncome;
  let previousCap = 0;
  const taxBrackets: SalaryTaxResult["breakdown"]["taxBrackets"] = [];

  for (const bracket of SALARY_TAX_RULES_2026.monthlyTaxBrackets) {
    const upperBound = bracket.upTo;
    const sliceLimit = Number.isFinite(upperBound)
      ? upperBound - previousCap
      : remaining;
    const slice = Math.min(remaining, sliceLimit);

    if (slice > 0) {
      taxBrackets.push({
        label: Number.isFinite(upperBound)
          ? `Đến ${upperBound.toLocaleString("vi-VN")} VND`
          : "Phần thu nhập còn lại",
        taxableAmount: roundVnd(slice),
        rate: bracket.rate,
        tax: roundVnd(slice * bracket.rate),
      });
      remaining -= slice;
    }

    previousCap = upperBound;

    if (remaining <= 0) {
      break;
    }
  }

  return {
    total: taxBrackets.reduce((sum, item) => sum + item.tax, 0),
    taxBrackets,
  };
}

function buildLegalBasis() {
  return {
    taxYear: SALARY_TAX_RULES_2026.taxYear,
    personalDeductionEffectiveFrom:
      SALARY_TAX_RULES_2026.personalDeductionEffectiveFrom,
    salaryIncomeTaxEffectiveFrom:
      SALARY_TAX_RULES_2026.salaryIncomeTaxEffectiveFrom,
    regionalMinimumWageEffectiveFrom:
      SALARY_TAX_RULES_2026.regionalMinimumWageEffectiveFrom,
    baseSalaryEffectiveFrom: SALARY_TAX_RULES_2026.baseSalaryEffectiveFrom,
  };
}

function buildForwardSalaryResult(
  mode: SalaryTaxMode,
  grossSalary: number,
  insuranceSalaryBase: number,
  region: SalaryRegion,
  dependentCount: number,
  rates: SocialInsuranceRates = DEFAULT_SOCIAL_INSURANCE_RATES,
): SalaryTaxResult {
  const insurance = buildInsuranceBreakdown(insuranceSalaryBase, region, rates);
  const family = buildFamilyDeduction(dependentCount);
  const taxableIncome = Math.max(
    0,
    grossSalary - insurance.total - family.familyDeduction,
  );
  const tax = computeProgressiveTax(taxableIncome);
  const personalIncomeTax = tax.total;
  const totalDeductions = insurance.total + personalIncomeTax;
  const netSalary = roundVnd(grossSalary - totalDeductions);

  return {
    mode,
    summary: {
      grossSalary: roundVnd(grossSalary),
      insuranceSalaryBase: roundVnd(insuranceSalaryBase),
      netSalary,
      totalEmployeeInsurance: insurance.total,
      personalIncomeTax,
      totalDeductions,
      taxableIncome: roundVnd(taxableIncome),
    },
    breakdown: {
      insurance,
      personalDeduction: family.personalDeduction,
      dependentDeductionPerPerson: family.dependentDeductionPerPerson,
      dependentCount: family.dependentCount,
      familyDeduction: family.familyDeduction,
      taxableIncome: roundVnd(taxableIncome),
      personalIncomeTax,
      taxBrackets: tax.taxBrackets,
    },
    legalBasis: buildLegalBasis(),
    note:
      "Công cụ ước tính thực nhận theo kỳ tính thuế năm 2026 và cần được HR/C&B đối chiếu trước khi áp dụng.",
  };
}

function buildSocialInsuranceModeResult(
  insuranceSalaryBase: number,
  region: SalaryRegion,
  rates: SocialInsuranceRates = DEFAULT_SOCIAL_INSURANCE_RATES,
): SalaryTaxResult {
  const insurance = buildInsuranceBreakdown(insuranceSalaryBase, region, rates);

  return {
    mode: "social-insurance",
    summary: {
      grossSalary: roundVnd(insuranceSalaryBase),
      insuranceSalaryBase: roundVnd(insuranceSalaryBase),
      netSalary: roundVnd(insuranceSalaryBase - insurance.total),
      totalEmployeeInsurance: insurance.total,
      personalIncomeTax: 0,
      totalDeductions: insurance.total,
      taxableIncome: 0,
    },
    breakdown: {
      insurance,
      personalDeduction: 0,
      dependentDeductionPerPerson: 0,
      dependentCount: 0,
      familyDeduction: 0,
      taxableIncome: 0,
      personalIncomeTax: 0,
      taxBrackets: [],
    },
    legalBasis: buildLegalBasis(),
    note:
      "Chế độ này chỉ tập trung vào các khoản BHXH, BHYT và BHTN phía người lao động.",
  };
}

function solveGrossFromNet(
  targetNetSalary: number,
  insuranceSalaryBase: number,
  region: SalaryRegion,
  dependentCount: number,
  rates: SocialInsuranceRates = DEFAULT_SOCIAL_INSURANCE_RATES,
): SalaryTaxResult {
  let low = 0;
  let high = Math.max(targetNetSalary, insuranceSalaryBase, 1) + 10_000_000;
  let highResult = buildForwardSalaryResult(
    "net-to-gross",
    high,
    insuranceSalaryBase,
    region,
    dependentCount,
    rates,
  );

  while (highResult.summary.netSalary < targetNetSalary && high < 5_000_000_000) {
    high *= 2;
    highResult = buildForwardSalaryResult(
      "net-to-gross",
      high,
      insuranceSalaryBase,
      region,
      dependentCount,
      rates,
    );
  }

  let bestResult = highResult;
  let bestDiff = Math.abs(highResult.summary.netSalary - targetNetSalary);

  for (let i = 0; i < 90 && low <= high; i++) {
    const mid = Math.round((low + high) / 2);
    const result = buildForwardSalaryResult(
      "net-to-gross",
      mid,
      insuranceSalaryBase,
      region,
      dependentCount,
      rates,
    );
    const diff = result.summary.netSalary - targetNetSalary;
    const absDiff = Math.abs(diff);

    if (absDiff < bestDiff) {
      bestDiff = absDiff;
      bestResult = result;
    }

    if (absDiff <= 1) {
      return result;
    }

    if (diff < 0) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return bestResult;
}

export class CalculatorService {
  private readonly rates: SocialInsuranceRates;

  constructor(rates?: SocialInsuranceRates) {
    this.rates = rates ?? readRatesFromEnv();
  }

  computeSocialInsuranceContribution(salaryBase: number) {
    return computeSocialInsuranceContribution(salaryBase, this.rates);
  }

  computeSalaryTax(input: SalaryTaxInput): SalaryTaxResult {
    switch (input.mode) {
      case "social-insurance":
        return buildSocialInsuranceModeResult(
          input.insuranceSalaryBase,
          input.region,
          this.rates,
        );
      case "net-to-gross":
        return solveGrossFromNet(
          input.targetNetSalary ?? 0,
          input.insuranceSalaryBase,
          input.region,
          input.dependentCount,
          this.rates,
        );
      case "gross-to-net":
      case "take-home":
        return buildForwardSalaryResult(
          input.mode,
          input.grossSalary ?? 0,
          input.insuranceSalaryBase,
          input.region,
          input.dependentCount,
          this.rates,
        );
      default: {
        const exhaustive: never = input.mode;
        throw new Error(`Unsupported calculator mode: ${exhaustive}`);
      }
    }
  }
}
