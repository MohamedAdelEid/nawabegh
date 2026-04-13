"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { getSchools } from "@/modules/admin/infrastructure/api/schoolApi";

const DEFAULT_PAGE_SIZE = 10;

function buildPages(currentPage: number, totalPages: number): number[] {
  if (totalPages <= 0) return [1];

  const start = Math.max(1, currentPage - 1);
  const end = Math.min(totalPages, start + 2);
  const adjustedStart = Math.max(1, end - 2);

  return Array.from(
    { length: end - adjustedStart + 1 },
    (_, index) => adjustedStart + index,
  );
}

export function useSchoolsTable(keyword = "") {
  const locale = useLocale();
  const [pageNumber, setPageNumber] = useState(1);

  const query = useQuery({
    queryKey: ["admin-school-table", locale, keyword, pageNumber, DEFAULT_PAGE_SIZE],
    queryFn: () =>
      getSchools({
        keyword,
        pageNumber,
        pageSize: DEFAULT_PAGE_SIZE,
      }),
  });

  const page = query.data?.page ?? null;
  const totalPages = page?.totalPages ?? 1;

  useEffect(() => {
    if (page && pageNumber > totalPages) {
      setPageNumber(totalPages);
    }
  }, [page, pageNumber, totalPages]);

  const pages = useMemo(
    () => buildPages(page?.currentPage ?? pageNumber, totalPages),
    [page?.currentPage, pageNumber, totalPages],
  );

  return {
    ...query,
    page,
    pageNumber,
    pageSize: DEFAULT_PAGE_SIZE,
    setPageNumber,
    pages,
  };
}
