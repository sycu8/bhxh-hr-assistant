import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmployeeJourney } from "@/components/portal/employee-journey";
import { getPublishedLegalUpdateDetailBySlug } from "@/lib/db/crawl-queries";
import { affectedGroupVi, impactLevelVi } from "@/lib/copy/legal-labels";
import { getLegalUpdateIssuanceDate } from "@/lib/legal-updates/list-utils";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const row = await getPublishedLegalUpdateDetailBySlug(slug);
  if (!row) return { title: "Không tìm thấy" };
  return {
    title: row.title,
    description: row.summary ?? "Cập nhật pháp luật bảo hiểm đã duyệt.",
  };
}

function formatDate(d: Date | null) {
  if (!d) return null;
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" }).format(d);
}

export default async function LegalUpdateDetailPage({ params }: Props) {
  const { slug } = await params;
  const update = await getPublishedLegalUpdateDetailBySlug(slug);
  if (!update) notFound();

  const issuedDate = getLegalUpdateIssuanceDate(update);
  const issuedLabel = formatDate(issuedDate);
  const effectiveLabel = formatDate(update.effectiveDate);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Link href="/legal-updates" className="font-medium text-accent hover:underline">
          ← Cập nhật pháp luật
        </Link>
      </div>

      <article className="space-y-6">
        <header className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Badge>{impactLevelVi(update.impactLevel)}</Badge>
              {update.legalDocumentType ? (
                <Badge variant="secondary">{update.legalDocumentType}</Badge>
              ) : null}
              {update.hrActionRequired ? (
                <Badge variant="outline">
                  <AlertTriangle className="mr-1 h-3 w-3" />
                  HR/C&amp;B cần xử lý
                </Badge>
              ) : null}
            </div>
            <h1 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
              {update.title}
            </h1>
            <p className="text-sm text-muted-foreground">
              {update.sourceName}
              {update.documentNumber ? ` · ${update.documentNumber}` : ""}
              {issuedLabel ? ` · Ban hành ${issuedLabel}` : ""}
              {effectiveLabel && effectiveLabel !== issuedLabel
                ? ` · Hiệu lực ${effectiveLabel}`
                : ""}
            </p>
            <Button variant="outline" size="sm" asChild className="w-fit rounded-xl">
              <Link href={update.sourceUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Mở văn bản gốc
              </Link>
            </Button>
          </div>
          <EmployeeJourney current="evidence" compact />
        </header>

        <Card className="border-sky-100 bg-sky-50/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-sky-950">Tóm tắt nhanh</CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed text-sky-950">
            {update.summary ?? "Chưa có tóm tắt riêng. Xem phần chi tiết bên dưới."}
          </CardContent>
        </Card>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Ai bị ảnh hưởng
          </h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {update.affectedGroups.length ? (
              update.affectedGroups.map((g) => (
                <Badge key={g} variant="secondary">
                  {affectedGroupVi(g)}
                </Badge>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Chưa gắn nhóm đối tượng.</p>
            )}
          </div>
        </section>

        {update.hrActionSummary ? (
          <section className="rounded-2xl border border-amber-200/90 bg-amber-50/90 p-4">
            <h2 className="text-sm font-semibold text-amber-950">HR/C&amp;B cần lưu ý</h2>
            <p className="mt-2 text-sm leading-relaxed text-amber-950/95">
              {update.hrActionSummary}
            </p>
          </section>
        ) : null}

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Nội dung chi tiết
          </h2>
          <div className="mt-3 whitespace-pre-wrap rounded-2xl border border-border/80 bg-card p-4 text-sm leading-relaxed text-foreground shadow-sm">
            {update.body}
          </div>
        </section>
      </article>
    </div>
  );
}
