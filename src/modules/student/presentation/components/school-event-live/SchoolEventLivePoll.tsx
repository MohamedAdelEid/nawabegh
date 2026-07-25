"use client";

import { BarChart3 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/shared/application/lib/cn";
import { formatNumber } from "@/shared/application/lib/format";
import type { SchoolEventPoll } from "@/modules/student/domain/types/schoolEvent.types";

type SchoolEventLivePollProps = {
  poll: SchoolEventPoll;
  onVote: (optionId: string | number) => void;
  isVoting?: boolean;
};

export function SchoolEventLivePoll({
  poll,
  onVote,
  isVoting,
}: SchoolEventLivePollProps) {
  const t = useTranslations("student.dashboard.schoolEventLive");
  const locale = useLocale();
  const leadingPercent = Math.max(...poll.options.map((option) => option.percent), 0);

  return (
    <section className="rounded-[1.5rem] bg-[#1e3a5f] p-6 text-white shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <BarChart3 className="size-5 text-[#c4a574]" aria-hidden />
        <h3 className="text-lg font-bold">{t("poll.title")}</h3>
      </div>

      <p className="mb-5 text-start text-sm leading-6 text-white/90">{poll.question}</p>

      <div className="space-y-3">
        {poll.options.map((option) => {
          const isLeading = option.percent === leadingPercent && leadingPercent > 0;
          return (
            <button
              key={String(option.id)}
              type="button"
              disabled={isVoting}
              onClick={() => onVote(option.id)}
              className={cn(
                "w-full rounded-xl bg-white/10 p-3 text-start transition-colors",
                !isVoting && "hover:bg-white/15",
                isVoting && "cursor-default opacity-80",
              )}
            >
              <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                <span className="font-medium">{option.label}</span>
                <span className="font-bold tabular-nums">{option.percent}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/20">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    isLeading ? "bg-[#c4a574]" : "bg-slate-300",
                  )}
                  style={{ width: `${option.percent}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-start text-xs text-white/70">
        {t("poll.votes", { count: formatNumber(poll.totalVotes, locale) })}
      </p>
    </section>
  );
}
