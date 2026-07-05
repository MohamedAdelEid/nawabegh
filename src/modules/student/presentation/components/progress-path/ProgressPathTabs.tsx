"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/shared/application/lib/cn";

type TabItem = {
  id: string;
  label: string;
};

type ProgressPathTabsProps = {
  items: TabItem[];
  activeId: string | null;
  onChange: (id: string) => void;
  variant?: "course" | "path";
  ariaLabel: string;
  isLoading?: boolean;
};

export function ProgressPathTabs({
  items,
  activeId,
  onChange,
  variant = "course",
  ariaLabel,
  isLoading = false,
}: ProgressPathTabsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "prev" | "next") => {
    if (!scrollRef.current) return;
    const isRtl =
      typeof document !== "undefined" && document.documentElement.dir === "rtl";
    const magnitude = 260;
    const forward = direction === "next" ? magnitude : -magnitude;
    scrollRef.current.scrollBy({
      left: isRtl ? -forward : forward,
      behavior: "smooth",
    });
  };

  const isPath = variant === "path";
  const activeColor = isPath ? "#c7af6d" : "#2b415e";

  return (
    <div className="flex items-center gap-2 px-4 md:px-6">
      <button
        type="button"
        onClick={() => scroll("prev")}
        aria-label="Previous"
        className="flex size-8 shrink-0 items-center justify-center text-[#6b7280] transition-colors hover:text-[#2b415e]"
      >
        <ChevronRight className="size-6" aria-hidden />
      </button>

      <div
        ref={scrollRef}
        role="tablist"
        aria-label={ariaLabel}
        className="flex flex-1 items-center gap-2 overflow-x-auto py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {isLoading && items.length === 0 ? (
          <div className="h-14 w-full animate-pulse rounded-xl bg-[#e2e8f0]" />
        ) : null}
        {items.map((item) => {
          const isActive = item.id === activeId;

          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(item.id)}
              className={cn(
                "relative h-14 shrink-0 rounded-xl px-5 text-base font-medium transition-colors",
                isActive
                  ? "text-white"
                  : "border border-[#2b415e]/25 bg-[#f3f4f6] text-[#6b7280] hover:text-[#2b415e]",
              )}
            >
              {isActive ? (
                <motion.span
                  layoutId={`progress-tab-bg-${variant}`}
                  className="absolute inset-0 rounded-xl"
                  style={{ backgroundColor: activeColor }}
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              ) : null}
              <span className="relative z-10 whitespace-nowrap">{item.label}</span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => scroll("next")}
        aria-label="Next"
        className="flex size-8 shrink-0 items-center justify-center text-[#6b7280] transition-colors hover:text-[#2b415e]"
      >
        <ChevronLeft className="size-6" aria-hidden />
      </button>
    </div>
  );
}
