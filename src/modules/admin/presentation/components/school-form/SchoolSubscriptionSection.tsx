"use client";

import type React from "react";
import type {
  SchoolEducationStageId,
  SchoolSelectOption,
  SchoolSubscriptionPlanId,
} from "@/modules/admin/domain/types/schoolForm.types";
import { cn } from "@/shared/application/lib/cn";
import { SchoolFormSectionCard } from "./SchoolFormSectionCard";
import CheckIcon from "@/modules/admin/presentation/assets/icons/checked.svg";

interface LocalizedOption<T extends string> extends SchoolSelectOption<T> {
  label: string;
  description?: string;
}

interface SchoolSubscriptionSectionProps {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  planLabel: string;
  stagesLabel: string;
  selectedPlanId: SchoolSubscriptionPlanId;
  selectedStageIds: SchoolEducationStageId[];
  plans: LocalizedOption<SchoolSubscriptionPlanId>[];
  stages: LocalizedOption<SchoolEducationStageId>[];
  onPlanChange: (planId: SchoolSubscriptionPlanId) => void;
  onStageToggle: (stageId: SchoolEducationStageId) => void;
}

export function SchoolSubscriptionSection({
  icon,
  title,
  planLabel,
  stagesLabel,
  selectedPlanId,
  selectedStageIds,
  plans,
  stages,
  onPlanChange,
  onStageToggle,
}: SchoolSubscriptionSectionProps) {
  return (
    <SchoolFormSectionCard icon={icon} title={title}>
      <div className="space-y-6">
        <div className="space-y-3 text-right">
          <p className="text-sm font-medium text-[#64748B]">{planLabel}</p>
          <div className="grid gap-4 md:grid-cols-3">
            {plans.map((plan) => {
              const isSelected = plan.id === selectedPlanId;
              return (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => onPlanChange(plan.id)}
                  className={cn(
                    "relative rounded-[1.25rem] border px-4 py-5 text-right transition-colors",
                    isSelected
                      ? "border-[#C7AF6E] bg-[#FFFDF7] shadow-[inset_0_0_0_1px_rgba(199,175,110,0.25)]"
                      : "border-slate-100 bg-white hover:border-slate-200",
                  )}
                >
                  <p className="text-lg font-semibold text-slate-800">{plan.label}</p>
                  {plan.description ? (
                    <p className="mt-1 text-xs text-slate-400">{plan.description}</p>
                  ) : null}
                  {isSelected ? 
                  <img src={CheckIcon.src} alt="Checked" width={12} height={12} aria-hidden className="absolute top-[10%] left-[2%]"/>
                  : null}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3 text-right">
          <p className="text-sm font-medium text-[#64748B]">{stagesLabel}</p>
          <div className="grid gap-4 md:grid-cols-3">
            {stages.map((stage) => {
              const isSelected = selectedStageIds.includes(stage.id);
              return (
                <button
                  key={stage.id}
                  type="button"
                  onClick={() => onStageToggle(stage.id)}
                  className={cn(
                    "flex items-center justify-end gap-4 rounded-[1.1rem] border px-4 py-4 text-right transition-colors bg-slate-50 hover:border-slate-200",
                    isSelected
                      ? "border-[#2C4260] border-2 text-[#2C4260]"
                      : "border-slate-100 text-slate-500 hover:border-slate-200",
                  )}
                >
                  <span className="font-medium">{stage.label}</span>
                  <span
                    className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-md border text-xs font-bold",
                      isSelected
                        ? "border-[#2C4260] bg-[#2C4260] text-white"
                        : "border-[#CBD5E1] bg-white text-transparent",
                    )}
                  >
                    ✓
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </SchoolFormSectionCard>
  );
}
