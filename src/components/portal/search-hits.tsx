import Link from "next/link";
import type { SearchHitDto } from "@/lib/types/answer-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, HelpCircle } from "lucide-react";

export function SearchHits({
  hits,
  totalCount,
}: {
  hits: SearchHitDto[];
  /** Tổng kết quả (khi đang phân trang). */
  totalCount?: number;
}) {
  const displayTotal = totalCount ?? hits.length;
  if (hits.length === 0) {
    return (
      <Card className="border-dashed border-amber-200 bg-amber-50/60">
        <CardContent className="py-12 text-center">
          <p className="text-sm font-medium text-amber-950">
            Chưa có nguồn trùng khớp rõ ràng
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-amber-950/80">
            Thử rút ngắn câu hỏi, kiểm tra mục nguồn, hoặc chuyển sang HR/C&amp;B
            nếu tình huống cần áp dụng ngay.
          </p>
          <div className="mt-4 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild variant="ctaSecondary" size="touch" className="w-full sm:flex-1">
              <Link href="/nguon-phap-luat">Kiểm tra nguồn</Link>
            </Button>
            <Button asChild variant="cta" size="touch" className="w-full sm:flex-1">
              <Link href="/ask-hr">Hỏi HR</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            Kiểm tra nguồn
          </h3>
          <p className="text-sm text-muted-foreground">
            {displayTotal} kết quả liên quan để đối chiếu trước khi áp dụng.
          </p>
        </div>
        <Link
          href="/nguon-phap-luat"
          className="text-sm font-medium text-accent underline-offset-4 hover:underline"
        >
          Mở mục nguồn
        </Link>
      </div>

      <ul className="space-y-2">
        {hits.map((h) => (
          <li key={`${h.type}-${h.id}`}>
            <Card className="border-sky-100 transition-colors hover:bg-sky-50/50">
              <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:gap-4">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-900">
                  {h.type === "faq" ? (
                    <HelpCircle className="h-5 w-5" aria-hidden />
                  ) : (
                    <FileText className="h-5 w-5" aria-hidden />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-accent">
                      {h.type === "faq" ? "FAQ đã duyệt" : "Tài liệu"}
                    </span>
                    {h.categorySlug ? (
                      <span className="text-[10px] text-muted-foreground">
                        #{h.categorySlug}
                      </span>
                    ) : null}
                    <span className="ml-auto text-[10px] font-medium tabular-nums text-muted-foreground">
                      điểm khớp {h.score.toFixed(2)}
                    </span>
                  </div>
                  <h4 className="mt-1 line-clamp-2 text-sm font-semibold text-foreground">
                    {h.title}
                  </h4>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {h.snippet}
                  </p>
                </div>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </section>
  );
}
