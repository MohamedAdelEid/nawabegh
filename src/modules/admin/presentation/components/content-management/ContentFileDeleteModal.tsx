"use client";

import { CheckCircle2, Trash2 } from "lucide-react";
import { Button } from "@/shared/presentation/components/ui/button";
import {
  ModalDescription,
  ModalShell,
  ModalTitle,
} from "@/shared/presentation/components/ui/modal-shell";

interface ContentFileDeleteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void | Promise<void>;
}

export function ContentFileDeleteModal({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
}: ContentFileDeleteModalProps) {
  return (
    <ModalShell
      open={open}
      onOpenChange={onOpenChange}
      panelClassName="w-[min(95vw,30rem)] rounded-[1.5rem]"
    >
      <div className="space-y-8 text-right">
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-[#FF4B4B]">
            <Trash2 className="h-7 w-7" aria-hidden />
          </div>
          <div className="space-y-2">
            <ModalTitle className="text-3xl font-extrabold text-[#1E3A66]">
              {title}
            </ModalTitle>
            <ModalDescription className="text-base text-slate-500">
              {description}
            </ModalDescription>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Button
            type="button"
            onClick={() => onConfirm()}
            className="h-12 rounded-xl bg-[#FF4B4B] text-base font-bold text-white shadow-[0px_4px_0px_0px_#D33131] hover:bg-[#EB4343]"
          >
            <CheckCircle2 className="h-5 w-5" aria-hidden />
            {confirmLabel}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-12 rounded-xl border-[#E2E8F0] text-base font-bold text-slate-500"
          >
            {cancelLabel}
          </Button>
        </div>
      </div>
    </ModalShell>
  );
}
