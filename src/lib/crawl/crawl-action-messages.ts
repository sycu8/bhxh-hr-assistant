import type { CrawlRunResult } from "@/lib/services/legal-crawler.service";

export function summarizeCrawlResult(
  result: CrawlRunResult,
  sourceName?: string,
): { message: string; variant: "success" | "error" } {
  const prefix = sourceName ? `Thu thập ${sourceName}` : "Thu thập";

  if (result.failed > 0 && result.created === 0 && result.discovered === 0) {
    return {
      message: `${prefix} thất bại. Vui lòng thử lại sau.`,
      variant: "error",
    };
  }

  const parts: string[] = [];
  if (result.created > 0) parts.push(`${result.created} mục mới`);
  if (result.duplicates > 0) parts.push(`${result.duplicates} trùng`);
  if (result.skippedIrrelevant > 0) {
    parts.push(`${result.skippedIrrelevant} không liên quan`);
  }
  if (result.failed > 0) parts.push(`${result.failed} lỗi`);

  if (parts.length === 0) {
    return {
      message: `${prefix} xong — không có nội dung mới phù hợp.`,
      variant: "success",
    };
  }

  return {
    message: `${prefix} xong: ${parts.join(", ")}.`,
    variant: result.failed > 0 && result.created === 0 ? "error" : "success",
  };
}

export function summarizeBatchCrawlResult(
  totals: CrawlRunResult,
  sourceCount: number,
): { message: string; variant: "success" | "error" } {
  const { message, variant } = summarizeCrawlResult(totals);
  const detail = message.replace(/^Thu thập xong[ —:]?\s*/, "");
  return {
    message: `Đã quét ${sourceCount} nguồn — ${detail}`,
    variant,
  };
}
