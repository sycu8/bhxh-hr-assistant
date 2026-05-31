import { ok, parseJsonBody, withApiHandler } from "@/lib/api/response";
import { getServerDeps } from "@/lib/server/deps";
import { searchBodySchema } from "@/lib/validators/search.schema";
import { getEdgeFeatureFlags } from "@/lib/cloudflare/edge-feature-flags";
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

  return ok(data);
});
