"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Check, X } from "lucide-react";
import { Button } from "@/shared/presentation/components/ui/button";
import { cn } from "@/shared/application/lib/cn";
import { ModalClose, ModalShell, ModalTitle } from "@/shared/presentation/components/ui/modal-shell";
import { Paind } from "../../assets/icons/Paind";

export type RejectReason = "inaccurateInfo" | "inappropriate" | "policyViolation" | "formatWeak";

interface RejectReasonOption {
  id: RejectReason;
  label: string;
}

interface ArticleRejectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  infoBannerText: string;
  reasonsTitle: string;
  notesLabel: string;
  notesPlaceholder: string;
  confirmLabel: string;
  cancelLabel: string;
  closeLabel: string;
  reasonOptions: RejectReasonOption[];
  onConfirm: (payload: { reasons: RejectReason[]; notes: string }) => void;
}

export function ArticleRejectModal({
  open,
  onOpenChange,
  title,
  infoBannerText,
  reasonsTitle,
  notesLabel,
  notesPlaceholder,
  confirmLabel,
  cancelLabel,
  closeLabel,
  reasonOptions,
  onConfirm,
}: ArticleRejectModalProps) {
  const [reasons, setReasons] = useState<RejectReason[]>([]);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!open) {
      setReasons([]);
      setNotes("");
    }
  }, [open]);

  const reasonMap = useMemo(
    () => new Map(reasonOptions.map((option) => [option.id, option.label])),
    [reasonOptions],
  );

  const toggleReason = (reason: RejectReason) => {
    setReasons((prev) =>
      prev.includes(reason) ? prev.filter((item) => item !== reason) : [...prev, reason],
    );
  };

  return (
    <ModalShell open={open} onOpenChange={onOpenChange} >
      <div className="space-y-7 text-right">
        <div className="flex items-center justify-between">
          <ModalTitle className="text-xl font-extrabold tracking-tight text-[#1E3A66]">
            {title}
          </ModalTitle>
          <ModalClose asChild>
            <button
              type="button"
              className="rounded-xl p-2 text-[#A9B7D0] transition-colors hover:bg-slate-50 hover:text-[#6C82A8]"
              aria-label={closeLabel}
            >
              <X className="h-7 w-7" />
            </button>
          </ModalClose>
        </div>

        <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-[#E55353]">
          <div className="flex items-center gap-3">
            <Paind/>
            <p className="text-md font-semibold leading-relaxed">{infoBannerText}</p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-extrabold text-[#1E3A66]">{reasonsTitle}</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {reasonOptions.map((option) => {
              const active = reasons.includes(option.id);
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => toggleReason(option.id)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border-2 px-4 py-3 transition-colors",
                    active
                      ? "border-red-200 bg-red-50 text-[#E55353]"
                      : "border-[#EEF4FD] bg-white text-[#6C82A8] hover:bg-slate-50",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-md border",
                      active ? "border-red-400 bg-[#FF4B4B] text-white" : "border-[#D9E3F1] bg-white",
                    )}
                  >
                    <Check className="text-white"/>
                  </span>
                  <span className="text-md font-bold">{reasonMap.get(option.id)}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-lg font-extrabold text-[#1E3A66]">{notesLabel}</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={5}
            placeholder={notesPlaceholder}
            className="w-full resize-none rounded-2xl border border-[#E6EDF8] px-4 py-4 text-right text-md text-slate-700 placeholder:text-[#A9B7D0] focus:outline-none focus:ring-2 focus:ring-[#FF4B4B]/25"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-16 rounded-2xl border-2 border-[#E2EAF6] text-lg font-extrabold text-[#5C7093]"
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            onClick={() => onConfirm({ reasons, notes: notes.trim() })}
            className="h-16 rounded-2xl bg-[#FF4B4B] text-lg font-extrabold text-white shadow-[0_5px_0_0_#CC3434] hover:bg-[#F24545]"
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </ModalShell>
  );
}
