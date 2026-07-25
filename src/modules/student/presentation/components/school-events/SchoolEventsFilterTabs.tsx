"use client";

import { motion } from "framer-motion";
import { cn } from "@/shared/application/lib/cn";
import type { SchoolEventStatusFilter } from "@/modules/student/domain/types/schoolEvent.types";

type FilterOption = {
  value: SchoolEventStatusFilter;
  label: string;
};

type SchoolEventsFilterTabsProps = {
  value: SchoolEventStatusFilter;
  options: FilterOption[];
  onChange: (value: SchoolEventStatusFilter) => void;
};

export function SchoolEventsFilterTabs({
  value,
  options,
  onChange,
}: SchoolEventsFilterTabsProps) {
  return (
    <div role="tablist" className="flex flex-wrap gap-1 border-b border-slate-200">
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              "relative min-h-11 px-4 py-2 text-sm font-semibold transition-colors",
              selected ? "text-[#1e3a5f]" : "text-slate-500 hover:text-slate-700",
            )}
          >
            {option.label}
            {selected ? (
              <motion.span
                layoutId="student-school-events-tab"
                className="absolute inset-x-2 -bottom-px h-1 rounded-full bg-[#1e3a5f]"
              />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
