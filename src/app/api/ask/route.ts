import { ok, parseJsonBody, withApiHandler } from "@/lib/api/response";
import { getServerDeps } from "@/lib/server/deps";
import { askBodySchema } from "@/lib/validators/ask.schema";
import {
  assertTurnstileVerified,
  readTurnstileTokenFromBody,
} from "@/lib/security/turnstile";

export const runtime = "nodejs";

export const POST = withApiHandler(async (req: Request) => {
  const serverDeps = getServerDeps();
  const raw = (await parseJsonBody<Record<string, unknown>>(req)) ?? {};
  await assertTurnstileVerified(req, readTurnstileTokenFromBody(raw));
  const body = askBodySchema.parse(raw);

  const { card, prismaConfidence } = await serverDeps.aiAnswerService.ask({
    question: body.question,
    employeeGroup: body.employeeGroup,
    categorySlug: body.categorySlug,
  });

  await serverDeps.questionLogRepo.create({
    question: body.question,
    normalizedQuestion: body.question.toLowerCase().replace(/\s+/g, " "),
    answer: card.shortAnswer,
    confidenceLevel: prismaConfidence,
    needsHrReview: card.needsHrReview,
  });

  return ok({ answer: card });
});
