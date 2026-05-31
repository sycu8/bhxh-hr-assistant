"use client";

import type { SearchHitDto } from "@/lib/types/answer-card";
import { SearchHits } from "@/components/portal/search-hits";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { useClientPagination } from "@/hooks/use-client-pagination";
import { DEFAULT_PAGE_SIZE } from "@/lib/pagination/constants";

export function SearchHitsPaginated({ hits }: { hits: SearchHitDto[] }) {
  const { items, page, totalPages, totalItems, setPage } = useClientPagination(
    hits,
    DEFAULT_PAGE_SIZE,
  );

  if (hits.length === 0) {
    return <SearchHits hits={[]} />;
  }

  return (
    <div className="space-y-3">
      <SearchHits hits={items} totalCount={totalItems} />
      <PaginationControls
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={DEFAULT_PAGE_SIZE}
        onPageChange={setPage}
      />
    </div>
  );
}
