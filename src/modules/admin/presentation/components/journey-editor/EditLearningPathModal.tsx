"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/shared/presentation/components/ui/button";
import {
  ModalDescription,
  ModalShell,
  ModalTitle,
} from "@/shared/presentation/components/ui/modal-shell";

export type EditLearningPathDraft = {
  title: string;
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTitle: string;
  onSave: (draft: EditLearningPathDraft) => Promise<boolean> | boolean;
  loading?: boolean;
}

export function EditLearningPathModal({
  open,
  onOpenChange,
  initialTitle,
  onSave,
  loading,
}: Props) {
  const t = useTranslations("admin.dashboard.journeyEditor.editLearningPathModal");
  const [title, setTitle] = useState(initialTitle);

  useEffect(() => {
    if (!open) return;
    setTitle(initialTitle);
  }, [initialTitle, open]);

  const canSubmit = title.trim().length > 0 && title.trim() !== initialTitle.trim();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit || loading) return;

    const saved = await onSave({ title: title.trim() });
    if (saved) {
      onOpenChange(false);
    }
  };

  return (
    <ModalShell
      open={open}
      onOpenChange={onOpenChange}
      overlayClassName="bg-[#2C4260]/30"
      panelClassName="w-[min(95vw,31rem)] p-7"
    >
      <ModalTitle className="text-right text-xl font-bold text-slate-800">
        {t("title")}
      </ModalTitle>
      <ModalDescription className="mt-2 text-right text-sm text-slate-500">
        {t("description")}
      </ModalDescription>

      <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
        <label className="block space-y-2 text-right">
          <span className="text-sm font-semibold text-slate-600">{t("pathTitle")}</span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder={t("pathTitlePlaceholder")}
            disabled={loading}
            className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-right text-sm outline-none transition-colors focus:border-[#C8AC59] disabled:cursor-not-allowed disabled:opacity-70"
          />
        </label>

        <div className="flex flex-col-reverse gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="flex-1 rounded-2xl py-3 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {t("cancel")}
          </button>
          <Button
            type="submit"
            disabled={!canSubmit || loading}
            className="h-12 flex-1 rounded-2xl bg-[#2C4260] text-white shadow-[0px_4px_0px_0px_#1E305080] hover:bg-[#1E3050]"
          >
            {loading ? t("saving") : t("save")}
          </Button>
        </div>
      </form>
    </ModalShell>
  );
}
