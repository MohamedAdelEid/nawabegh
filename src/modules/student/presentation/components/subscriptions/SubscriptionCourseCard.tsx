"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { Award, Check, Play, UserRound } from "lucide-react";
import { progressQueryKeys } from "@/modules/student/application/constants/progressQueryKeys";
import type { EnrolledCourseCardDto } from "@/modules/student/domain/progress/progress.types";
import {
  isLifetimeEnrollmentEnd,
  sumCourseStationCounts,
} from "@/modules/student/domain/progress/progress.utils";
import { getCourseProgress } from "@/modules/student/infrastructure/api/progress.api";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { cn } from "@/shared/application/lib/cn";

type SubscriptionCourseCardProps = {
  course: EnrolledCourseCardDto;
  isContinuing: boolean;
  onContinue: (courseId: string) => Promise<void>;
};

function formatExpiryDate(value: string, locale: string): string {
  return new Intl.DateTimeFormat(locale.startsWith("ar") ? "ar-EG" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export function SubscriptionCourseCard({
  course,
  isContinuing,
  onContinue,
}: SubscriptionCourseCardProps) {
  const t = useTranslations("student.dashboard.subscriptions.courses");
  const locale = useLocale();
  const router = useRouter();
  const progressPercent = Math.round(course.progressPercentage);
  const isCompleted = course.isCompleted;
  const isExpired = course.status === "expired";
  const isInactive = course.status === "inactive";
  const isMuted = isExpired || isInactive;

  const courseProgressQuery = useQuery({
    queryKey: progressQueryKeys.courseProgress(course.courseId),
    queryFn: () => getCourseProgress(course.courseId),
    enabled: !isCompleted && course.status === "active",
    staleTime: 60_000,
  });

  const lessonCounts = sumCourseStationCounts(courseProgressQuery.data?.paths ?? []);
  const showLessonProgress = lessonCounts.total > 0;

  const handleContinue = async () => {
    await onContinue(course.courseId);
    router.push(`${ROUTES.USER.STUDENT.JOURNEY}?courseId=${encodeURIComponent(course.courseId)}`);
  };

  const handleCertificate = () => {
    if (course.certificateUrl) {
      window.open(course.certificateUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <article
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-3xl border bg-white shadow-[0px_4px_20px_-2px_rgba(0,0,0,0.05)]",
        isCompleted && "border-[rgba(16,185,129,0.2)]",
        isMuted && "opacity-80",
      )}
    >
      <div className="relative h-56 shrink-0 overflow-hidden">
        {course.thumbnailUrl ? (
          <Image
            src={course.thumbnailUrl}
            alt=""
            fill
            unoptimized
            className="object-cover"
          />
        ) : (
          <div className="h-full w-full bg-[#dbe3f3]" />
        )}

        {isCompleted ? (
          <div className="absolute inset-0 flex items-center justify-center bg-[rgba(16,185,129,0.1)] backdrop-blur-[1px]">
            <span className="flex size-16 items-center justify-center rounded-full bg-white shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)]">
              <Check className="size-8 text-[#10b981]" aria-hidden />
            </span>
          </div>
        ) : null}

        {isExpired ? (
          <span className="absolute start-4 top-4 rounded-full bg-[#64748b] px-3 py-1 text-xs font-bold text-white">
            {t("expired")}
          </span>
        ) : null}

        {isInactive ? (
          <span className="absolute start-4 top-4 rounded-full bg-[#94a3b8] px-3 py-1 text-xs font-bold text-white">
            {t("inactive")}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-5 p-6">
        <div className="space-y-2 text-end">
          <h3 className="line-clamp-2 text-lg font-bold text-[#2c4260]">{course.title}</h3>

          <div className="flex items-center justify-end gap-2 text-sm text-[#64748b]">
            {course.instructorImageUrl ? (
              <Image
                src={course.instructorImageUrl}
                alt=""
                width={24}
                height={24}
                unoptimized
                className="size-6 rounded-full object-cover"
              />
            ) : (
              <UserRound className="size-5 text-[#94a3b8]" aria-hidden />
            )}
            <span>{course.instructorName}</span>
          </div>

          {course.endsAt && !isLifetimeEnrollmentEnd(course.endsAt) && !isExpired ? (
            <p className="text-xs text-[#94a3b8]">
              {t("expiresAt", { date: formatExpiryDate(course.endsAt, locale) })}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm font-bold">
            <span className={isCompleted ? "text-[#10b981]" : "text-[#2c4260]"}>
              {isCompleted ? t("completed") : t("progressValue", { percent: progressPercent })}
            </span>
            {showLessonProgress ? (
              <span className="text-[#64748b]">
                {t("lessonProgress", {
                  completed: lessonCounts.completed,
                  total: lessonCounts.total,
                })}
              </span>
            ) : null}
          </div>

          <div
            className={cn(
              "h-2 overflow-hidden rounded-full",
              isCompleted ? "bg-[rgba(16,185,129,0.1)]" : "bg-[#f1f5f9]",
            )}
          >
            <div
              className={cn(
                "h-full rounded-full transition-all",
                isCompleted ? "bg-[#10b981]" : "bg-[#c7a55b]",
              )}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="mt-auto">
          {isCompleted ? (
            <button
              type="button"
              onClick={handleCertificate}
              disabled={!course.canViewCertificate || !course.certificateUrl}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-[#10b981] px-4 py-3 text-sm font-bold text-[#10b981] transition hover:bg-[rgba(16,185,129,0.05)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Award className="size-4" aria-hidden />
              {course.canViewCertificate && course.certificateUrl
                ? t("certificate")
                : t("certificatePending")}
            </button>
          ) : isExpired ? (
            <Link
              href={ROUTES.USER.STUDENT.COURSE_CHECKOUT(course.courseId)}
              className="flex w-full items-center justify-center rounded-2xl bg-[#2c4260] px-4 py-3 text-sm font-bold text-white transition hover:brightness-105"
            >
              {t("renew")}
            </Link>
          ) : isInactive ? (
            <p className="rounded-2xl bg-[#f8fafc] px-4 py-3 text-center text-sm text-[#64748b]">
              {t("inactiveMessage")}
            </p>
          ) : (
            <button
              type="button"
              disabled={isContinuing}
              onClick={() => void handleContinue()}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#2c4260] px-4 py-3 text-sm font-bold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Play className="size-4 fill-current" aria-hidden />
              {isContinuing ? t("continuing") : t("continue")}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
