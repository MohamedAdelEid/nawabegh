"use client";

import { X } from "lucide-react";
import { Button } from "@/shared/presentation/components/ui/button";
import {
  ModalDescription,
  ModalShell,
  ModalTitle,
} from "@/shared/presentation/components/ui/modal-shell";

export type ExamDeleteConfirmModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemName?: string;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  isConfirming?: boolean;
};

export function ExamDeleteConfirmModal({
  open,
  onOpenChange,
  itemName,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  isConfirming = false,
}: ExamDeleteConfirmModalProps) {
  return (
    <ModalShell
      open={open}
      onOpenChange={onOpenChange}
      panelClassName="w-[90vw] max-w-md rounded-3xl border-transparent p-6 sm:p-8"
      overlayClassName="bg-black/40"
    >
      <div className="flex flex-col items-center text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
          <X className="h-10 w-10 text-red-500" strokeWidth={2.5} />
        </div>

        <ModalTitle className="mb-2 text-2xl font-bold text-slate-800">{title}</ModalTitle>

        <ModalDescription className="mb-8 max-w-sm text-sm leading-relaxed text-slate-500">
          {description}
          {itemName ? (
            <span className="mt-1 block font-semibold text-slate-700">{itemName}</span>
          ) : null}
        </ModalDescription>

        <div className="flex w-full flex-col gap-3">
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isConfirming}
            className="h-14 w-full rounded-2xl bg-[#F25555] text-base font-semibold text-white shadow-[0_4px_0_0_#C43D3D] transition-all hover:bg-[#E04444] active:translate-y-1 active:shadow-none disabled:opacity-70"
          >
            {confirmLabel}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={isConfirming}
            onClick={() => onOpenChange(false)}
            className="h-14 w-full rounded-2xl border-2 border-slate-200 bg-white text-base font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            {cancelLabel}
          </Button>
        </div>
      </div>
    </ModalShell>
  );
}
