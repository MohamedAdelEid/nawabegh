"use client";

import type { LucideIcon } from "lucide-react";
import { Eye, ListChecks, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/shared/presentation/components/ui/button";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { DashboardBadge, type DashboardBadgeTone } from "@/shared/presentation/components/dashboard";
import { cn } from "@/shared/application/lib/cn";
import { IconTone, iconToneBGColorClassNameMap, iconToneClassNameMap } from "@/shared/domain/types/common.types";

interface QuestionBankQuestionPreviewCardProps {
  questionTypeLabel: string;
  questionTypeIcon?: LucideIcon;
  subjectName: string;
  gradeLabel?: string;
  difficultyLabel: string;
  difficultyTone: IconTone;
  questionText: string;
  standardAnswerLabel: string;
  standardAnswerValue: string;
  standardAnswerIcon?: LucideIcon;
  approvalLabel: string;
  detailsLabel: string;
  editLabel: string;
  deleteLabel: string;
  onDetails?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isDeleting?: boolean;
  className?: string;
}

export function QuestionBankQuestionPreviewCard({
  questionTypeLabel,
  questionTypeIcon: TypeIcon = ListChecks,
  subjectName,
  gradeLabel,
  difficultyLabel,
  difficultyTone,
  questionText,
  standardAnswerLabel,
  standardAnswerValue,
  standardAnswerIcon: AnswerIcon,
  approvalLabel,
  detailsLabel,
  editLabel,
  deleteLabel,
  onDetails,
  onEdit,
  onDelete,
  isDeleting = false,
  className,
}: QuestionBankQuestionPreviewCardProps) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden rounded-2xl border border-slate-100 bg-white",
        "!shadow-[var(--dashboard-shadow-soft)]",
        className,
      )}
    >
      <span
        className={cn(
          "absolute inset-y-0 right-0 w-1.5",
          iconToneBGColorClassNameMap[difficultyTone],
        )}
        aria-hidden
      />
      <CardContent className="space-y-4 p-6 text-right">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <DashboardBadge tone={difficultyTone}>
              {difficultyLabel}
            </DashboardBadge>
            {gradeLabel ? (
              <>
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
              <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                {gradeLabel}
              </span>
              </>
            ) : null}
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
            <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
              {subjectName}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600">
              <TypeIcon className="h-3.5 w-3.5" aria-hidden />
              {questionTypeLabel}
            </span>
            <button
              type="button"
              onClick={onEdit}
              className="dashboard-icon-btn"
              aria-label={editLabel}
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onDelete}
              disabled={isDeleting}
              className="dashboard-icon-btn dashboard-icon-btn--danger disabled:opacity-50"
              aria-label={deleteLabel}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <h3 className="flex-1 text-2xl font-bold leading-relaxed text-[#2B415E] my-8">{questionText}</h3>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex-1 flex items-center gap-3 bg-[#F1F5F966] p-[20px] rounded-2xl border-2 border-[#E2E8F080]">
            <div className="flex-1 text-right">
              <p className="text-xs font-medium text-slate-400">{standardAnswerLabel}</p>
              <p className="text-base font-bold text-[#2B415E]">{standardAnswerValue}</p>
            </div>
            {/* {AnswerIcon ? (
              <span
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full",
                  // DIFFICULTY_ANSWER_ICON_BG[difficultyTone],
                )}
              >
                <AnswerIcon className="h-5 w-5" aria-hidden />
              </span>
            ) : null} */}
            <DashboardBadge tone="success">{approvalLabel}</DashboardBadge>

          </div>
        </div>

      </CardContent>
    </Card>
  );
}
