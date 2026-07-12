"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { buildDashboardPaginationItems } from "@/shared/application/lib/buildDashboardPaginationItems";
import { cn } from "@/shared/application/lib/cn";
import { useDirection } from "@/shared/application/hooks/useDirection";
import { Button } from "@/shared/presentation/components/ui/button";

interface DashboardPaginationProps {
  /** @deprecated Prefer `totalPages`. Kept for backward compatibility. */
  pages?: number[];
  totalPages?: number;
  currentPage: number;
  onPageChange?: (page: number) => void;
  previousLabel: string;
  nextLabel: string;
  className?: string;
}

export function DashboardPagination({
  pages,
  totalPages,
  currentPage,
  onPageChange,
  previousLabel,
  nextLabel,
  className,
}: DashboardPaginationProps) {
  const { isRtl } = useDirection();
  const resolvedTotalPages = totalPages ?? pages?.at(-1) ?? 1;
  const paginationItems = buildDashboardPaginationItems(currentPage, resolvedTotalPages);
  const isPreviousDisabled = currentPage <= 1;
  const isNextDisabled = currentPage >= resolvedTotalPages;

  // "Previous" points toward the inline-start edge: right in RTL, left in LTR.
  const PreviousIcon = isRtl ? ChevronRight : ChevronLeft;
  const NextIcon = isRtl ? ChevronLeft : ChevronRight;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="rounded-xl border-slate-200"
        aria-label={previousLabel}
        disabled={isPreviousDisabled}
        onClick={() => onPageChange?.(Math.max(1, currentPage - 1))}
      >
        <PreviousIcon className="h-4 w-4" aria-hidden />
      </Button>
      {paginationItems.map((item, index) =>
        item === "ellipsis" ? (
          <span
            key={`ellipsis-${index}`}
            className="flex h-12 min-w-8 items-center justify-center px-1 text-base text-slate-400"
            aria-hidden
          >
            …
          </span>
        ) : (
          <Button
            key={item}
            type="button"
            variant={item === currentPage ? "default" : "outline"}
            className={cn(
              "h-12 w-12 rounded-xl border-slate-200 text-base",
              item === currentPage
                ? "bg-[#2C4260] text-white hover:bg-[#243751]"
                : "text-slate-600",
            )}
            onClick={() => onPageChange?.(item)}
          >
            {item}
          </Button>
        ),
      )}
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="rounded-xl border-slate-200"
        aria-label={nextLabel}
        disabled={isNextDisabled}
        onClick={() => onPageChange?.(Math.min(resolvedTotalPages, currentPage + 1))}
      >
        <NextIcon className="h-4 w-4" aria-hidden />
      </Button>
    </div>
  );
}
