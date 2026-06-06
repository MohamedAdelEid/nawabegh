"use client";

import { AlertTriangle, Trash2, X } from "lucide-react";
import type { AdTableRow } from "@/modules/admin/domain/types/adManagement.types";
import { DashboardBadge } from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";
import {
  ModalDescription,
  ModalShell,
  ModalTitle,
} from "@/shared/presentation/components/ui/modal-shell";

type AdDeleteConfirmModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ad: AdTableRow | null;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  typeLabel: string;
  audienceLabel: string;
  createdLabel: string;
  onConfirm: () => void;
  isConfirming?: boolean;
};

export function AdDeleteConfirmModal({
  open,
  onOpenChange,
  ad,
  title,
  description,
  confirmLabel,
  cancelLabel,
  typeLabel,
  audienceLabel,
  createdLabel,
  onConfirm,
  isConfirming = false,
}: AdDeleteConfirmModalProps) {
  return (
    <ModalShell
      open={open}
      onOpenChange={onOpenChange}
      panelClassName="w-[90vw] max-w-lg rounded-3xl border-transparent p-6 sm:p-8"
      overlayClassName="bg-black/40 backdrop-blur-sm"
    >
      <div className="space-y-6 text-right">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-rose-100">
            <AlertTriangle className="h-6 w-6 text-rose-600" aria-hidden />
          </div>
          <div className="space-y-2">
            <ModalTitle className="text-xl font-bold text-rose-600">{title}</ModalTitle>
            <ModalDescription className="text-sm leading-relaxed text-slate-500">
              {description}
            </ModalDescription>
          </div>
        </div>

        {ad ? (
          <div className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
            <p className="font-semibold text-slate-800">{ad.title}</p>
            <div className="flex flex-wrap items-center gap-2">
              <DashboardBadge tone="gold">{typeLabel}</DashboardBadge>
              <span className="text-xs text-slate-500">
                {audienceLabel}: {ad.audiences.join(", ")}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {createdLabel}: {ad.createdAt} · ID: {ad.displayId}
            </p>
          </div>
        ) : null}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="h-12 rounded-2xl"
            onClick={() => onOpenChange(false)}
            disabled={isConfirming}
          >
            <X className="ms-2 h-4 w-4" aria-hidden />
            {cancelLabel}
          </Button>
          <Button
            type="button"
            className="h-12 rounded-2xl bg-rose-500 text-white hover:bg-rose-600"
            onClick={onConfirm}
            disabled={isConfirming}
          >
            <Trash2 className="ms-2 h-4 w-4" aria-hidden />
            {confirmLabel}
          </Button>
        </div>
      </div>
    </ModalShell>
  );
}
