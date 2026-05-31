"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { paginateItems } from "@/lib/pagination/paginate";

export function useClientPagination<T>(items: T[], pageSize: number) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize) || 1);
  const activePage = Math.min(page, totalPages);

  const result = useMemo(
    () => paginateItems(items, activePage, pageSize),
    [items, activePage, pageSize],
  );

  const prevPage = useRef(activePage);
  useEffect(() => {
    if (prevPage.current !== activePage) {
      prevPage.current = activePage;
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [activePage]);

  return {
    ...result,
    page: activePage,
    setPage,
  };
}
