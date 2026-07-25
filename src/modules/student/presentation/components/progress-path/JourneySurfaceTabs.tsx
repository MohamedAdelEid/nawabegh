"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/shared/application/lib/cn";

export type JourneySurfaceId =
  | "journey"
  | "interactiveBook"
  | "helpFiles"
  | "chat";

type JourneySurfaceTabsProps = {
  activeId: JourneySurfaceId;
  onChange: (id: JourneySurfaceId) => void;
  labels: Record<JourneySurfaceId, string>;
  ariaLabel: string;
};

const SURFACE_ORDER: JourneySurfaceId[] = [
  "journey",
  "interactiveBook",
  "helpFiles",
  "chat",
];

export function JourneySurfaceTabs({
  activeId,
  onChange,
  labels,
  ariaLabel,
}: JourneySurfaceTabsProps) {
  const activeIndex = SURFACE_ORDER.indexOf(activeId);

  const go = (direction: -1 | 1) => {
    const nextIndex =
      (activeIndex + direction + SURFACE_ORDER.length) % SURFACE_ORDER.length;
    onChange(SURFACE_ORDER[nextIndex]!);
  };

  return (
    <div className="flex items-center justify-center gap-2 px-4 md:px-6">
      {/* <button
        type="button"
        onClick={() => go(-1)}
        aria-label="Previous"
        className="flex size-8 shrink-0 items-center justify-center text-[#6b7280] transition-colors hover:text-[#2b415e]"
      >
        <ChevronRight className="size-6" aria-hidden />
      </button> */}

      <div
        role="tablist"
        aria-label={ariaLabel}
        className="flex flex-1 items-center justify-center gap-2 overflow-x-auto py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {SURFACE_ORDER.map((id) => {
          const isActive = id === activeId;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(id)}
              className={cn(
                "relative h-12 shrink-0 rounded-xl px-4 text-sm font-semibold transition-colors md:h-14 md:px-5 md:text-base",
                isActive
                  ? "text-white"
                  : "border border-[#2b415e]/25 bg-[#f3f4f6] text-[#6b7280] hover:text-[#2b415e]",
              )}
            >
              {isActive ? (
                <motion.span
                  layoutId="journey-surface-tab-bg"
                  className="absolute inset-0 rounded-xl bg-[#2b415e]"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              ) : null}
              <span className="relative z-10 whitespace-nowrap">{labels[id]}</span>
            </button>
          );
        })}
      </div>

      {/* <button
        type="button"
        onClick={() => go(1)}
        aria-label="Next"
        className="flex size-8 shrink-0 items-center justify-center text-[#6b7280] transition-colors hover:text-[#2b415e]"
      >
        <ChevronLeft className="size-6" aria-hidden />
      </button> */}
    </div>
  );
}
