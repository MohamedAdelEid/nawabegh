"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import type { EnrolledCourseCardDto } from "@/modules/student/domain/progress/progress.types";
import { progressBarTone } from "@/modules/student/domain/profile/profile.utils";
import { STUDENT_PROFILE_ASSETS } from "@/modules/student/presentation/components/profile/student-profile.assets";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { cn } from "@/shared/application/lib/cn";

type ProfileCoursesSectionProps = {
  courses: EnrolledCourseCardDto[];
  continuingCourseId: string | null;
  onContinue: (courseId: string) => Promise<void>;
};

const TONE_CLASS = {
  navy: "bg-[#2b415e] text-[#2b415e]",
  gold: "bg-[#c7af6d] text-[#c7af6d]",
  green: "bg-[#58cc02] text-[#58cc02]",
} as const;

export function ProfileCoursesSection({
  courses,
  continuingCourseId,
  onContinue,
}: ProfileCoursesSectionProps) {
  const t = useTranslations("student.dashboard.profile.courses");
  const router = useRouter();

  const handleContinue = async (courseId: string) => {
    await onContinue(courseId);
    router.push(`${ROUTES.USER.STUDENT.JOURNEY}?courseId=${encodeURIComponent(courseId)}`);
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Link
          href={ROUTES.USER.STUDENT.SUBSCRIPTIONS}
          className="text-sm font-bold text-[#2b415e] transition hover:opacity-80"
        >
          {t("viewAll")}
        </Link>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-[#2b415e]">{t("title")}</h2>
          <span className="relative inline-block size-[18px] overflow-hidden">
            <Image
              src={STUDENT_PROFILE_ASSETS.courses}
              alt=""
              fill
              unoptimized
              className="object-contain"
            />
          </span>
        </div>
      </div>

      {courses.length > 0 ? (
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => {
            const percent = Math.round(course.progressPercentage);
            const tone = progressBarTone(percent);
            const toneClasses = TONE_CLASS[tone];

            return (
              <article
                key={course.enrollmentId || course.courseId}
                className="overflow-hidden rounded-lg bg-white shadow-[0px_8px_0px_rgba(0,0,0,0.05)]"
              >
                <div className="relative h-44 overflow-hidden bg-[#dbe3f3]">
                  {course.thumbnailUrl ? (
                    <Image
                      src={course.thumbnailUrl}
                      alt=""
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-[rgba(43,65,94,0.2)]" />
                </div>

                <div className="space-y-6 p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="text-start">
                      <p className={cn("text-2xl font-bold leading-8", toneClasses.split(" ")[1])}>
                        {percent}%
                      </p>
                      <p className="text-[10px] font-bold uppercase text-[#64748b]">
                        {t("progressLabel")}
                      </p>
                    </div>
                    <div className="text-end">
                      <h3 className="text-xl font-bold leading-7 text-[#2b415e]">
                        {course.title}
                      </h3>
                      <p className="text-sm text-[#64748b]">{course.instructorName}</p>
                    </div>
                  </div>

                  <div className="h-4 overflow-hidden rounded-full border border-[#e2e8f0] bg-[#f1f3f5]">
                    <div
                      className={cn("h-full rounded-full", toneClasses.split(" ")[0])}
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <button
                    type="button"
                    disabled={continuingCourseId === course.courseId}
                    onClick={() => void handleContinue(course.courseId)}
                    className="w-full rounded-xl bg-[#f1f5f9] py-3 text-sm font-bold text-[#2b415e] shadow-[0px_4px_0px_rgba(0,0,0,0.1)] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {continuingCourseId === course.courseId
                      ? t("continuing")
                      : t("continue")}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-[#cbd5e1] bg-[#f8fafc] px-6 py-14 text-center">
          <p className="mb-6 text-[#64748b]">{t("empty")}</p>
          <Link
            href={ROUTES.USER.STUDENT.COURSES}
            className="inline-flex rounded-2xl bg-[#c7a55b] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#c7a55b]/90"
          >
            {t("explore")}
          </Link>
        </div>
      )}
    </section>
  );
}
