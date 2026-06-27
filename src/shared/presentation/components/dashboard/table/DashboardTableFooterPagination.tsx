"use client";

import { DashboardPagination } from "./DashboardPagination";

interface DashboardTableFooterPaginationProps {
  summary: string;
  pages: number[];
  currentPage: number;
  previousLabel: string;
  nextLabel: string;
  onPageChange: (page: number) => void;
}

export function DashboardTableFooterPagination({
  summary,
  pages,
  currentPage,
  previousLabel,
  nextLabel,
  onPageChange,
}: DashboardTableFooterPaginationProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <p className="text-right text-sm text-slate-400">{summary}</p>
      <DashboardPagination
        pages={pages}
        currentPage={currentPage}
        previousLabel={previousLabel}
        nextLabel={nextLabel}
        onPageChange={onPageChange}
      />
    </div>
  );
}
