"use client";

import { useLocale, useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { cn } from "@/shared/application/lib/cn";
import type { Grade } from "@/shared/domain/types/grade.types";
import { FieldError } from "@/shared/presentation/components/ui/field";

type AccountGradeFieldProps = {
  grades: Grade[];
  value: number | null;
  onChange: (gradeId: number) => void;
  error?: string;
  disabled?: boolean;
};

export function AccountGradeField({
  grades,
  value,
  onChange,
  error,
  disabled = false,
}: AccountGradeFieldProps) {
  const t = useTranslations("auth.registration");
  const locale = useLocale();

  return (
    <div className="flex flex-col gap-3 pb-6">
      <span className="text-sm font-bold text-[var(--dashboard-primary)]">
        {t("fields.grade.label")}
      </span>

      <div
        role="radiogroup"
        aria-label={t("fields.grade.label")}
        className="grid grid-cols-1 gap-3 sm:grid-cols-3"
      >
        {grades.map((grade) => {
          const isSelected = grade.id === value;
          const label = locale === "ar" ? grade.nameAr : grade.nameEn;

          return (
            <motion.button
              key={grade.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={disabled}
              onClick={() => onChange(grade.id)}
              whileHover={disabled ? undefined : { y: -1 }}
              whileTap={disabled ? undefined : { scale: 0.98 }}
              className={cn(
                "rounded-lg border-2 px-4 py-3.5 text-center text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--dashboard-primary)]",
                isSelected
                  ? "border-[var(--dashboard-primary)] bg-[#dbe3f3] font-bold text-[var(--dashboard-primary)]"
                  : "border-[var(--auth-border)] bg-white font-medium text-slate-500",
                disabled && "cursor-not-allowed opacity-60",
              )}
            >
              {label}
            </motion.button>
          );
        })}
      </div>

      {grades.length === 0 ? (
        <p className="text-center text-sm text-slate-500">{t("fields.grade.empty")}</p>
      ) : null}

      <FieldError message={error} />
    </div>
  );
}
