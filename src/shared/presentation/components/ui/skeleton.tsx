"use client"

import { createContext, useContext } from "react"

import { cn } from "@/shared/application/lib/cn"

/**
 * When `true`, descendant `Skeleton`s render the shimmer sweep instead of the
 * default `animate-pulse`. `SkeletonScreen` provides this, so individual
 * skeleton blocks don't need to opt in one by one. Existing usages (e.g. admin
 * skeletons) render with no provider and keep the original pulse animation.
 */
const SkeletonShimmerContext = createContext(false)

export const SkeletonShimmerProvider = SkeletonShimmerContext.Provider

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Force the shimmer look on/off, overriding the surrounding context. */
  shimmer?: boolean
}

function Skeleton({ className, shimmer, ...props }: SkeletonProps) {
  const contextShimmer = useContext(SkeletonShimmerContext)
  const useShimmer = shimmer ?? contextShimmer

  return (
    <div
      className={cn(
        "rounded-md bg-muted",
        useShimmer ? "skeleton-shimmer" : "animate-pulse",
        className,
      )}
      {...props}
    />
  )
}

export { Skeleton }
