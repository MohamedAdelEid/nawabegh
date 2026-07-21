"use client";

import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { Button } from "@/shared/presentation/components/ui/button";

type ShortQuizSubmitModalProps = {
  open: boolean;
  answeredCount: number;
  totalQuestions: number;
  isSubmitting?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ShortQuizSubmitModal({
  open,
  answeredCount,
  totalQuestions,
  isSubmitting,
  onConfirm,
  onCancel,
}: ShortQuizSubmitModalProps) {
  const t = useTranslations("student.dashboard.shortQuiz.submit");
  if (!open) return null;

  const percent =
    totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="bg-[#2c4260] px-6 py-5 text-center text-white">
          <h2 className="text-xl font-bold">{t("title")}</h2>
        </div>
        <div className="space-y-5 p-6 text-center">
          <p className="text-base text-[#334155]">
            {t("summary", { answered: answeredCount, total: totalQuestions })}
          </p>
          <p className="text-sm text-[#64748b]">{t("warning")}</p>
          <div className="rounded-xl bg-[#f8fafc] px-4 py-3 text-sm font-bold text-[#2c4260]">
            {t("completion", { percent })}
          </div>
          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              className="h-12 flex-1 rounded-xl"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              {t("cancel")}
            </Button>
            <Button
              type="button"
              className="h-12 flex-1 rounded-xl bg-[#c7af6d] text-white hover:bg-[#b39f63]"
              onClick={onConfirm}
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
              {t("confirm")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
