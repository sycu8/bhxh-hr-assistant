"use client";

import type { ReactNode } from "react";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { useClientPagination } from "@/hooks/use-client-pagination";
import { FAQ_PAGE_SIZE } from "@/lib/pagination/constants";

type FaqListPaginatedProps<T> = {
  items: T[];
  pageSize?: number;
  getKey: (item: T) => string;
  renderItem: (item: T) => ReactNode;
  emptyMessage?: string;
};

function FaqListPaginatedView<T>({
  items,
  pageSize,
  getKey,
  renderItem,
  emptyMessage,
}: Required<Pick<FaqListPaginatedProps<T>, "pageSize">> &
  FaqListPaginatedProps<T>) {
  const { items: pageItems, page, totalPages, totalItems, setPage } =
    useClientPagination(items, pageSize);

  if (items.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">{emptyMessage}</p>
    );
  }

  return (
    <div className="space-y-4">
      {page > 1 ? (
        <PaginationControls
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setPage}
        />
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        {pageItems.map((item) => (
          <div key={getKey(item)}>{renderItem(item)}</div>
        ))}
      </div>

      <PaginationControls
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={setPage}
      />
    </div>
  );
}

export function FaqListPaginated<T>({
  items,
  pageSize = FAQ_PAGE_SIZE,
  getKey,
  renderItem,
  emptyMessage = "Chưa có mục nào.",
}: FaqListPaginatedProps<T>) {
  return (
    <FaqListPaginatedView
      key={`${items.length}|${pageSize}`}
      items={items}
      pageSize={pageSize}
      getKey={getKey}
      renderItem={renderItem}
      emptyMessage={emptyMessage}
    />
  );
}
