"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { AlertTriangle, ExternalLink, Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { affectedGroupVi, impactLevelVi } from "@/lib/copy/legal-labels";
import type { LegalUpdateListFilters } from "@/lib/legal-updates/filter-list";
import type { LegalUpdateListItemDto } from "@/lib/legal-updates/types";
export type { LegalUpdateListItemDto };

function formatDate(iso: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" }).format(d);
}

type Props = {
  items: LegalUpdateListItemDto[];
  page: number;
  totalPages: number;
  totalItems: number;
  totalUnfiltered: number;
  pageSize: number;
  filters: LegalUpdateListFilters;
};

function buildLegalUpdatesHref(
  filters: LegalUpdateListFilters,
  page: number,
): string {
  const params = new URLSearchParams();
  if (filters.q?.trim()) params.set("q", filters.q.trim());
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/legal-updates?${qs}` : "/legal-updates";
}

export function LegalUpdatesList({
  items,
  page,
  totalPages,
  totalItems,
  totalUnfiltered,
  pageSize,
  filters,
}: Props) {
  const router = useRouter();
  const [query, setQuery] = useState(filters.q ?? "");
  const [issuedFrom, setIssuedFrom] = useState(filters.from ?? "");
  const [issuedTo, setIssuedTo] = useState(filters.to ?? "");

  const hasFilters = Boolean(
    filters.q?.trim() || filters.from || filters.to,
  );

  const applyFilters = useCallback(
    (next: LegalUpdateListFilters) => {
      router.push(buildLegalUpdatesHref(next, 1));
    },
    [router],
  );

  const runSearch = () => {
    applyFilters({ q: query.trim(), from: issuedFrom, to: issuedTo });
  };

  const clearFilters = () => {
    setQuery("");
    setIssuedFrom("");
    setIssuedTo("");
    router.push("/legal-updates");
  };

  const buildPageHref = (targetPage: number) =>
    buildLegalUpdatesHref(filters, targetPage);

  return (
    <div className="space-y-4">
      <Card className="border-sky-100 bg-sky-50/30 shadow-sm">
        <CardContent className="space-y-4 pt-6">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    runSearch();
                  }
                }}
                placeholder="Tìm theo tiêu đề, số hiệu, tóm tắt…"
                className="h-11 rounded-xl pl-9"
                aria-label="Tìm văn bản"
              />
            </div>
            <Button
              type="button"
              variant="cta"
              size="touch"
              className="w-full shrink-0 sm:w-auto"
              onClick={runSearch}
            >
              <Search className="mr-2 h-4 w-4" />
              Tìm kiếm
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
            <div className="space-y-1.5">
              <label htmlFor="issued-from" className="text-sm font-medium">
                Ban hành từ ngày
              </label>
              <Input
                id="issued-from"
                type="date"
                value={issuedFrom}
                onChange={(e) => setIssuedFrom(e.target.value)}
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="issued-to" className="text-sm font-medium">
                Đến ngày
              </label>
              <Input
                id="issued-to"
                type="date"
                value={issuedTo}
                onChange={(e) => setIssuedTo(e.target.value)}
                className="h-11 rounded-xl"
              />
            </div>
            <Button
              type="button"
              variant="ctaSecondary"
              size="touch"
              className="w-full sm:w-auto"
              onClick={() =>
                applyFilters({ q: query.trim(), from: issuedFrom, to: issuedTo })
              }
            >
              Áp dụng lọc ngày
            </Button>
            {hasFilters ? (
              <Button
                type="button"
                variant="outline"
                size="touch"
                className="w-full lg:col-span-1"
                onClick={clearFilters}
              >
                <X className="mr-2 h-4 w-4" />
                Xóa lọc
              </Button>
            ) : null}
          </div>

          <p className="text-sm text-muted-foreground">
            Sắp xếp theo <span className="font-medium text-foreground">ngày ban hành</span>{" "}
            (mới nhất trước). Tìm thấy{" "}
            <span className="font-medium text-foreground">{totalItems}</span> /{" "}
            {totalUnfiltered} văn bản
            {hasFilters ? " (đã lọc)" : ""} · {pageSize} mục/trang.
          </p>
        </CardContent>
      </Card>

      {totalItems === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Không có văn bản phù hợp. Thử đổi từ khóa hoặc khoảng ngày ban hành.
          </CardContent>
        </Card>
      ) : (
        <>
          {page > 1 ? (
            <PaginationControls
              page={page}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={pageSize}
              buildHref={buildPageHref}
              className="mb-1"
            />
          ) : null}

          {items.map((update) => {
            const issuedLabel = formatDate(update.issuedDateIso);
            const effectiveLabel = formatDate(update.effectiveDateIso);
            const showEffective =
              effectiveLabel && effectiveLabel !== issuedLabel;

            return (
              <Card key={update.id} className="overflow-hidden border-sky-100 shadow-sm">
                <CardHeader>
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2">
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
                      <CardTitle className="text-lg leading-snug">
                        <Link
                          href={`/legal-updates/${update.slug}`}
                          className="text-foreground underline-offset-4 hover:underline"
                        >
                          {update.title}
                        </Link>
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {update.sourceName}
                        {update.documentNumber ? ` · ${update.documentNumber}` : ""}
                        {issuedLabel ? ` · Ban hành ${issuedLabel}` : ""}
                        {showEffective ? ` · Hiệu lực ${effectiveLabel}` : ""}
                      </p>
                    </div>
                    <Link
                      href={update.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm font-medium text-accent underline-offset-4 hover:underline"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Văn bản gốc
                    </Link>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {update.summary ?? "Chưa có tóm tắt."}
                  </p>
                  {update.hrActionSummary ? (
                    <p className="rounded-xl border border-amber-200/80 bg-amber-50/80 px-3 py-2 text-sm text-amber-950">
                      {update.hrActionSummary}
                    </p>
                  ) : null}
                  <div className="flex flex-wrap gap-2">
                    {update.affectedGroups.map((group) => (
                      <Badge key={group} variant="outline">
                        {affectedGroupVi(group)}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}

          <PaginationControls
            page={page}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            buildHref={buildPageHref}
          />
        </>
      )}
    </div>
  );
}
