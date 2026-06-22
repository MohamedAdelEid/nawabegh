"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { resolveProtectedFileUrl } from "@/shared/infrastructure/files/fileUrl";

type BundlePreviewCardProps = {
  name: string;
  description: string;
  coverImageUrl: string | null;
  courseCount: number;
  bundlePrice: number | null;
  coursesTotalPrice: number;
};

function formatPrice(value: number): string {
  return value.toFixed(2);
}

export function BundlePreviewCard({
  name,
  description,
  coverImageUrl,
  courseCount,
  bundlePrice,
  coursesTotalPrice,
}: BundlePreviewCardProps) {
  const t = useTranslations("admin.dashboard.bundleManagement.form");

  const savings =
    bundlePrice !== null && bundlePrice > 0 && coursesTotalPrice > bundlePrice
      ? coursesTotalPrice - bundlePrice
      : 0;
  const savingsPercent =
    savings > 0 && coursesTotalPrice > 0
      ? Math.round((savings / coursesTotalPrice) * 100)
      : 0;

  const resolvedCoverImageUrl = resolveProtectedFileUrl(coverImageUrl);

  return (
    <Card className="overflow-hidden rounded-[1.75rem] border-none bg-[#1E3A66] text-white shadow-[0px_8px_0px_0px_#0000000D]">
      <CardContent className="space-y-4 p-0">
        <div className="relative aspect-[4/3] bg-[#243B5A]">
          {resolvedCoverImageUrl ? (
            <Image src={resolvedCoverImageUrl} alt="" fill unoptimized className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-4xl opacity-40">📚</div>
          )}
          <span className="absolute right-4 top-4 rounded-full bg-[#C7AF6E] px-3 py-1 text-xs font-bold text-[#1E3A66]">
            {t("fields.previewCoursesBadge", { count: courseCount })}
          </span>
        </div>
        <div className="space-y-3 px-5 pb-5 text-right">
          <h3 className="text-lg font-bold">
            {name.trim() || t("fields.previewNamePlaceholder")}
          </h3>
          <p className="text-sm leading-7 text-slate-300">
            {description.trim() || t("fields.previewDescriptionPlaceholder")}
          </p>
          <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-4">
            <div className="flex -space-x-2 rtl:space-x-reverse">
              {Array.from({ length: Math.min(3, courseCount) }).map((_, index) => (
                <span
                  key={index}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#1E3A66] bg-slate-400 text-xs"
                />
              ))}
            </div>
            <div className="text-left">
              <p className="text-lg font-bold">
                {bundlePrice !== null && bundlePrice > 0
                  ? `${formatPrice(bundlePrice)} ر.س`
                  : t("fields.previewPricePlaceholder")}
              </p>
              {savings > 0 ? (
                <p className="text-xs text-[#C7AF6E]">
                  {t("fields.previewSavings", {
                    amount: formatPrice(savings),
                    percent: savingsPercent,
                  })}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
