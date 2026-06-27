"use client"

import { cn } from "@/shared/application/lib/cn"
import { Skeleton } from "@/shared/presentation/components/ui/skeleton"

/**
 * Shared building blocks for dashboard loading skeletons. They mirror the real
 * shells (`DashboardPageHeader`, `DashboardStatCard`, `DashboardFiltersPanel`,
 * `DashboardTableCard`) so the layout doesn't shift when data arrives. Compose
 * them inside a `SkeletonScreen` to get the shimmer + fade-in for free.
 */

/** White rounded card shell matching the dashboard surface cards. */
export function SkeletonCard({
  className,
  children,
}: {
  className?: string
  children?: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "rounded-[1.75rem] border border-white/80 bg-white p-6 shadow-[var(--dashboard-shadow-soft)]",
        className,
      )}
    >
      {children}
    </div>
  )
}

/** Page header placeholder: title + description (+ optional action button). */
export function DashboardHeaderSkeleton({
  withAction = true,
  className,
}: {
  withAction?: boolean
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse gap-4 md:flex-row md:items-center md:justify-between",
        className,
      )}
    >
      <div className="space-y-3">
        <Skeleton className="h-8 w-56 rounded-xl" />
        <Skeleton className="h-4 w-72 max-w-full rounded-lg" />
      </div>
      {withAction ? <Skeleton className="h-14 w-44 rounded-2xl" /> : null}
    </div>
  )
}

/** Responsive grid of stat-card placeholders. */
export function DashboardStatCardsSkeleton({
  count = 4,
  className,
}: {
  count?: number
  className?: string
}) {
  return (
    <div
      className={cn("grid gap-4 md:grid-cols-2 xl:grid-cols-4", className)}
    >
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={`stat-${index}`}>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-4">
              <Skeleton className="h-4 w-16 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-20 rounded-lg" />
                <Skeleton className="h-9 w-24 rounded-xl" />
              </div>
            </div>
            <Skeleton className="h-14 w-14 rounded-2xl" />
          </div>
        </SkeletonCard>
      ))}
    </div>
  )
}

/** Filters panel placeholder with evenly spaced field slots. */
export function DashboardFiltersSkeleton({
  count = 4,
  className,
}: {
  count?: number
  className?: string
}) {
  return (
    <SkeletonCard className={cn("p-5", className)}>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: count }).map((_, index) => (
          <Skeleton key={`filter-${index}`} className="h-12 w-full rounded-xl" />
        ))}
      </div>
    </SkeletonCard>
  )
}

/** Table card placeholder with a header strip and repeated rows. */
export function DashboardTableSkeleton({
  rows = 6,
  showHeader = true,
  className,
}: {
  rows?: number
  showHeader?: boolean
  className?: string
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[2rem] border border-white/80 bg-white shadow-[var(--dashboard-shadow-soft)]",
        className,
      )}
    >
      {showHeader ? (
        <div className="flex items-center justify-between border-b border-slate-100 p-6">
          <Skeleton className="h-6 w-40 rounded-lg" />
          <Skeleton className="h-9 w-28 rounded-xl" />
        </div>
      ) : null}
      <div className="space-y-3 p-6">
        {Array.from({ length: rows }).map((_, index) => (
          <Skeleton key={`row-${index}`} className="h-14 w-full rounded-xl" />
        ))}
      </div>
    </div>
  )
}
