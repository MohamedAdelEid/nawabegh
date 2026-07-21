"use client";

import { Lightbulb, Medal, Puzzle, RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/shared/application/lib/cn";
import type { SchoolEventActivityItem } from "@/modules/student/domain/types/schoolEvent.types";

type SchoolEventActivityFeedProps = {
  items: SchoolEventActivityItem[];
  onRefresh: () => void;
  isRefreshing?: boolean;
};

const iconWrapClass: Record<SchoolEventActivityItem["iconType"], string> = {
  success: "bg-[#dcf4cb] text-[#58cc02]",
  round: "bg-[#dbe3f3] text-[#2b415e]",
  trophy: "bg-[#f4ecd8] text-[#c7af6d]",
};

function FeedIcon({ type }: { type: SchoolEventActivityItem["iconType"] }) {
  if (type === "success") return <Lightbulb className="size-4" aria-hidden />;
  if (type === "round") return <Puzzle className="size-4" aria-hidden />;
  return <Medal className="size-4" aria-hidden />;
}

export function SchoolEventActivityFeed({
  items,
  onRefresh,
  isRefreshing,
}: SchoolEventActivityFeedProps) {
  const t = useTranslations("student.dashboard.schoolEventLive");

  return (
    <section className="rounded-2xl border-2 border-[#e2e8f0] bg-white p-6 shadow-[0px_8px_0px_rgba(0,0,0,0.05)]">
      <div className="mb-6 flex items-center justify-between gap-3">
        <h3 className="text-lg font-bold text-[#0f172a]">{t("feed.title")}</h3>
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center gap-1.5 text-sm font-bold text-[#2b415e] hover:opacity-80 disabled:opacity-50"
        >
          <RefreshCw className={cn("size-3.5", isRefreshing && "animate-spin")} aria-hidden />
          {t("feed.refresh")}
        </button>
      </div>

      <ol className="relative space-y-6 ps-2">
        <span
          className="absolute inset-y-2 start-[15px] w-0.5 bg-[#e2e8f0]"
          aria-hidden
        />
        {items.map((item) => (
          <li key={item.id} className="relative flex gap-4">
            <span
              className={cn(
                "relative z-10 inline-flex size-8 shrink-0 items-center justify-center rounded-full",
                iconWrapClass[item.iconType],
              )}
            >
              <FeedIcon type={item.iconType} />
            </span>
            <div className="min-w-0 flex-1 space-y-1 text-start">
              <p className="text-xs font-medium text-[#94a3b8]">{item.relativeLabel}</p>
              <p className="rounded-xl bg-[#f8fafc] px-4 py-3 text-sm leading-6 text-[#334155]">
                {item.message}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
