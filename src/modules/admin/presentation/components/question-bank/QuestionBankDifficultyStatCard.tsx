"use client";

import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { cn } from "@/shared/application/lib/cn";

export type QuestionBankDifficultyDistribution = {
  easy: number;
  medium: number;
  hard: number;
};

interface QuestionBankDifficultyStatCardProps {
  label: string;
  indicator?: string;
  distribution: QuestionBankDifficultyDistribution;
  easyLabel: string;
  mediumLabel: string;
  hardLabel: string;
  tooltip?: string;
  className?: string;
}

const SEGMENT_BG = {
  easy: "bg-[#63C41A]",
  medium: "bg-[#E0B33A]",
  hard: "bg-[#E14B4B]",
} as const;

const SEGMENT_TEXT = {
  easy: "text-[#3E8C0E]",
  medium: "text-[#A07F22]",
  hard: "text-[#B83232]",
} as const;

function clampPercent(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  return Math.min(100, Math.round(value));
}

function normalizeDistribution(
  distribution: QuestionBankDifficultyDistribution,
): QuestionBankDifficultyDistribution {
  const easy = clampPercent(distribution.easy);
  const medium = clampPercent(distribution.medium);
  const hard = clampPercent(distribution.hard);
  const sum = easy + medium + hard;

  if (sum === 0 || sum === 100) {
    return { easy, medium, hard };
  }

  return {
    easy: Math.round((easy * 100) / sum),
    medium: Math.round((medium * 100) / sum),
    hard: Math.max(0, 100 - Math.round((easy * 100) / sum) - Math.round((medium * 100) / sum)),
  };
}

export function QuestionBankDifficultyStatCard({
  label,
  indicator,
  distribution,
  easyLabel,
  mediumLabel,
  hardLabel,
  tooltip,
  className,
}: QuestionBankDifficultyStatCardProps) {
  const normalized = normalizeDistribution(distribution);

  const segments: Array<{
    key: keyof QuestionBankDifficultyDistribution;
    label: string;
    percent: number;
  }> = [
    { key: "easy", label: easyLabel, percent: normalized.easy },
    { key: "medium", label: mediumLabel, percent: normalized.medium },
    { key: "hard", label: hardLabel, percent: normalized.hard },
  ];

  return (
    <Card
      className={cn(
        "rounded-[1.75rem] border-white/80 bg-white",
        "!shadow-[var(--dashboard-shadow-soft)]",
        className,
      )}
      title={tooltip}
    >
      <CardContent className="space-y-4 p-6 text-right">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm text-slate-500">{label}</p>
          {indicator ? (
            <span className="rounded-full bg-[#E9F8DF] px-3 py-0.5 text-xs font-bold text-[#3E8C0E]">
              {indicator}
            </span>
          ) : null}
        </div>
        <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-100">
          {segments.map((segment) =>
            segment.percent > 0 ? (
              <span
                key={segment.key}
                className={cn("h-full", SEGMENT_BG[segment.key])}
                style={{ width: `${segment.percent}%` }}
                aria-hidden
              />
            ) : null,
          )}
        </div>
        <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-bold">
          {segments.map((segment) => (
            <li key={segment.key} className={cn("flex items-center gap-1.5", SEGMENT_TEXT[segment.key])}>
              <span>{segment.label}</span>
              <span>{segment.percent}%</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
