"use client";

import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/shared/application/lib/cn";
import type { AdCreateWizardStepId } from "@/modules/admin/domain/types/adCreateWizard.types";
import { AD_CREATE_WIZARD_STEPS } from "@/modules/admin/domain/types/adCreateWizard.types";
import {
  Calendar,
  Eye,
  FilePenLine,
  LayoutGrid,
  Target,
} from "lucide-react";

const STEP_ICONS: Record<AdCreateWizardStepId, ReactNode> = {
  content: <FilePenLine className="h-4 w-4" />,
  type: <LayoutGrid className="h-4 w-4" />,
  targeting: <Target className="h-4 w-4" />,
  scheduling: <Calendar className="h-4 w-4" />,
  preview: <Eye className="h-4 w-4" />,
};

export function AdCreateSmartDraftBadge() {
  const t = useTranslations("admin.dashboard.adManagement.create");
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
      <Sparkles className="h-4 w-4" aria-hidden />
      {t("smartDraftBadge")}
    </span>
  );
}

export function AdCreateStepper({
  activeStep,
  onStepClick,
}: {
  activeStep: AdCreateWizardStepId;
  onStepClick?: (step: AdCreateWizardStepId) => void;
}) {
  const t = useTranslations("admin.dashboard.adManagement.create.steps");
  const activeIndex = AD_CREATE_WIZARD_STEPS.indexOf(activeStep);

  return (
    <div className="rounded-[1.75rem] border border-white/80 bg-white p-4 shadow-[0px_8px_0px_0px_#0000000D]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {AD_CREATE_WIZARD_STEPS.map((step, index) => {
          const isActive = step === activeStep;
          const isComplete = index < activeIndex;
          return (
            <div key={step} className={cn("flex  items-center gap-2", index > 0 ? "flex-1" : "")}>
              {index > 0 ? (
                <div
                  className={cn(
                    "hidden h-0.5 flex-1 sm:block",
                    isComplete || isActive ? "bg-[#2C4260]" : "bg-slate-200",
                  )}
                />
              ) : null}
              <button
                type="button"
                onClick={() => onStepClick?.(step)}
                className="flex flex-col items-center gap-2 text-center"
              >
                <span
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full transition-colors",
                    isActive
                      ? "bg-[#2C4260] text-white"
                      : isComplete
                        ? "bg-[#2C4260]/10 text-[#2C4260]"
                        : "bg-slate-100 text-slate-400",
                  )}
                >
                  {STEP_ICONS[step]}
                </span>
                <span
                  className={cn(
                    "text-xs font-semibold",
                    isActive ? "text-[#2C4260]" : "text-slate-400",
                  )}
                >
                  {t(step)}
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function AdCreateWizardFooter({
  onCancel,
  onSaveDraft,
  onBack,
  onNext,
  nextLabel,
  showBack,
  isSubmitting,
}: {
  onCancel: () => void;
  onSaveDraft: () => void;
  onBack?: () => void;
  onNext: () => void;
  nextLabel: string;
  showBack?: boolean;
  isSubmitting?: boolean;
}) {
  const t = useTranslations("admin.dashboard.adManagement.create.actions");

  return (
    <div className="sticky bottom-0 z-10 flex flex-wrap items-center justify-between gap-4 rounded-[1.75rem] border border-white/80 bg-white p-4 shadow-[0px_8px_0px_0px_#0000000D]">
      <button
        type="button"
        onClick={onCancel}
        className="rounded-2xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
      >
        {t("cancel")}
      </button>
      <button
        type="button"
        onClick={onSaveDraft}
        disabled={isSubmitting}
        className="text-sm font-semibold text-[#2C4260] hover:underline disabled:opacity-50"
      >
        {t("saveDraft")}
      </button>
      <div className="flex gap-3">
        {showBack ? (
          <button
            type="button"
            onClick={onBack}
            className="rounded-2xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-600"
          >
            {t("back")}
          </button>
        ) : null}
        <button
          type="button"
          onClick={onNext}
          disabled={isSubmitting}
          className="rounded-2xl bg-[#2C4260] px-6 py-3 text-sm font-semibold text-white hover:bg-[#243751] disabled:opacity-60"
        >
          {nextLabel}
        </button>
      </div>
    </div>
  );
}
