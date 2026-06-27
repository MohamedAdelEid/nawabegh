"use client"

import { motion } from "framer-motion"

import { cn } from "@/shared/application/lib/cn"
import { SkeletonShimmerProvider } from "@/shared/presentation/components/ui/skeleton"

interface SkeletonScreenProps {
  children: React.ReactNode
  className?: string
  /**
   * Localized text announced to assistive tech while content loads
   * (e.g. `t("common.loading")`). Rendered visually hidden.
   */
  label?: string
  /** Toggle the shimmer sweep on nested `Skeleton`s. Defaults to `true`. */
  shimmer?: boolean
}

/**
 * Reusable loading wrapper for structured skeletons. Fades the placeholder in
 * gently, exposes a polite `role="status"` region for screen readers, and
 * enables the shimmer animation for every nested `Skeleton`.
 */
export function SkeletonScreen({
  children,
  className,
  label,
  shimmer = true,
}: SkeletonScreenProps) {
  return (
    <motion.div
      role="status"
      aria-busy="true"
      aria-live="polite"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(className)}
    >
      {label ? <span className="sr-only">{label}</span> : null}
      <SkeletonShimmerProvider value={shimmer}>
        {children}
      </SkeletonShimmerProvider>
    </motion.div>
  )
}
