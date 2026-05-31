import { ok, parseJsonBody, withApiHandler } from "@/lib/api/response";
import { getServerDeps } from "@/lib/server/deps";
import { socialInsuranceContributionSchema } from "@/lib/validators/calculator.schema";

export const runtime = "nodejs";

export const POST = withApiHandler(async (req: Request) => {
  const serverDeps = getServerDeps();
  const raw = (await parseJsonBody<Record<string, unknown>>(req)) ?? {};
  const body = socialInsuranceContributionSchema.parse(raw);

  const result = serverDeps.calculatorService.computeSocialInsuranceContribution(
    body.salaryBase,
  );

  return ok({
    result,
    relatedLegalHint:
      "Tham chiếu Luật Bảo hiểm xã hội và các văn bản hướng dẫn hiện hành (HR/C&B cập nhật).",
  });
});
