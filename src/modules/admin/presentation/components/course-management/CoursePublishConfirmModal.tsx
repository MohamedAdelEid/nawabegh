"use client";

import { Globe, GraduationCap, UploadCloud, UserRound, X } from "lucide-react";
import { Button } from "@/shared/presentation/components/ui/button";
import {
  ModalDescription,
  ModalShell,
  ModalTitle,
} from "@/shared/presentation/components/ui/modal-shell";

export type CoursePublishModalVariant = "publish" | "unpublish";

type CoursePublishConfirmModalProps = {
  variant: CoursePublishModalVariant;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseTitle?: string;
  teacherName?: string;
  title: string;
  description: string;
  courseLabel: string;
  teacherLabel: string;
  confirmLabel: string;
  cancelLabel: string;
  processingLabel: string;
  onConfirm: () => void;
  isConfirming?: boolean;
};

export function CoursePublishConfirmModal({
  variant,
  open,
  onOpenChange,
  courseTitle,
  teacherName,
  title,
  description,
  courseLabel,
  teacherLabel,
  confirmLabel,
  cancelLabel,
  processingLabel,
  onConfirm,
  isConfirming = false,
}: CoursePublishConfirmModalProps) {
  const isPublish = variant === "publish";
  const Icon = isPublish ? Globe : UploadCloud;

  return (
    <ModalShell
      open={open}
      onOpenChange={onOpenChange}
      panelClassName="w-[min(95vw,28rem)] rounded-[2rem] border border-slate-100 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.18)] sm:p-7"
      overlayClassName="bg-[#1E2E42]/50 backdrop-blur-sm"
    >
      <div className="space-y-6 text-right">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div
              className={[
                "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-[inset_0_0_0_1px_rgba(0,0,0,0.04)]",
                isPublish ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700",
              ].join(" ")}
            >
              <Icon className="h-7 w-7" aria-hidden />
            </div>
            <div className="space-y-2">
              <ModalTitle className="text-xl font-extrabold text-[#1E3A66]">{title}</ModalTitle>
              <ModalDescription className="text-sm leading-relaxed text-slate-500">
                {description}
              </ModalDescription>
            </div>
          </div>
          <button
            type="button"
            className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            aria-label={cancelLabel}
            onClick={() => onOpenChange(false)}
            disabled={isConfirming}
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        {courseTitle ? (
          <div className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50/90 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#2C4260] shadow-sm">
                <GraduationCap className="h-5 w-5" aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-400">{courseLabel}</p>
                <p className="truncate text-base font-bold text-slate-800">{courseTitle}</p>
              </div>
            </div>
            {teacherName ? (
              <div className="flex items-center gap-2 border-t border-slate-200/80 pt-3 text-sm text-slate-600">
                <UserRound className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                <span className="text-xs font-semibold text-slate-400">{teacherLabel}</span>
                <span className="font-medium text-slate-700">{teacherName}</span>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2">
          <Button
            type="button"
            variant="outline"
            className="h-14 rounded-2xl border-slate-200 text-base font-bold text-slate-600 shadow-[0px_4px_0px_0px_#0000000D]"
            onClick={() => onOpenChange(false)}
            disabled={isConfirming}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            className={[
              "h-14 rounded-2xl text-base font-bold text-white",
              isPublish
                ? "bg-[#58CC02] shadow-[0px_4px_0px_0px_#46A302] hover:bg-[#4DB802]"
                : "bg-[#2C4260] shadow-[0px_4px_0px_0px_#1E2E42] hover:bg-[#243751]",
            ].join(" ")}
            onClick={onConfirm}
            disabled={isConfirming}
          >
            <Icon className="h-5 w-5" aria-hidden />
            {isConfirming ? processingLabel : confirmLabel}
          </Button>
        </div>
      </div>
    </ModalShell>
  );
}
