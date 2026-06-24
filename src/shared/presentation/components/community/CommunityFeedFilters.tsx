"use client";

import { cn } from "@/shared/application/lib/cn";
import type { CommunityFeedSort } from "@/modules/admin/infrastructure/api/communityArticlesApi";

type CommunityFeedFiltersProps = {
  value: CommunityFeedSort;
  onChange: (value: CommunityFeedSort) => void;
  labels: Record<CommunityFeedSort, string>;
  title: string;
};

export function CommunityFeedFilters({ value, onChange, labels, title }: CommunityFeedFiltersProps) {
  const tabs: CommunityFeedSort[] = ["latest", "mostActive", "unanswered"];

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h2 className="text-right text-lg font-bold text-[#2C4260]">{title}</h2>
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => onChange(tab)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition",
              value === tab
                ? "bg-[#2C4260] text-white"
                : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50",
            )}
          >
            {labels[tab]}
          </button>
        ))}
      </div>
    </div>
  );
}
