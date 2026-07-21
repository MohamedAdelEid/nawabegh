"use client";

import { useEffect, useState } from "react";
import { Button } from "@/shared/presentation/components/ui/button";
import {
  ModalDescription,
  ModalShell,
  ModalTitle,
} from "@/shared/presentation/components/ui/modal-shell";

type SchoolArticleRequestEditsModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  notesLabel: string;
  notesPlaceholder: string;
  notesRequired: string;
  hideFromFeedLabel: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: (payload: { notes: string; hideFromFeed: boolean }) => void | Promise<void>;
};

export function SchoolArticleRequestEditsModal({
  open,
  onOpenChange,
  title,
  notesLabel,
  notesPlaceholder,
  notesRequired,
  hideFromFeedLabel,
  confirmLabel,
  cancelLabel,
  onConfirm,
}: SchoolArticleRequestEditsModalProps) {
  const [notes, setNotes] = useState("");
  const [hideFromFeed, setHideFromFeed] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setNotes("");
      setHideFromFeed(true);
      setError(null);
      setSubmitting(false);
    }
  }, [open]);

  const handleConfirm = async () => {
    const trimmed = notes.trim();
    if (!trimmed) {
      setError(notesRequired);
      return;
    }
    setSubmitting(true);
    try {
      await onConfirm({ notes: trimmed, hideFromFeed });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalShell open={open} onOpenChange={onOpenChange}>
      <div className="space-y-5 text-right">
        <ModalTitle>{title}</ModalTitle>
        <ModalDescription className="sr-only">{title}</ModalDescription>

        <div className="space-y-2">
          <label className="block text-xs font-medium text-slate-500">{notesLabel}</label>
          <textarea
            value={notes}
            onChange={(event) => {
              setNotes(event.target.value);
              if (error) setError(null);
            }}
            rows={4}
            placeholder={notesPlaceholder}
            className="w-full resize-none rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-[#243B5A]/20"
          />
          {error ? <p className="text-xs font-medium text-rose-600">{error}</p> : null}
        </div>

        <label className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
          <span>{hideFromFeedLabel}</span>
          <input
            type="checkbox"
            checked={hideFromFeed}
            onChange={(event) => setHideFromFeed(event.target.checked)}
            className="h-4 w-4 accent-[#2B415E]"
          />
        </label>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {cancelLabel}
          </Button>
          <Button
            type="button"
            className="bg-[#2B415E] text-white hover:bg-[#24384f]"
            disabled={submitting}
            onClick={() => void handleConfirm()}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </ModalShell>
  );
}
