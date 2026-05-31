"use client";

import { useEffect, useMemo, useState } from "react";
import { paginateItems } from "@/lib/pagination/paginate";

export function useClientPagination<T>(
  items: T[],
  pageSize: number,
  resetKey = "",
) {
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [items.length, resetKey, pageSize]);

  const result = useMemo(
    () => paginateItems(items, page, pageSize),
    [items, page, pageSize],
  );

  useEffect(() => {
    if (page > result.totalPages) {
      setPage(result.totalPages);
    }
  }, [page, result.totalPages]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  return {
    ...result,
    setPage,
  };
}
