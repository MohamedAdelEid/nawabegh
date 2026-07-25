"use client";

import {
  CheckCircle2,
  CircleDot,
  RefreshCw,
  Send,
  Trophy,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/shared/application/lib/cn";
import type { SchoolEventFeedItem } from "@/modules/student/domain/types/schoolEvent.types";

type SchoolEventActivityFeedProps = {
  items: SchoolEventFeedItem[];
  onRefresh: () => void;
  isRefreshing?: boolean;
};

function FeedIcon({ type }: { type: string | null }) {
  const normalized = (type ?? "").toLowerCase();
  if (normalized.includes("trophy")) {
    return <Trophy className="size-4 text-amber-600" />;
  }
  if (normalized.includes("round")) {
    return <CircleDot className="size-4 text-sky-600" />;
  }
  if (normalized.includes("success") || normalized.includes("check")) {
    return <CheckCircle2 className="size-4 text-emerald-600" />;
  }
  return <Send className="size-4 text-sky-600" />;
}

function iconWrapClass(type: string | null) {
  const normalized = (type ?? "").toLowerCase();
  if (normalized.includes("trophy")) return "bg-amber-50";
  if (normalized.includes("round")) return "bg-sky-50";
  if (normalized.includes("success") || normalized.includes("check")) {
    return "bg-emerald-50";
  }
  return "bg-slate-100";
}

export function SchoolEventActivityFeed({
  items,
  onRefresh,
  isRefreshing,
}: SchoolEventActivityFeedProps) {
  const t = useTranslations("student.dashboard.schoolEventLive");

  return (
    <section className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between gap-3">
        <h3 className="text-lg font-bold text-[#1e3a5f]">{t("feed.title")}</h3>
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center gap-1.5 text-sm font-bold text-[#1e3a5f] hover:opacity-80 disabled:opacity-50"
        >
          <RefreshCw className={cn("size-3.5", isRefreshing && "animate-spin")} aria-hidden />
          {t("feed.refresh")}
        </button>
      </div>

      {items.length === 0 ? (
        <p className="rounded-xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
          {t("feed.empty")}
        </p>
      ) : (
        <ol className="relative space-y-6 ps-2">
          <span
            className="absolute inset-y-2 start-[15px] w-0.5 bg-slate-200"
            aria-hidden
          />
          {items.map((item) => (
            <li key={item.id} className="relative flex gap-4">
              <span
                className={cn(
                  "relative z-10 inline-flex size-8 shrink-0 items-center justify-center rounded-full",
                  iconWrapClass(item.icon),
                )}
              >
                <FeedIcon type={item.icon} />
              </span>
              <div className="min-w-0 flex-1 space-y-1 text-start">
                {item.relativeTimeLabel ? (
                  <p className="text-xs font-medium text-slate-400">
                    {item.relativeTimeLabel}
                  </p>
                ) : null}
                <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700">
                  {item.message}
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
