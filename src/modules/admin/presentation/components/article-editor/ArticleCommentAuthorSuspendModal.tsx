"use client";

import { useEffect, useId, useState, type ReactNode } from "react";
import { AlertTriangle, Ban, Loader2, UserX, X } from "lucide-react";
import { Button } from "@/shared/presentation/components/ui/button";
import { cn } from "@/shared/application/lib/cn";
import {
  ModalClose,
  ModalDescription,
  ModalShell,
  ModalTitle,
} from "@/shared/presentation/components/ui/modal-shell";
import type { CommentAuthorSuspensionDuration } from "@/modules/admin/domain/data/articleEditorReviewData";
import { UserAvatarImageOrInitials } from "@/shared/presentation/components/user";

export type ArticleCommentAuthorSuspendPreview = {
  name: string;
  email: string;
  /** Stable key for avatar image load / retry (e.g. user id). */
  trackKey: string;
  imageUrl?: string | null;
};

interface ArticleCommentAuthorSuspendModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  author: ArticleCommentAuthorSuspendPreview | null;
  title: string;
  subtitle: string;
  closeLabel: string;
  activeAuthorBadge: string;
  durationLabel: string;
  durationDay: string;
  durationWeek: string;
  durationMonth: string;
  durationPermanent: string;
  reasonLabel: string;
  reasonPlaceholder: string;
  warningText: string;
  cancelLabel: string;
  confirmLabel: string;
  submittingLabel: string;
  onConfirm: (payload: {
    duration: CommentAuthorSuspensionDuration;
    reason: string;
  }) => void | Promise<void>;
}

const DURATIONS: CommentAuthorSuspensionDuration[] = ["day", "week", "month", "permanent"];

export function ArticleCommentAuthorSuspendModal({
  open,
  onOpenChange,
  author,
  title,
  subtitle,
  closeLabel,
  activeAuthorBadge,
  durationLabel,
  durationDay,
  durationWeek,
  durationMonth,
  durationPermanent,
  reasonLabel,
  reasonPlaceholder,
  warningText,
  cancelLabel,
  confirmLabel,
  submittingLabel,
  onConfirm,
}: ArticleCommentAuthorSuspendModalProps) {
  const reasonFieldId = useId();
  const [duration, setDuration] = useState<CommentAuthorSuspensionDuration>("day");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setDuration("day");
      setReason("");
      setSubmitting(false);
    }
  }, [open]);

  const durationLabels: Record<CommentAuthorSuspensionDuration, string> = {
    day: durationDay,
    week: durationWeek,
    month: durationMonth,
    permanent: durationPermanent,
  };

  const handleConfirm = async () => {
    if (!author || submitting) return;
    setSubmitting(true);
    try {
      await onConfirm({ duration, reason: reason.trim() });
    } finally {
      setSubmitting(false);
    }
  };

  const durationButtonClass = (id: CommentAuthorSuspensionDuration) =>
    cn(
      "min-h-11 rounded-xl border-2 px-2 py-2 text-center text-sm font-bold transition-colors sm:px-3",
      duration === id && id !== "permanent" && "border-[#243B5A] bg-white text-[#1E3A66] shadow-sm",
      duration === id && id === "permanent" && "border-[#FF4B4B] bg-red-50 text-[#FF4B4B] shadow-sm",
      duration !== id && "border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] hover:border-slate-300",
      id === "permanent" && duration !== id && "text-[#FF4B4B]",
    );

  return (
    <ModalShell
      open={open}
      onOpenChange={onOpenChange}
      panelClassName="w-[min(95vw,40rem)] rounded-[1.75rem] p-6 sm:p-8"
    >
      <div className="space-y-6 text-right">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-50 text-[#E55353]">
              <UserX className="h-6 w-6" strokeWidth={2} aria-hidden />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <ModalTitle className="text-xl font-extrabold text-[#1E3A66]">{title}</ModalTitle>
              <ModalDescription className="text-sm leading-relaxed text-slate-500">
                {subtitle}
              </ModalDescription>
            </div>
          </div>
          <ModalClose asChild>
            <button
              type="button"
              className="shrink-0 rounded-xl p-2 text-[#A9B7D0] transition-colors hover:bg-slate-50 hover:text-[#6C82A8]"
              aria-label={closeLabel}
            >
              <X className="h-6 w-6" />
            </button>
          </ModalClose>
        </div>

        {author ? (
          <div className="rounded-xl border border-slate-100 bg-[#F1F5F9] px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <UserAvatarImageOrInitials
                  trackKey={author.trackKey}
                  name={author.name}
                  imageUrl={author.imageUrl ?? null}
                  size="md"
                  circleClassName="bg-[#DBEEF6] text-[#255E8A]"
                />
                <div className="min-w-0 text-right">
                  <p className="text-base font-bold text-[#1E3A66]">{author.name}</p>
                  <p className="mt-0.5 truncate text-sm text-slate-500">{author.email}</p>
                </div>
              </div>
              <DashboardBadgeInline>{activeAuthorBadge}</DashboardBadgeInline>
            </div>
          </div>
        ) : null}

        <div className="space-y-3">
          <p className="text-base font-extrabold text-[#1E3A66]">{durationLabel}</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {DURATIONS.map((id) => (
              <button
                key={id}
                type="button"
                disabled={!author || submitting}
                onClick={() => setDuration(id)}
                className={durationButtonClass(id)}
              >
                {durationLabels[id]}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-base font-extrabold text-[#1E3A66]" htmlFor={reasonFieldId}>
            {reasonLabel}
          </label>
          <textarea
            id={reasonFieldId}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={!author || submitting}
            rows={5}
            placeholder={reasonPlaceholder}
            className="w-full resize-none rounded-xl border border-[#E6EDF8] bg-white px-4 py-3 text-right text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#243B5A]/20 disabled:opacity-60"
          />
        </div>

        <div className="flex gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-right">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#E55353]" aria-hidden />
          <p className="text-sm font-semibold leading-relaxed text-[#B42318]">{warningText}</p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
          <Button
            type="button"
            disabled={!author || submitting}
            onClick={() => void handleConfirm()}
            className="h-14 rounded-xl bg-[#FF4B4B] text-base font-extrabold text-white shadow-[0px_4px_0px_0px_#D33131] hover:bg-[#E13E3E] sm:order-1"
          >
            <span className="inline-flex items-center justify-center gap-2">
              {submitting ? (
                <Loader2 className="h-5 w-5 shrink-0 animate-spin" aria-hidden />
              ) : (
                <Ban className="h-5 w-5 shrink-0" aria-hidden />
              )}
              {submitting ? submittingLabel : confirmLabel}
            </span>
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={submitting}
            onClick={() => onOpenChange(false)}
            className="h-14 rounded-xl border-2 border-[#E2EAF6] text-base font-extrabold text-[#5C7093] sm:order-2"
          >
            {cancelLabel}
          </Button>
        </div>
      </div>
    </ModalShell>
  );
}

function DashboardBadgeInline({ children }: { children: ReactNode }) {
  return (
    <span className="shrink-0 rounded-lg bg-[#E8EEF7] px-3 py-1 text-xs font-bold text-[#5C7093]">
      {children}
    </span>
  );
}
