"use client";

import { useLocale } from "next-intl";

export type Direction = "rtl" | "ltr";

interface UseDirectionResult {
  direction: Direction;
  isRtl: boolean;
}

/**
 * Resolves the active layout direction from the current locale.
 *
 * CSS logical properties (e.g. `start-0`, `border-s`) follow `dir` automatically,
 * but physical transforms (framer-motion `x`) and shadows do not — use `isRtl`
 * to flip their sign so the dashboard shell mirrors correctly in English (LTR).
 */
export function useDirection(): UseDirectionResult {
  const locale = useLocale();
  const isRtl = locale !== "en";
  return { direction: isRtl ? "rtl" : "ltr", isRtl };
}
