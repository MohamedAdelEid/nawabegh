"use client";

import { BookOpen, Eye, GitBranch, Lightbulb, PlayCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import type { TeacherCoursePricingType } from "@/modules/teacher/domain/types/teacher.types";
import { Button } from "@/shared/presentation/components/ui/button";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";

type PreviewProps = {
  title: string;
  subjectLabel: string;
  gradeLabel: string;
  pricingType: TeacherCoursePricingType;
  offerPrice: string;
  pathCount: number;
  lessonCount: number;
};

export function TeacherCourseCreatePreviewSidebar({
  title,
  subjectLabel,
  gradeLabel,
  pricingType,
  offerPrice,
  pathCount,
  lessonCount,
}: PreviewProps) {
  const t = useTranslations("teacher.dashboard");
  const displayTitle = title.trim() || t("courses.create.preview.fallbackTitle");
  const priceValue = offerPrice.trim() || "199";

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden rounded-[2rem] border-transparent bg-[#2C4260] text-white shadow-[var(--dashboard-shadow-soft)]">
        <CardContent className="space-y-5 p-6 text-right">
          <div className="flex items-center justify-between">
            <Eye className="h-5 w-5 text-[#C9A227]" />
            <h2 className="font-bold">{t("courses.create.preview.title")}</h2>
          </div>

          <div className="h-28 rounded-2xl bg-gradient-to-br from-white/10 to-white/5" />

          <div className="space-y-2">
            <p className="text-lg font-bold">{displayTitle}</p>
            <p className="text-sm text-white/70">
              {subjectLabel || t("courses.create.preview.fallbackSubject")} •{" "}
              {gradeLabel || t("courses.create.preview.fallbackGrade")}
            </p>
          </div>

          <div className="rounded-2xl bg-[#C9A227] p-4 text-[#2C4260]">
            <p className="text-2xl font-bold">{priceValue} {t("courses.create.preview.currency")}</p>
            <p className="text-sm">
              {t("courses.create.preview.accessType")}: {t(`courses.create.pricing.${pricingType}`)}
            </p>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <PlayCircle className="h-4 w-4" />
              <span>{t("courses.create.preview.lessons", { count: lessonCount || 13 })}</span>
            </div>
            <div className="flex items-center gap-2">
              <GitBranch className="h-4 w-4" />
              <span>{t("courses.create.preview.paths", { count: pathCount || 2 })}</span>
            </div>
          </div>

          <Button variant="secondary" className="w-full rounded-xl bg-white text-[#2C4260] hover:bg-white/90">
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
