"use client";

import { BookOpen, Eye, Lightbulb } from "lucide-react";
import { useTranslations } from "next-intl";
import type { TeacherCoursePricingType } from "@/modules/teacher/domain/types/teacher.types";
import { resolveFileUrl } from "@/shared/infrastructure/files/fileUrl";
import { Button } from "@/shared/presentation/components/ui/button";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";

type PreviewProps = {
  title: string;
  subjectLabel: string;
  gradeLabel: string;
  pricingType: TeacherCoursePricingType;
  offerPrice: string;
  coverImageUrl?: string;
};

export function TeacherCourseCreatePreviewSidebar({
  title,
  subjectLabel,
  gradeLabel,
  pricingType,
  offerPrice,
  coverImageUrl,
}: PreviewProps) {
  const t = useTranslations("teacher.dashboard");
  const displayTitle = title.trim() || t("courses.create.preview.fallbackTitle");
  const priceValue =
    pricingType === "free"
      ? t("courses.create.pricing.free")
      : `${offerPrice.trim() || "0"} ${t("courses.create.preview.currency")}`;

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden rounded-[2rem] border-transparent bg-[#2C4260] text-white shadow-[var(--dashboard-shadow-soft)]">
        <CardContent className="space-y-5 p-6 text-right">
          <div className="flex items-center justify-between">
            <h2 className="font-bold">{t("courses.create.preview.title")}</h2>
            <Eye className="h-5 w-5 text-[#C9A227]" />
          </div>

          {coverImageUrl ? (
            <div
              className="h-28 rounded-2xl bg-cover bg-center"
              style={{ backgroundImage: `url(${resolveFileUrl(coverImageUrl)})` }}
            />
          ) : (
            <div className="h-28 rounded-2xl bg-gradient-to-br from-white/10 to-white/5" />
          )}

          <div className="space-y-2">
            <p className="text-lg font-bold">{displayTitle}</p>
            <p className="text-sm text-white/70">
              {subjectLabel || t("courses.create.preview.fallbackSubject")} •{" "}
              {gradeLabel || t("courses.create.preview.fallbackGrade")}
            </p>
          </div>

          <div className="rounded-2xl bg-[#C9A227] p-4 text-[#2C4260]">
            <p className="text-2xl font-bold">{priceValue}</p>
            <p className="text-sm">
              {t("courses.create.preview.accessType")}: {t(`courses.create.pricing.${pricingType}`)}
            </p>
          </div>

          <Button variant="secondary" className="w-full rounded-xl bg-white text-[#2C4260] hover:bg-white/90" disabled>
            <BookOpen className="ml-2 h-4 w-4" />
            {t("courses.create.preview.viewPath")}
          </Button>
        </CardContent>
      </Card>

      <Card className="rounded-[2rem] border-emerald-100 bg-emerald-50 shadow-[var(--dashboard-shadow-soft)]">
        <CardContent className="flex items-start gap-3 p-5 text-right">
          <Lightbulb className="mt-1 h-5 w-5 shrink-0 text-emerald-600" />
          <div>
            <p className="font-semibold text-emerald-900">{t("courses.create.tip.title")}</p>
            <p className="mt-1 text-sm text-emerald-800">{t("courses.create.tip.body")}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
