/**
 * Chính sách nội bộ FPT Telecom.
 */
export type FtelMaternitySupportLevel = {
  level: 2 | 3 | 4;
  amountVnd: number;
  year: number;
};

export const FTEL_MATERNITY_SUPPORT_2025: FtelMaternitySupportLevel[] = [
  { level: 2, amountVnd: 5_000_000, year: 2025 },
  { level: 3, amountVnd: 15_000_000, year: 2025 },
  { level: 4, amountVnd: 40_000_000, year: 2025 },
];

export const FTEL_MATERNITY_FORMULA = {
  decisionNumber: "1069/QĐ-FTEL",
  effectiveFrom: "2023-10-01",
  companyAllowanceFormula:
    "Trợ cấp Công ty = [(75% × Lương TB × 6 − Trợ cấp BHXH) / Số ngày nghỉ theo chế độ] × Số ngày nghỉ thực tế",
  totalBenefitFormula:
    "Mức hưởng = Trợ cấp BHXH + Trợ cấp bổ sung Công ty + Hỗ trợ sinh con Công ty (nếu có)",
  ctlCapVnd: 15_000_000,
  foxproPath: "Chức năng → Quy định và chính sách → Bảo hiểm xã hội",
} as const;

export const POPULATION_LAW_2026_BRIEF = {
  lawNumber: "113/2025/QH15",
  decreeNumber: "168/2026/NĐ-CP",
  effectiveFrom: "2026-07-01",
  femaleLeaveMonths: 7,
  maleLeaveWorkingDays: 10,
  screeningSupportFrom: "2027-01-01",
  screeningMaxVnd: 900_000,
  screeningConditions: [
    "Down",
    "Edwards",
    "Patau",
    "Thalassemia (tan máu bẩm sinh)",
  ],
} as const;

export const BASE_SALARY_INCREASE_2026 = {
  effectiveFrom: "2026-07-01",
  amountVnd: 2_530_000,
  bhxhCapVnd: 50_600_000,
  legalReference: "Khoản 13 Điều 141 Luật Bảo hiểm xã hội",
} as const;
