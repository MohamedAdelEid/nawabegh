"use client";

import { GitBranch, Info, Wallet } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/shared/application/lib/cn";

export type TeacherCourseFormStep = "basic" | "pricing" | "paths";

const steps: Array<{ id: TeacherCourseFormStep; icon: typeof Info }> = [
  { id: "basic", icon: Info },
  { id: "pricing", icon: Wallet },
  { id: "paths", icon: GitBranch },
];

export function TeacherCourseFormStepper({
  activeStep,
}: {
  activeStep: TeacherCourseFormStep;
}) {
  const t = useTranslations("teacher.dashboard");

  return (
    <nav aria-label={t("courses.create.stepper.ariaLabel")} className="w-full">
      <ol className="flex w-full items-center justify-between gap-2">
        {steps.map((step, index) => {
          const isActive = step.id === activeStep;
          const isPast = steps.findIndex((item) => item.id === activeStep) > index;
          const Icon = step.icon;

          return (
            <li key={step.id} className="flex flex-1 items-center gap-2">
              <div className="flex flex-col items-center gap-2 text-center">
                <span
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-full border-2",
                    isActive && "border-[#2C4260] bg-[#2C4260] text-white",
                    isPast && !isActive && "border-[#2C4260] bg-[#2C4260] text-white",
                    !isActive && !isPast && "border-slate-200 bg-white text-slate-400",
                  )}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span
                  className={cn(
                    "text-xs font-medium",
                    isActive || isPast ? "text-[#2C4260]" : "text-slate-400",
                  )}
                >
                  {t(`courses.create.steps.${step.id}`)}
                </span>
              </div>
              {index < steps.length - 1 ? (
                <div
                  className={cn(
                    "mb-6 hidden h-0.5 flex-1 md:block",
                    isPast ? "bg-[#2C4260]" : "bg-slate-200",
                  )}
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
