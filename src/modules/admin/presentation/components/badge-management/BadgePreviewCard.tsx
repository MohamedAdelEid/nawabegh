"use client";

import Image from "next/image";
import { Award, Check, Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { resolveFileUrl } from "@/shared/infrastructure/files/fileUrl";
import { cn } from "@/shared/application/lib/cn";

export type BadgePreviewCardProps = {
  name: string;
  description: string;
  iconUrl: string | null;
  requiredPoints: number;
  className?: string;
};

export function BadgePreviewCard({
  name,
  description,
  iconUrl,
  requiredPoints,
  className,
}: BadgePreviewCardProps) {
  const t = useTranslations("admin.dashboard.badgeManagement.form");
  const resolvedIcon = iconUrl ? resolveFileUrl(iconUrl) : null;

  return (
    <div className={cn("space-y-4", className)}>
      <p className="text-center text-sm font-bold text-slate-700">{t("previewTitle")}</p>
      <div className="rounded-[1.5rem] border border-slate-100 bg-white p-6 shadow-[0_8px_24px_rgba(44,66,96,0.08)]">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-[#F5EDE0]">
            {resolvedIcon ? (
              <Image src={resolvedIcon} alt="" width={48} height={48} unoptimized className="object-contain" />
            ) : (
              <Award className="h-10 w-10 text-[#C7AF6E]" aria-hidden />
            )}
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
            {t("previewLevel")}
          </span>
          <div className="space-y-2">
            <p className="text-lg font-bold text-[#2C4260]">
              {name.trim() || t("namePlaceholder")}
            </p>
            <p className="text-sm leading-relaxed text-slate-500">
              {description.trim() || t("descriptionPlaceholder")}
            </p>
          </div>
          <div className="flex w-full items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Star className="h-4 w-4 text-[#C7AF6E]" aria-hidden />
              <span>{t("previewRequiredPoints")}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-[#2C4260]">
                {Number.isFinite(requiredPoints) ? requiredPoints : 0}
              </span>
              <Check className="h-4 w-4 text-emerald-500" aria-hidden />
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-right">
        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white">
          i
        </span>
        <p className="text-xs leading-relaxed text-emerald-800">{t("previewInfo")}</p>
      </div>
    </div>
  );
}
