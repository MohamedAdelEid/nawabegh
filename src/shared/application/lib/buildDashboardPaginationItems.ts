export type DashboardPaginationItem = number | "ellipsis";

/**
 * Builds a compact page list such as `1 2 3 … 7 8` for large result sets.
 */
export function buildDashboardPaginationItems(
  currentPage: number,
  totalPages: number,
  siblingCount = 1,
): DashboardPaginationItem[] {
  const safeTotalPages = Math.max(0, totalPages);
  if (safeTotalPages <= 0) return [];
  if (safeTotalPages === 1) return [1];

  const totalPageNumbers = siblingCount * 2 + 5;

  if (safeTotalPages <= totalPageNumbers) {
    return Array.from({ length: safeTotalPages }, (_, index) => index + 1);
  }

  const safeCurrentPage = Math.min(Math.max(currentPage, 1), safeTotalPages);
  const leftSibling = Math.max(safeCurrentPage - siblingCount, 1);
  const rightSibling = Math.min(safeCurrentPage + siblingCount, safeTotalPages);

  const showLeftEllipsis = leftSibling > 2;
  const showRightEllipsis = rightSibling < safeTotalPages - 1;

  if (!showLeftEllipsis && showRightEllipsis) {
    const leftItemCount = 3 + 2 * siblingCount;
    const leftRange = Array.from({ length: leftItemCount }, (_, index) => index + 1);
    return [...leftRange, "ellipsis", safeTotalPages];
  }

  if (showLeftEllipsis && !showRightEllipsis) {
    const rightItemCount = 3 + 2 * siblingCount;
    const rightRange = Array.from(
      { length: rightItemCount },
      (_, index) => safeTotalPages - rightItemCount + index + 1,
    );
    return [1, "ellipsis", ...rightRange];
  }

  if (showLeftEllipsis && showRightEllipsis) {
    const middleRange = Array.from(
      { length: rightSibling - leftSibling + 1 },
      (_, index) => leftSibling + index,
    );
    return [1, "ellipsis", ...middleRange, "ellipsis", safeTotalPages];
  }

  return Array.from({ length: safeTotalPages }, (_, index) => index + 1);
}
