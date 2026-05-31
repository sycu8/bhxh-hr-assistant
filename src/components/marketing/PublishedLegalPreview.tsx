import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CtaTextLink } from "@/components/ui/cta-link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PublishedLegalUpdateRow } from "@/lib/db/crawl-queries";
import { LEGAL_UPDATES } from "@/lib/data/legal-updates";
import { impactLevelVi } from "@/lib/copy/legal-labels";

export function PublishedLegalPreview({
  published,
}: {
  published: PublishedLegalUpdateRow[];
}) {
  const rows =
    published.length > 0
      ? published.slice(0, 5).map((u) => ({
          id: u.id,
          title: u.title,
          summary: u.summary,
          href: `/legal-updates/${u.slug}`,
          source: u.sourceName,
          dateLabel: u.publishedAt
            ? new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" }).format(u.publishedAt)
            : u.effectiveDate
              ? new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" }).format(u.effectiveDate)
              : null,
          impact: u.impactLevel,
          hr: u.hrActionRequired,
        }))
      : LEGAL_UPDATES.slice(0, 5).map((u) => ({
          id: u.id,
          title: u.title,
          summary: u.summary,
          href: u.documentUrl ?? "/nguon-phap-luat",
          source: u.sourceHint,
          dateLabel: u.date,
          impact: null as string | null,
          hr: false,
        }));

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Cập nhật pháp luật gần đây
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Các nội dung đã được HR/Admin duyệt từ nguồn chính thống (hoặc bản minh họa khi chưa có dữ liệu
            publish).
          </p>
        </div>
        <CtaTextLink href="/legal-updates">Xem tất cả cập nhật</CtaTextLink>
      </div>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {rows.map((u) => (
          <Card key={u.id} className="flex flex-col border-border/80 shadow-sm transition-colors hover:border-sky-200">
            <CardHeader className="pb-2">
              <div className="flex flex-wrap gap-2">
                {u.impact ? <Badge variant="secondary">{impactLevelVi(u.impact)}</Badge> : null}
                {u.hr ? (
                  <Badge variant="outline">
                    <AlertTriangle className="mr-1 h-3 w-3" />
                    HR/C&B cần xử lý
                  </Badge>
                ) : null}
              </div>
              <CardTitle className="text-base leading-snug">{u.title}</CardTitle>
              <p className="text-xs text-muted-foreground">
                {u.source}
                {u.dateLabel ? ` · ${u.dateLabel}` : ""}
              </p>
            </CardHeader>
            <CardContent className="mt-auto flex flex-1 flex-col pt-0">
              <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                {u.summary ?? "—"}
              </p>
              <Button asChild variant="ctaSecondary" size="touch" className="mt-4 w-full">
                <Link href={u.href}>
                  Đọc bài viết
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
