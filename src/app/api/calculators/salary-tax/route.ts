import { ok, parseJsonBody, withApiHandler } from "@/lib/api/response";
import { resolveSocialInsuranceRates } from "@/lib/services/calculator-config.service";
import { CalculatorService } from "@/lib/services/calculator.service";
import { salaryTaxCalculatorSchema } from "@/lib/validators/calculator.schema";

export const runtime = "nodejs";

export const POST = withApiHandler(async (req: Request) => {
  const raw = (await parseJsonBody<Record<string, unknown>>(req)) ?? {};
  const body = salaryTaxCalculatorSchema.parse(raw);
  const rates = await resolveSocialInsuranceRates();
  const calculatorService = new CalculatorService(rates);
  const result = calculatorService.computeSalaryTax(body);

  return ok({
    result,
    relatedLegalHint:
      "Áp dụng logic lương, bảo hiểm, giảm trừ gia cảnh và thuế TNCN cho kỳ tính thuế năm 2026 theo cấu hình hiện hành.",
  });
});
