import { z } from "zod";

export const socialInsuranceContributionSchema = z.object({
  salaryBase: z.coerce
    .number()
    .positive("Mức lương đóng bảo hiểm phải lớn hơn 0.")
    .max(5_000_000_000, "Giá trị không hợp lệ."),
});

export type SocialInsuranceContributionInput = z.infer<
  typeof socialInsuranceContributionSchema
>;

const salaryRegionSchema = z.enum(["I", "II", "III", "IV"]);

const salaryCurrencySchema = z.coerce
  .number()
  .positive("Giá trị phải lớn hơn 0.")
  .max(5_000_000_000, "Giá trị không hợp lệ.");

const dependentCountSchema = z.coerce
  .number()
  .int("Số người phụ thuộc phải là số nguyên.")
  .min(0, "Số người phụ thuộc không được âm.")
  .max(20, "Số người phụ thuộc không hợp lệ.");

const salaryTaxBaseSchema = z.object({
  insuranceSalaryBase: salaryCurrencySchema,
  region: salaryRegionSchema,
  dependentCount: dependentCountSchema,
});

export const salaryTaxCalculatorSchema = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal("social-insurance"),
    insuranceSalaryBase: salaryCurrencySchema,
    region: salaryRegionSchema,
    dependentCount: dependentCountSchema.default(0),
  }),
  salaryTaxBaseSchema.extend({
    mode: z.literal("gross-to-net"),
    grossSalary: salaryCurrencySchema,
  }),
  salaryTaxBaseSchema.extend({
    mode: z.literal("take-home"),
    grossSalary: salaryCurrencySchema,
  }),
  salaryTaxBaseSchema.extend({
    mode: z.literal("net-to-gross"),
    targetNetSalary: salaryCurrencySchema,
  }),
]);

export type SalaryTaxCalculatorInput = z.infer<
  typeof salaryTaxCalculatorSchema
>;
