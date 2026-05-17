"use client";

import { Trash2, CheckCircle2 } from "lucide-react";
import { Button } from "@/shared/presentation/components/ui/button";
import {
  ModalDescription,
  ModalShell,
  ModalTitle,
} from "@/shared/presentation/components/ui/modal-shell";

interface ArticleDeleteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  articleTitle?: string;
  title: string;
  description: string;
  selectedLabel: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
}

export function ArticleDeleteModal({
  open,
  onOpenChange,
  articleTitle,
  title,
  description,
  selectedLabel,
  confirmLabel,
  cancelLabel,
  onConfirm,
}: ArticleDeleteModalProps) {
  return (
    <ModalShell open={open} onOpenChange={onOpenChange}>
      <div className="space-y-10">
        <div className="flex flex-row items-start gap-5">
          <div className="rounded-2xl bg-red-50 p-3 text-red-500">
            <Trash2 className="h-7 w-7" />
          </div>
          <div className="">
            <ModalTitle className="text-lg font-extrabold tracking-tight text-[#1E3A66]">
              {title}
            </ModalTitle>
            <ModalDescription className="leading-relaxed text-[#6C82A8]">
              {description}
            </ModalDescription>
          </div>
        </div>

        {articleTitle ? (
          <div className="rounded-2xl border border-[#F1F5F9] bg-[#F8F9FA] px-5 py-4 text-right">
            <p className="text-sm font-semibold text-[#9AA9C5]">{selectedLabel}</p>
            <p className="text-lg font-bold text-[#1E3A66]">{articleTitle}</p>
          </div>
        ) : null}

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
            onClick={onConfirm}
            className="h-16 rounded-2xl bg-[#FF4B4B] text-lg font-extrabold text-white shadow-[0_5px_0_0_#CC3434] hover:bg-[#F24545]"
          >
            <CheckCircle2 className="h-8 w-8" />
            {confirmLabel}
          </Button>
        </div>
      </div>
    </ModalShell>
  );
}
