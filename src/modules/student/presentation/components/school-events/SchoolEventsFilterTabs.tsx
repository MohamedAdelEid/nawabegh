"use client";

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
    <div className="flex w-full items-center justify-start gap-2 overflow-x-auto border-b-2 border-[#e2e8f0] pb-0.5">
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "shrink-0 border-b-4 px-6 pb-5 pt-4 text-sm transition-colors",
              isActive
                ? "border-[#2b415e] font-bold text-[#2b415e]"
                : "border-transparent font-medium text-[#64748b] hover:text-[#2b415e]",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
