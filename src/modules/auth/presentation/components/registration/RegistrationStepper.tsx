"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/shared/application/lib/cn";
import {
  REGISTRATION_STEPS,
  getRegistrationStepIndex,
} from "@/modules/auth/application/constants/registrationSteps";
import { useRegistrationStore } from "@/modules/auth/presentation/store/registrationStore";

export function RegistrationStepper() {
  const t = useTranslations("auth.registration");
  const currentStep = useRegistrationStore((state) => state.currentStep);
  const isStepCompleted = useRegistrationStore((state) => state.isStepCompleted);
  const canNavigateToStep = useRegistrationStore((state) => state.canNavigateToStep);
  const goToStep = useRegistrationStore((state) => state.goToStep);

  const currentIndex = getRegistrationStepIndex(currentStep);
  const orderedSteps = [...REGISTRATION_STEPS].sort((a, b) => a.order - b.order);

  return (
    <nav aria-label={t("stepper.ariaLabel")} className="w-full px-1 pt-2">
      <ol className="flex w-full items-start">
        {orderedSteps.map((step, index) => {
          const stepIndex = getRegistrationStepIndex(step.id);
          const isActive = step.id === currentStep;
          const isComplete = isStepCompleted(step.id) && !isActive;
          const canNavigate = canNavigateToStep(step.id) && !isActive;
          const isFuture = stepIndex > currentIndex;
          const isDisabled = isFuture && !canNavigate;
          const previousStep = index > 0 ? orderedSteps[index - 1] : null;
          const connectorFilled =
            index > 0 &&
            (currentIndex >= index ||
              (previousStep != null && isStepCompleted(previousStep.id)));

          const circle = (
            <motion.span
              layout
              className={cn(
                "relative z-[1] flex size-10 items-center justify-center rounded-full border-2",
                isActive &&
                  "border-[var(--dashboard-primary)] bg-[var(--dashboard-primary)] text-white shadow-[0_0_0_4px_rgba(43,65,94,0.1)]",
                isComplete &&
                  !isActive &&
                  "border-[var(--dashboard-primary)] bg-[var(--dashboard-primary)] text-white",
                !isActive &&
                  !isComplete &&
                  "border-[var(--auth-border)] bg-white text-[#cbd5e1]",
              )}
              animate={isActive ? { scale: [1, 1.05, 1] } : { scale: 1 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              {isComplete ? (
                <Check className="size-4" aria-hidden />
              ) : (
                <span className="text-base font-bold leading-none">{step.order}</span>
              )}
            </motion.span>
          );

          return (
            <li key={step.id} className={cn("flex items-start", step.id === "account" ? "" : "flex-1")}  >
              {index > 0 ? (
                <span
                  aria-hidden
                  className="relative top-5 h-0.5 min-w-4 flex-1 bg-[var(--auth-border)]"
                >
                  <motion.span
                    className="absolute inset-y-0 start-0 bg-[var(--dashboard-primary)]"
                    initial={false}
                    animate={{ width: connectorFilled ? "100%" : "0%" }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                  />
                </span>
              ) : null}

              <div className={cn("flex shrink-0 flex-col items-center gap-2", step.id === "account" ? "px-2" : "px-1")}>
                {canNavigate ? (
                  <button
                    type="button"
                    onClick={() => goToStep(step.id)}
                    aria-current={isActive ? "step" : undefined}
                    className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[var(--dashboard-primary)]"
                  >
                    {circle}
                  </button>
                ) : (
                  <span
                    aria-current={isActive ? "step" : undefined}
                    aria-disabled={isDisabled || undefined}
                    className={cn(isDisabled && "cursor-not-allowed opacity-70")}
                  >
                    {circle}
                  </span>
                )}
                <span
                  className={cn(
                    "whitespace-nowrap text-xs font-bold",
                    isActive ? "text-[var(--dashboard-primary)]" : "text-[#94a3b8]",
                  )}
                >
                  {t(step.labelKey)}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
