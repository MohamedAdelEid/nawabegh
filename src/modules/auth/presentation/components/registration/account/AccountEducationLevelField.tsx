"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { cn } from "@/shared/application/lib/cn";
import { resolveFileUrl } from "@/shared/infrastructure/files/fileUrl";
import type { EducationLevel } from "@/shared/domain/types/education-level.types";
import { FieldError } from "@/shared/presentation/components/ui/field";

type AccountEducationLevelFieldProps = {
  levels: EducationLevel[];
  value: number | null;
  onChange: (educationLevelId: number) => void;
  error?: string;
  disabled?: boolean;
};

export function AccountEducationLevelField({
  levels,
  value,
  onChange,
  error,
  disabled = false,
}: AccountEducationLevelFieldProps) {
  const t = useTranslations("auth.registration");
  const locale = useLocale();

  return (
    <div className="flex flex-col gap-4">
      <span className="text-sm font-bold text-[var(--dashboard-primary)]">
        {t("fields.educationLevel.label")}
      </span>

      <div
        role="radiogroup"
        aria-label={t("fields.educationLevel.label")}
        className="grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        {levels.map((level) => {
          const isSelected = level.id === value;
          const label = locale === "ar" ? level.nameAr : level.nameEn;
          const iconUrl = level.icon ? resolveFileUrl(level.icon) : null;

          return (
            <motion.button
              key={level.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={disabled}
              onClick={() => onChange(level.id)}
              whileHover={disabled ? undefined : { y: -2 }}
              whileTap={disabled ? undefined : { scale: 0.98 }}
              className={cn(
                "flex flex-col items-center gap-2 rounded-xl border-2 p-[18px] outline-none focus-visible:ring-2 focus-visible:ring-[var(--dashboard-primary)]",
                isSelected
                  ? "border-[var(--dashboard-primary)] bg-[#dbe3f3]"
                  : "border-[var(--auth-border)] bg-white",
                disabled && "cursor-not-allowed opacity-60",
              )}
            >
              {iconUrl ? (
                <span className="flex size-12 items-center justify-center overflow-hidden rounded-full bg-[#f1f5f9]">
                  <Image
                    src={iconUrl}
                    alt=""
                    width={48}
                    height={48}
                    className="size-12 object-contain"
                    unoptimized
                  />
                </span>
              ) : null}
              <span
                className={cn(
                  "text-center text-base font-bold",
                  isSelected ? "text-[#1e2e42]" : "text-slate-900",
                )}
              >
                {label}
              </span>
            </motion.button>
          );
        })}
      </div>

      {levels.length === 0 ? (
        <p className="text-center text-sm text-slate-500">{t("fields.educationLevel.empty")}</p>
      ) : null}

      <FieldError message={error} />
    </div>
  );
}
