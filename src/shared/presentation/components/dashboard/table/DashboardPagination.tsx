"use client";

import type React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/shared/presentation/components/ui/button";
import { cn } from "@/shared/application/lib/cn";

interface DashboardPaginationProps {
  pages: number[];
  currentPage: number;
  onPageChange?: (page: number) => void;
  previousLabel: string;
  nextLabel: string;
  className?: string;
}

export function DashboardPagination({
  pages,
  currentPage,
  onPageChange,
  previousLabel,
  nextLabel,
  className,
}: DashboardPaginationProps) {
  const firstPage = pages[0];
  const lastPage = pages.at(-1);
  const isPreviousDisabled = !firstPage || currentPage <= firstPage;
  const isNextDisabled = !lastPage || currentPage >= lastPage;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="rounded-xl border-slate-200"
        aria-label={previousLabel}
        disabled={isPreviousDisabled}
        onClick={() => firstPage && onPageChange?.(Math.max(firstPage, currentPage - 1))}
      >
        <ChevronRight className="h-4 w-4" aria-hidden />
      </Button>
      {pages.map((page) => (
        <Button
          key={page}
          type="button"
          variant={page === currentPage ? "default" : "outline"}
          className={cn(
            "h-12 w-12 rounded-xl border-slate-200 text-base",
            page === currentPage
              ? "bg-[#2C4260] text-white hover:bg-[#243751]"
              : "text-slate-600"
          )}
          onClick={() => onPageChange?.(page)}
        >
          {page}
        </Button>
      ))}
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="rounded-xl border-slate-200"
        aria-label={nextLabel}
        disabled={isNextDisabled}
        onClick={() => lastPage && onPageChange?.(Math.min(lastPage, currentPage + 1))}
      >
        <ChevronLeft className="h-4 w-4" aria-hidden />
      </Button>
    </div>
  );
}
