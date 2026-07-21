"use client";

import { EyeOff, Loader2, MessageSquareX, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/shared/presentation/components/ui/button";
import {
  ModalDescription,
  ModalShell,
  ModalTitle,
} from "@/shared/presentation/components/ui/modal-shell";

export type SchoolArticleCommentPreview = {
  id: string;
  authorName: string;
  authorInitials: string;
  createdAtLabel: string;
  message: string;
};

type SchoolArticleCommentActionModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  comment: SchoolArticleCommentPreview | null;
  title: string;
  description: string;
  deleteLabel: string;
  hideLabel: string;
  cancelLabel: string;
  submittingLabel: string;
  canDelete: boolean;
  canHide: boolean;
  onDelete: (commentId: string) => void | Promise<void>;
  onHide: (commentId: string) => void | Promise<void>;
};

export function SchoolArticleCommentActionModal({
  open,
  onOpenChange,
  comment,
  title,
  description,
  deleteLabel,
  hideLabel,
  cancelLabel,
  submittingLabel,
  canDelete,
  canHide,
  onDelete,
  onHide,
}: SchoolArticleCommentActionModalProps) {
  const [pendingAction, setPendingAction] = useState<"delete" | "hide" | null>(null);
  const busy = pendingAction !== null;

  const run = async (action: "delete" | "hide") => {
    if (!comment || busy) return;
    setPendingAction(action);
    try {
      if (action === "delete") await onDelete(comment.id);
      else await onHide(comment.id);
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <ModalShell open={open} onOpenChange={onOpenChange}>
      <div className="space-y-6 text-right">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-[#E55353]">
            <MessageSquareX className="h-8 w-8" strokeWidth={2} aria-hidden />
          </div>
          <div className="w-full space-y-2 text-center">
            <ModalTitle className="text-xl font-extrabold text-[#0F172A]">{title}</ModalTitle>
            <ModalDescription className="text-sm leading-relaxed text-slate-500">
              {description}
            </ModalDescription>
          </div>
        </div>

        {comment ? (
          <div className="rounded-xl border border-slate-100 bg-[#F1F5F9] px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#DBEEF6] text-sm font-bold text-[#255E8A]">
                  {comment.authorInitials}
                </div>
                <div className="min-w-0 text-right">
                  <p className="text-base font-bold text-[#1E3A66]">{comment.authorName}</p>
                  <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-slate-600">
                    {comment.message}
                  </p>
                </div>
              </div>
              <p className="shrink-0 pt-1 text-xs text-slate-400">{comment.createdAtLabel}</p>
            </div>
          </div>
        ) : null}

        <div className="flex flex-col gap-3">
          {canDelete ? (
            <Button
              type="button"
              disabled={!comment || busy}
              onClick={() => void run("delete")}
              className="h-12 w-full rounded-xl bg-[#FF4B4B] text-base font-bold text-white shadow-[0px_4px_0px_0px_#D33131] hover:bg-[#E13E3E] disabled:opacity-60"
            >
              <span className="inline-flex items-center justify-center gap-2">
                {pendingAction === "delete" ? (
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
                ) : (
                  <Trash2 className="h-4 w-4 shrink-0" aria-hidden />
                )}
                {pendingAction === "delete" ? submittingLabel : deleteLabel}
              </span>
            </Button>
          ) : null}
          {canHide ? (
            <Button
              type="button"
              variant="outline"
              disabled={!comment || busy}
              onClick={() => void run("hide")}
              className="h-12 w-full rounded-xl border-2 border-[#E2E8F0] bg-[#F8FAFC] text-base font-bold text-[#475569] hover:bg-[#F1F5F9] disabled:opacity-60"
            >
              <span className="inline-flex items-center justify-center gap-2">
                {pendingAction === "hide" ? (
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
                ) : (
                  <EyeOff className="h-4 w-4 shrink-0" aria-hidden />
                )}
                {pendingAction === "hide" ? submittingLabel : hideLabel}
              </span>
            </Button>
          ) : null}
        </div>

        <div className="flex justify-center pt-1">
          <button
            type="button"
            disabled={busy}
            className="text-sm font-semibold text-slate-500 transition-colors hover:text-slate-800 disabled:opacity-50"
            onClick={() => onOpenChange(false)}
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}
