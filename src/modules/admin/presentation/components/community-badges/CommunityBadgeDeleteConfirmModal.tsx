"use client";

import { X } from "lucide-react";
import { Button } from "@/shared/presentation/components/ui/button";
import {
  ModalDescription,
  ModalShell,
  ModalTitle,
} from "@/shared/presentation/components/ui/modal-shell";

type CommunityBadgeDeleteConfirmModalProps = {
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

export function CommunityBadgeDeleteConfirmModal({
  open,
  onOpenChange,
  itemName,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  isConfirming = false,
}: CommunityBadgeDeleteConfirmModalProps) {
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
            <span className="mt-2 block font-semibold text-slate-700">{itemName}</span>
          ) : null}
        </ModalDescription>

        <div className="flex w-full flex-col-reverse gap-3 sm:flex-row sm:justify-center">
          <Button
            type="button"
            variant="outline"
            className="h-11 rounded-xl px-6"
            onClick={() => onOpenChange(false)}
            disabled={isConfirming}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            className="h-11 rounded-xl bg-red-600 px-6 hover:bg-red-700"
            onClick={onConfirm}
            disabled={isConfirming}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </ModalShell>
  );
}
