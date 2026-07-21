"use client";

import { useEffect, useState } from "react";
import { Button } from "@/shared/presentation/components/ui/button";
import {
  ModalDescription,
  ModalShell,
  ModalTitle,
} from "@/shared/presentation/components/ui/modal-shell";

type ReasonOption = { id: string; label: string };

type SchoolArticleRejectModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  infoBannerText: string;
  reasonsTitle: string;
  notesLabel: string;
  notesPlaceholder: string;
  confirmLabel: string;
  cancelLabel: string;
  reasonOptions: ReasonOption[];
  onConfirm: (payload: { reasons: string[]; notes: string }) => void | Promise<void>;
};

export function SchoolArticleRejectModal({
  open,
  onOpenChange,
  title,
  infoBannerText,
  reasonsTitle,
  notesLabel,
  notesPlaceholder,
  confirmLabel,
  cancelLabel,
  reasonOptions,
  onConfirm,
}: SchoolArticleRejectModalProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setSelected([]);
      setNotes("");
      setSubmitting(false);
    }
  }, [open]);

  const toggle = (id: string) => {
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      const reasons = reasonOptions
        .filter((option) => selected.includes(option.id))
        .map((option) => option.label);
      await onConfirm({ reasons, notes: notes.trim() });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalShell open={open} onOpenChange={onOpenChange}>
      <div className="space-y-5 text-right">
        <div className="space-y-2">
          <ModalTitle>{title}</ModalTitle>
          <ModalDescription>{infoBannerText}</ModalDescription>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-700">{reasonsTitle}</p>
          <div className="flex flex-wrap justify-end gap-2">
            {reasonOptions.map((option) => {
              const active = selected.includes(option.id);
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => toggle(option.id)}
                  className={
                    active
                      ? "rounded-full bg-[#2B415E] px-3 py-1.5 text-xs font-bold text-white"
                      : "rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600"
                  }
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-medium text-slate-500">{notesLabel}</label>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={4}
            placeholder={notesPlaceholder}
            className="w-full resize-none rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-[#243B5A]/20"
          />
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {cancelLabel}
          </Button>
          <Button
            type="button"
            className="bg-rose-500 text-white hover:bg-rose-600"
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
