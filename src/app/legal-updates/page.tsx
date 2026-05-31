import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { EmployeeJourney } from "@/components/portal/employee-journey";
import { LegalUpdatesList } from "@/components/legal-updates/LegalUpdatesList";
import { getPublishedLegalUpdates } from "@/lib/db/crawl-queries";
import { filterLegalUpdateItems } from "@/lib/legal-updates/filter-list";
import { getLegalUpdateIssuanceDate } from "@/lib/legal-updates/list-utils";
import type { LegalUpdateListItemDto } from "@/lib/legal-updates/types";
import { LEGAL_UPDATES_PAGE_SIZE } from "@/lib/pagination/constants";
import { paginateItems, parsePageParam } from "@/lib/pagination/paginate";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Cập nhật pháp luật bảo hiểm",
  description:
    "Các nội dung đã được HR/Admin duyệt từ nguồn chính thống để đối chiếu khi áp dụng.",
};

type Props = {
  searchParams?: Promise<{
    page?: string;
    q?: string;
    from?: string;
    to?: string;
  }>;
};

function toIso(d: Date | null): string | null {
  return d ? d.toISOString() : null;
}

function toListDto(
  updates: Awaited<ReturnType<typeof getPublishedLegalUpdates>>,
): LegalUpdateListItemDto[] {
  return updates.map((update) => {
    const issued = getLegalUpdateIssuanceDate(update);
    return {
      id: update.id,
      title: update.title,
      slug: update.slug,
      summary: update.summary,
      sourceUrl: update.sourceUrl,
      sourceName: update.sourceName,
      legalDocumentType: update.legalDocumentType,
      documentNumber: update.documentNumber,
      issuedDateIso: toIso(issued),
      effectiveDateIso: toIso(update.effectiveDate),
      impactLevel: update.impactLevel,
      affectedGroups: update.affectedGroups,
      hrActionRequired: update.hrActionRequired,
      hrActionSummary: update.hrActionSummary,
    };
  });
}

export default async function LegalUpdatesIndexPage({ searchParams }: Props) {
  const params = await searchParams;
  const filters = {
    q: params?.q?.trim() ?? "",
    from: params?.from ?? "",
    to: params?.to ?? "",
  };
  const page = parsePageParam(params?.page);

  const all = toListDto(await getPublishedLegalUpdates());
  const filtered = filterLegalUpdateItems(all, filters);
  const paginated = paginateItems(filtered, page, LEGAL_UPDATES_PAGE_SIZE);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="mb-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end">
        <div>
          <h1 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
            Kiểm tra nguồn pháp luật
          </h1>
          <p className="mt-2 max-w-prose text-pretty text-sm leading-relaxed text-muted-foreground">
            Các cập nhật đã được duyệt giúp bạn đối chiếu căn cứ, ngày ban hành,
            ngày hiệu lực và nhóm bị ảnh hưởng. Danh sách phân trang để tải nhanh
            trên điện thoại.
          </p>
        </div>
        <EmployeeJourney current="evidence" compact />
      </header>

      {all.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Chưa có cập nhật pháp luật nào được công bố. Hãy quay lại sau
            hoặc xem{" "}
            <Link href="/nguon-phap-luat" className="font-medium text-accent underline-offset-4 hover:underline">
              mục lục tham khảo
            </Link>
            .
          </CardContent>
        </Card>
      ) : (
        <LegalUpdatesList
          items={paginated.items}
          page={paginated.page}
          totalPages={paginated.totalPages}
          totalItems={paginated.totalItems}
          totalUnfiltered={all.length}
          pageSize={LEGAL_UPDATES_PAGE_SIZE}
          filters={filters}
        />
      )}
    </div>
  );
}
