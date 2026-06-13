import { ok, parseJsonBody, withApiHandler } from "@/lib/api/response";
import { getServerDeps } from "@/lib/server/deps";
import { searchBodySchema } from "@/lib/validators/search.schema";
import { getEdgeFeatureFlags } from "@/lib/cloudflare/edge-feature-flags";
import { logSearchQuery } from "@/lib/services/search-analytics.service";
import {
  assertTurnstileVerified,
  readTurnstileTokenFromBody,
} from "@/lib/security/turnstile";
import type { AnswerCardDto, SearchResponseDto } from "@/lib/types/answer-card";

export const runtime = "nodejs";

const degradedAnswer: AnswerCardDto = {
  shortAnswer:
    "Hệ thống tra cứu đang giảm tải tạm thời. Bạn vui lòng thử lại sau ít phút, hoặc gửi câu hỏi cho HR/C&B qua trang Hỏi HR.",
  detailedAnswer: "",
  citations: [],
  confidenceLevel: "LOW",
  needsHrReview: true,
  warnings: [
    "Đây là thông báo vận hành tạm thời (D1: search_degraded), không phải kết quả tra cứu từ kho đã duyệt.",
  ],
  suggestedFollowUpQuestions: [],
};

export const POST = withApiHandler(async (req: Request) => {
  const { searchDegraded } = await getEdgeFeatureFlags();
  const serverDeps = getServerDeps();
  const raw = (await parseJsonBody<Record<string, unknown>>(req)) ?? {};
  await assertTurnstileVerified(req, readTurnstileTokenFromBody(raw));
  const body = searchBodySchema.parse(raw);

  if (searchDegraded) {
    const payload: SearchResponseDto = {
      query: body.query.trim(),
      hits: [],
      answer: degradedAnswer,
    };
    return ok(payload);
  }

  const data = await serverDeps.searchService.search({
    query: body.query,
    employeeGroup: body.employeeGroup,
    categorySlug: body.categorySlug,
    hitLimit: body.hitLimit,
  });

  try {
    await logSearchQuery({
      question: data.query,
      answer: data.answer.shortAnswer,
      confidenceLevel: data.answer.confidenceLevel,
      needsHrReview: data.answer.needsHrReview,
      resultCount: data.hits.length,
      hasAnswer: Boolean(data.answer.shortAnswer?.trim()),
      categorySlug: body.categorySlug,
    });
  } catch (error) {
    console.error("[search/log]", error);
  }

  return ok(data);
});
