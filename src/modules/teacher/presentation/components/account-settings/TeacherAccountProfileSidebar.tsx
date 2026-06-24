"use client";

import { useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { BarChart3, Camera, GraduationCap } from "lucide-react";
import type {
  TeacherAccountSettingsData,
  TeacherAccountFormValues,
} from "@/modules/teacher/domain/types/teacherAccount.types";
import { resolveFileUrl } from "@/shared/infrastructure/files/fileUrl";
import { formatNumber } from "@/shared/application/lib/format";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { UserAvatarImageOrInitials } from "@/shared/presentation/components/user";
import { cn } from "@/shared/application/lib/cn";

const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

function formatCompactCount(value: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function resolveAvatarUrl(values: TeacherAccountFormValues, summaryName: string) {
  if (values.avatarPreviewUrl) return values.avatarPreviewUrl;
  return resolveFileUrl(values.profileImageUrl);
}

export function TeacherAccountProfileSidebar({
  data,
  values,
  isEditMode,
  onAvatarChange,
}: {
  data: TeacherAccountSettingsData;
  values: TeacherAccountFormValues;
  isEditMode: boolean;
  onAvatarChange: (file: File, previewUrl: string) => void;
}) {
  const t = useTranslations("teacher.dashboard.settingsPage");
  const locale = useLocale();
  const inputRef = useRef<HTMLInputElement>(null);
  const { summary, weeklyStudentPerformance } = data;
  const avatarUrl = resolveAvatarUrl(values, summary.fullName);
  const displayName = values.fullName || summary.fullName;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type) || file.size > MAX_IMAGE_SIZE_BYTES) {
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        onAvatarChange(file, reader.result);
      }
      event.target.value = "";
    };
    reader.readAsDataURL(file);
  };

  const changePercent = weeklyStudentPerformance.changePercentVsLastWeek;
  const activeStudents = weeklyStudentPerformance.activeStudentsThisWeek;

  return (
    <div className="space-y-6">
      <Card
        className="overflow-hidden rounded-[2rem] border-white/80 bg-white"
        style={{ boxShadow: "var(--dashboard-shadow-soft)" }}
      >
        <CardContent className="space-y-6 p-6 text-center sm:p-8">
          <div className="relative mx-auto w-fit">
            <UserAvatarImageOrInitials
              trackKey={`${summary.userId}-${avatarUrl ?? "none"}`}
              name={displayName}
              imageUrl={avatarUrl}
              size="xxl"
              circleClassName="bg-[#2C4260] text-white"
            />
            {isEditMode ? (
              <>
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="absolute bottom-1 left-1 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-[#C7AF6E] text-white shadow-md transition hover:bg-[#b89d5c]"
                  aria-label={t("profile.changePhoto")}
                >
                  <Camera className="h-4 w-4" aria-hidden />
                </button>
                <input
                  ref={inputRef}
                  type="file"
                  accept={ACCEPTED_IMAGE_TYPES.join(",")}
                  className="hidden"
                  onChange={handleFileChange}
                />
              </>
            ) : null}
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-[#2b415e]">{displayName}</h2>
            <p className="text-sm text-slate-500">{values.jobTitle || summary.jobTitle}</p>
            <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
              <GraduationCap className="h-4 w-4 shrink-0 text-[#C7AF6E]" aria-hidden />
              <span>{values.schoolName || summary.schoolName}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-y border-slate-100 py-4">
            <div className="space-y-1">
              <p className="text-lg font-bold text-[#2b415e]">
                {formatCompactCount(summary.studentCount, locale)}
              </p>
              <p className="text-xs text-slate-500">{t("profile.students")}</p>
            </div>
            <div className="space-y-1">
              <p className="text-lg font-bold text-[#2b415e]">
                {formatNumber(summary.courseCount, locale)}
              </p>
              <p className="text-xs text-slate-500">{t("profile.courses")}</p>
            </div>
          </div>

          <div className="space-y-2 text-right">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-[#C7AF6E]">
                {summary.profileCompletionPercent}%
              </span>
              <span className="text-slate-500">{t("profile.completion")}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-[#C7AF6E] transition-all"
                style={{ width: `${Math.min(100, summary.profileCompletionPercent)}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden rounded-[2rem] border-0 bg-[#243B5A] text-white">
        <CardContent className="relative space-y-4 p-6 sm:p-8">
          <BarChart3
            className="absolute bottom-4 left-4 h-16 w-16 text-white/10"
            aria-hidden
          />
          <div className="space-y-1 text-right">
            <p className="text-xs text-white/70">{t("weeklyActivity.recent")}</p>
            <h3 className="text-lg font-bold leading-snug">
              {weeklyStudentPerformance.weekLabelAr || t("weeklyActivity.title")}
            </h3>
          </div>
          <ul className="space-y-3 text-right text-sm">
            {changePercent !== 0 ? (
              <li className="flex items-center justify-end gap-2">
                <span>
                  {changePercent > 0
                    ? t("weeklyActivity.attendanceUp", { percent: Math.abs(changePercent) })
                    : t("weeklyActivity.attendanceDown", { percent: Math.abs(changePercent) })}
                </span>
                <span
                  className={cn(
                    "h-2 w-2 shrink-0 rounded-full",
                    changePercent > 0 ? "bg-emerald-400" : "bg-amber-400",
                  )}
                />
              </li>
            ) : null}
            {activeStudents > 0 ? (
              <li className="flex items-center justify-end gap-2">
                <span>{t("weeklyActivity.activeStudents", { count: activeStudents })}</span>
                <span className="h-2 w-2 shrink-0 rounded-full bg-amber-400" />
              </li>
            ) : null}
            {changePercent === 0 && activeStudents === 0 ? (
              <li className="text-white/70">{t("weeklyActivity.empty")}</li>
            ) : null}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
