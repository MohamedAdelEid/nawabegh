"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/shared/presentation/components/ui/button";
import { LabeledInput } from "@/shared/presentation/components/ui/labeled-input";
import {
  ModalDescription,
  ModalShell,
  ModalTitle,
} from "@/shared/presentation/components/ui/modal-shell";

type TeacherChatReasonModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  placeholder: string;
  isPending?: boolean;
  onConfirm: (reason: string) => Promise<void>;
};

export function TeacherChatReasonModal({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  placeholder,
  isPending = false,
  onConfirm,
}: TeacherChatReasonModalProps) {
  const t = useTranslations("teacher.dashboard.chatGroups.common");
  const [reason, setReason] = useState("");

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) setReason("");
    onOpenChange(nextOpen);
  };

  const handleConfirm = async () => {
    const trimmed = reason.trim();
    if (!trimmed) return;
    await onConfirm(trimmed);
    setReason("");
    onOpenChange(false);
  };

  return (
    <ModalShell open={open} onOpenChange={handleOpenChange}>
      <div className="space-y-5 text-right">
        <ModalTitle className="text-lg font-bold text-slate-800">{title}</ModalTitle>
        <ModalDescription className="text-sm text-slate-500">{description}</ModalDescription>
        <LabeledInput
          label={placeholder}
          value={reason}
          placeholder={placeholder}
          onChange={setReason}
        />
        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
            {t("cancel")}
          </Button>
          <Button
            type="button"
            className="bg-[#243B5A]"
            disabled={!reason.trim() || isPending}
            onClick={() => void handleConfirm()}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </ModalShell>
  );
}
