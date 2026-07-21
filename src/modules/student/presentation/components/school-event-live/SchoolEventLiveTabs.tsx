"use client";

import { cn } from "@/shared/application/lib/cn";
import type { SchoolEventLiveTab } from "@/modules/student/domain/types/schoolEvent.types";

type TabOption = {
  value: SchoolEventLiveTab;
  label: string;
};

type SchoolEventLiveTabsProps = {
  value: SchoolEventLiveTab;
  options: TabOption[];
  onChange: (value: SchoolEventLiveTab) => void;
};

export function SchoolEventLiveTabs({
  value,
  options,
  onChange,
}: SchoolEventLiveTabsProps) {
  return (
    <div className="flex w-full items-center justify-start gap-8 overflow-x-auto border-b-2 border-[#e2e8f0] px-4 pb-0.5">
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "shrink-0 border-b-4 pb-4 text-base transition-colors",
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
