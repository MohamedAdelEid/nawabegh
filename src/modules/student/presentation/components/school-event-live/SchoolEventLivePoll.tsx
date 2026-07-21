"use client";

import { BarChart3 } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/shared/application/lib/cn";
import type { SchoolEventActivePoll } from "@/modules/student/domain/types/schoolEvent.types";

type SchoolEventLivePollProps = {
  poll: SchoolEventActivePoll;
  onVote: (optionId: string) => void;
  isVoting?: boolean;
};

export function SchoolEventLivePoll({
  poll,
  onVote,
  isVoting,
}: SchoolEventLivePollProps) {
  const t = useTranslations("student.dashboard.schoolEventLive");
  const disabled = poll.hasUserVoted || isVoting;

  return (
    <section className="rounded-2xl bg-[#2b415e] p-6 text-white shadow-[0px_8px_0px_rgba(0,0,0,0.08)]">
      <div className="mb-4 flex items-center gap-2">
        <BarChart3 className="size-5 text-[#c7af6d]" aria-hidden />
        <h3 className="text-lg font-bold">{t("poll.title")}</h3>
      </div>

      <p className="mb-5 text-start text-sm leading-6 text-white/90">{poll.question}</p>

      <div className="space-y-3">
        {poll.options.map((option) => (
          <button
            key={option.optionId}
            type="button"
            disabled={disabled}
            onClick={() => onVote(option.optionId)}
            className={cn(
              "w-full rounded-xl bg-white/10 p-3 text-start transition-colors",
              !disabled && "hover:bg-white/15",
              disabled && "cursor-default",
            )}
          >
            <div className="mb-2 flex items-center justify-between gap-3 text-sm">
              <span className="font-medium">{option.label}</span>
              <span className="font-bold tabular-nums">{option.votePercentage}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/20">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  option.isLeading ? "bg-[#c7af6d]" : "bg-[#cbd5e1]",
                )}
                style={{ width: `${option.votePercentage}%` }}
              />
            </div>
          </button>
        ))}
      </div>

      <p className="mt-4 text-start text-xs text-white/70">{poll.totalVotesLabel}</p>
    </section>
  );
}
