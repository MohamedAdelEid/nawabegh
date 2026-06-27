"use client";

import { Check, CreditCard, GraduationCap, Landmark, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/shared/application/lib/cn";

type CheckoutStepperProps = {
  currentStep: 1 | 2 | 3 | 4;
};

const STEPS = [
  { id: 1, icon: Check, labelKey: "dataEntry" as const },
  { id: 2, icon: Landmark, labelKey: "bankVerification" as const },
  { id: 3, icon: CreditCard, labelKey: "paymentConfirm" as const },
  { id: 4, icon: GraduationCap, labelKey: "courseActivation" as const },
];

export function CheckoutStepper({ currentStep }: CheckoutStepperProps) {
  const t = useTranslations("student.dashboard.checkout.stepper");

  return (
    <ol className="mb-8 flex flex-wrap items-center justify-center gap-2 md:gap-4">
      {STEPS.map((step, index) => {
        const isComplete = step.id < currentStep;
        const isCurrent = step.id === currentStep;
        const Icon = step.icon;

        return (
          <li key={step.id} className="flex items-center gap-2 md:gap-4">
            <div className="flex flex-col items-center gap-1">
              <span
                className={cn(
                  "flex size-10 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors",
                  isComplete && "border-emerald-500 bg-emerald-500 text-white",
                  isCurrent && "border-[#c7af6d] bg-[#c7af6d] text-white",
                  !isComplete && !isCurrent && "border-[#e2e8f0] bg-white text-[#94a3b8]",
                )}
              >
                {isComplete ? (
                  <Check className="size-4" aria-hidden />
                ) : isCurrent && currentStep === 2 ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                ) : (
                  <Icon className="size-4" aria-hidden />
                )}
              </span>
              <span
                className={cn(
                  "hidden text-center text-[10px] font-bold md:block",
                  isCurrent ? "text-[#2b415e]" : "text-[#94a3b8]",
                )}
              >
                {t(step.labelKey)}
              </span>
            </div>
            {index < STEPS.length - 1 ? (
              <span
                className={cn(
                  "hidden h-0.5 w-8 md:block lg:w-16",
                  step.id < currentStep ? "bg-[#c7af6d]" : "bg-[#e2e8f0]",
                )}
                aria-hidden
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
