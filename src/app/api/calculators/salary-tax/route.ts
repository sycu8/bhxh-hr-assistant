import { ok, parseJsonBody, withApiHandler } from "@/lib/api/response";
import { resolveSalaryTaxContext } from "@/lib/services/calculator-config.service";
import { CalculatorService } from "@/lib/services/calculator.service";
import { salaryTaxCalculatorSchema } from "@/lib/validators/calculator.schema";

export const runtime = "nodejs";

export const POST = withApiHandler(async (req: Request) => {
  const raw = (await parseJsonBody<Record<string, unknown>>(req)) ?? {};
  const body = salaryTaxCalculatorSchema.parse(raw);
  const ctx = await resolveSalaryTaxContext();
  const calculatorService = new CalculatorService(ctx);
  const result = calculatorService.computeSalaryTax(body);

  return ok({
    result,
    relatedLegalHint:
      "Áp dụng lương cơ sở 2,53 triệu đồng/tháng và trần BHXH/BHYT 50,6 triệu từ 01/7/2026; " +
      "giảm trừ gia cảnh và thuế TNCN kỳ tính thuế năm 2026 theo cấu hình hiện hành.",
  });
});
