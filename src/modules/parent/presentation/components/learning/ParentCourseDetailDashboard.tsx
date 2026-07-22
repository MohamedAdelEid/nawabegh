"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  BadgeCheck,
  BookOpen,
  GraduationCap,
  MessageCircle,
  Rocket,
  Users,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useParentCheckoutMutations } from "@/modules/parent/application/hooks/useParentCheckout";
import { useParentChildren } from "@/modules/parent/application/hooks/useParentChildren";
import { useParentCourseSummary } from "@/modules/parent/application/hooks/useParentLearning";
import { clampPercent, formatPercent } from "@/modules/parent/application/lib/parentHome.utils";
import { ParentAvatar } from "@/modules/parent/presentation/components/home/ParentAvatar";
import { ParentProgressBar } from "@/modules/parent/presentation/components/home/ParentProgressBar";
import { extractApiErrorMessage } from "@/shared/infrastructure/api/apiResponse.utils";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { resolveFileUrl } from "@/shared/infrastructure/files/fileUrl";
import { Button } from "@/shared/presentation/components/ui/button";
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";
import { ApiFailureAlert } from "@/shared/presentation/components/ui/ApiFailureAlert";

function formatPrice(
  originalPrice: number | null,
  discountedPrice: number | null,
  currency: string,
  freeLabel: string,
) {
  const price = discountedPrice ?? originalPrice;
  if (price == null || price <= 0) return freeLabel;
  return `${price} ${currency}`;
}

function ChildSelector({ courseId }: { courseId: string }) {
  const t = useTranslations("parent.dashboard.learning");
  const tCommon = useTranslations("parent.dashboard.common");
  const router = useRouter();
  const childrenQuery = useParentChildren();

  const handleSelect = (studentUserId: string) => {
    router.push(
      `${ROUTES.USER.PARENT.COURSE_DETAIL(courseId)}?studentUserId=${encodeURIComponent(studentUserId)}`,
    );
  };

  if (childrenQuery.isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-16 w-full rounded-2xl" />
        <Skeleton className="h-16 w-full rounded-2xl" />
      </div>
    );
  }

  const children = childrenQuery.data ?? [];

  if (children.length === 0) {
    return (
      <div className="rounded-[20px] border border-[#eef2f6] bg-white p-8 text-center">
        <p className="mb-4 text-[#64748b]">{tCommon("emptyChildren")}</p>
        <Button asChild className="h-11 rounded-xl bg-[#1e88e5] px-6 font-bold text-white hover:bg-[#1976d2]">
          <Link href={ROUTES.USER.PARENT.CHILDREN_ADD}>{t("addChild")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-[20px] border border-[#eef2f6] bg-white p-6">
      <h2 className="mb-4 text-end text-lg font-bold text-[#2b415e]">{t("courseDetailSelectChild")}</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {children.map((child) => (
          <button
            key={child.studentUserId}
            type="button"
            onClick={() => handleSelect(child.studentUserId)}
            className="flex items-center gap-3 rounded-2xl border border-[#eef2f6] bg-[#f8fafc] p-4 text-start transition hover:border-[#1e88e5] hover:bg-[#eef6ff]"
          >
            <ParentAvatar url={child.profileImageUrl} name={child.fullName} className="size-11" />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-[#2b415e]">{child.fullName}</p>
              <p className="truncate text-xs text-[#64748b]">{child.gradeNameAr || "—"}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export function ParentCourseDetailDashboard({ courseId }: { courseId: string }) {
  const t = useTranslations("parent.dashboard.learning");
  const tCommon = useTranslations("parent.dashboard.common");
  const router = useRouter();
  const searchParams = useSearchParams();
  const studentUserId = searchParams.get("studentUserId");
  const [subscribeError, setSubscribeError] = useState<string | null>(null);

  const courseSummaryQuery = useParentCourseSummary(studentUserId, courseId);
  const mutations = useParentCheckoutMutations({
    studentUserId: studentUserId ?? "",
    courseId,
  });

  const handleSubscribe = async () => {
    if (!studentUserId) return;
    setSubscribeError(null);
    try {
      const session = await mutations.createSession.mutateAsync();
      router.push(
        `${ROUTES.USER.PARENT.COURSE_CHECKOUT(courseId)}?studentUserId=${encodeURIComponent(studentUserId)}&sessionId=${encodeURIComponent(session.sessionId)}`,
      );
    } catch (err) {
      setSubscribeError(extractApiErrorMessage(err, tCommon("error")));
    }
  };

  if (courseSummaryQuery.isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-6 pb-8">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <Skeleton className="h-96 rounded-[20px]" />
          <Skeleton className="h-72 rounded-[20px]" />
        </div>
      </div>
    );
  }

  if (!courseSummaryQuery.data) {
    return (
      <div className="mx-auto flex w-full max-w-[1120px] flex-col items-center gap-4 pb-8 pt-12 text-center">
        <p className="text-[#64748b]">{t("courseDetailNotFound")}</p>
        <Button asChild variant="outline" className="rounded-xl">
          <Link href={ROUTES.USER.PARENT.COURSES_CATALOG}>{t("backToCourses")}</Link>
        </Button>
      </div>
    );
  }

  const course = courseSummaryQuery.data;
  const coverUrl = resolveFileUrl(course.coverImageUrl);

  return (
    <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-8 pb-8">
      <nav className="flex items-center justify-end gap-2 text-sm text-[#94a3b8]">
        <span className="font-bold text-[#2b415e]">{course.title}</span>
        <span>/</span>
        <Link href={ROUTES.USER.PARENT.COURSES_CATALOG} className="hover:text-[#2b415e]">
          {t("catalogTitle")}
        </Link>
        <span>/</span>
        <Link href={ROUTES.USER.PARENT.HOME} className="hover:text-[#2b415e]">
          {t("breadcrumbHome")}
        </Link>
      </nav>

      <header className="overflow-hidden rounded-[20px] border border-[#eef2f6] bg-white shadow-[0px_8px_0px_rgba(0,0,0,0.04)]">
        <div className="relative h-48 w-full bg-[#eef4ff] sm:h-64">
          {coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coverUrl} alt={course.title} className="size-full object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center">
              <GraduationCap className="size-16 text-[#1e88e5]" aria-hidden />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-4 p-6 text-start sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            {course.subjectName ? (
              <span className="rounded-full bg-[#eef6ff] px-3 py-1 text-xs font-bold text-[#1e88e5]">
                {course.subjectName}
              </span>
            ) : null}
            {course.gradeName ? (
              <span className="rounded-full bg-[#f8fafc] px-3 py-1 text-xs font-bold text-[#64748b]">
                {course.gradeName}
              </span>
            ) : null}
          </div>
          <h1 className="text-2xl font-bold text-[#2b415e] md:text-3xl">{course.title}</h1>
          {course.description ? (
            <p className="max-w-2xl text-sm leading-6 text-[#64748b]">{course.description}</p>
          ) : null}
          {course.instructorName ? (
            <div className="flex items-center gap-2">
              <ParentAvatar url={course.instructorImageUrl} name={course.instructorName} className="size-9" />
              <div>
                <p className="text-xs text-[#94a3b8]">{t("instructorLabel")}</p>
                <p className="text-sm font-bold text-[#2b415e]">{course.instructorName}</p>
              </div>
            </div>
          ) : null}
        </div>
      </header>

      {!studentUserId ? (
        <ChildSelector courseId={courseId} />
      ) : course.isEnrolledForChild ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <section className="space-y-6 rounded-[20px] border border-[#eef2f6] bg-white p-6 shadow-[0px_8px_0px_rgba(0,0,0,0.04)] sm:p-8">
            <div className="flex items-center gap-2 text-emerald-600">
              <BadgeCheck className="size-5" aria-hidden />
              <span className="text-sm font-bold">{t("courseDetailEnrolledBadge")}</span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-bold text-[#2b415e]">
                  {formatPercent(clampPercent(course.progressPercent))}
                </span>
                <span className="text-[#64748b]">{t("completionRate")}</span>
              </div>
              <ParentProgressBar value={course.progressPercent} barClassName="bg-[#58cc02]" heightClassName="h-3" />
              <p className="text-xs text-[#94a3b8]">
                {t("lessonsProgress", {
                  completed: course.completedLessonsCount,
                  total: course.lessonsCount,
                })}
              </p>
            </div>

            <Button
              asChild
              className="h-12 w-full rounded-xl bg-[#1e88e5] font-bold text-white hover:bg-[#1976d2]"
            >
              <Link href={ROUTES.USER.PARENT.CHILD_COURSE_JOURNEY(studentUserId, courseId)}>
                <Rocket className="size-4" aria-hidden />
                {t("viewJourney")}
              </Link>
            </Button>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Button
                asChild
                variant="outline"
                className="h-11 gap-2 rounded-xl border-[#e2e8f0] bg-[#f8f9fa] font-bold text-[#2b415e]"
              >
                <Link href={ROUTES.USER.PARENT.CHILD_COURSE_CHAT(studentUserId, courseId)}>
                  <MessageCircle className="size-4" aria-hidden />
                  {t("courseChat")}
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-11 gap-2 rounded-xl border-[#e2e8f0] bg-[#f8f9fa] font-bold text-[#2b415e]"
              >
                <Link href={ROUTES.USER.PARENT.CHILD_COURSE_RESULTS(studentUserId, courseId)}>
                  <BookOpen className="size-4" aria-hidden />
                  {t("results")}
                </Link>
              </Button>
            </div>
          </section>

          <aside className="space-y-4 rounded-[20px] border border-[#eef2f6] bg-white p-6 shadow-[0px_8px_0px_rgba(0,0,0,0.04)]">
            <h2 className="text-end text-lg font-bold text-[#2b415e]">{t("courseDetailInstructorTitle")}</h2>
            {course.instructorName ? (
              <div className="flex items-center gap-3">
                <ParentAvatar url={course.instructorImageUrl} name={course.instructorName} className="size-12" />
                <div>
                  <p className="font-bold text-[#2b415e]">{course.instructorName}</p>
                  <p className="text-xs text-[#64748b]">{t("courseDetailInstructorHint")}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-[#64748b]">{t("courseDetailInstructorEmpty")}</p>
            )}
            <div className="flex items-center gap-2 rounded-xl bg-[#f8fafc] p-3 text-xs text-[#64748b]">
              <Users className="size-4 shrink-0 text-[#1e88e5]" aria-hidden />
              {t("courseDetailCommunityHint")}
            </div>
          </aside>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <section className="space-y-4 rounded-[20px] border border-[#eef2f6] bg-white p-6 shadow-[0px_8px_0px_rgba(0,0,0,0.04)] sm:p-8">
            <h2 className="text-end text-lg font-bold text-[#2b415e]">{t("courseDetailAboutTitle")}</h2>
            <p className="text-sm leading-6 text-[#64748b]">
              {course.description || t("courseDetailAboutEmpty")}
            </p>
            <div className="flex items-center gap-2 rounded-xl bg-[#f8fafc] p-4 text-sm text-[#64748b]">
              <BookOpen className="size-5 shrink-0 text-[#1e88e5]" aria-hidden />
              {t("lessonsProgress", { completed: 0, total: course.lessonsCount })}
            </div>
          </section>

          <aside className="space-y-4 rounded-[20px] border border-[#eef2f6] bg-white p-6 shadow-[0px_8px_0px_rgba(0,0,0,0.04)]">
            <h2 className="text-end text-lg font-bold text-[#2b415e]">{t("courseDetailPricingTitle")}</h2>
            <p className="text-end text-3xl font-bold text-[#2b415e]">
              {formatPrice(course.originalPrice, course.discountedPrice, course.currency, t("catalogFree"))}
            </p>
            {course.originalPrice != null &&
            course.discountedPrice != null &&
            course.discountedPrice < course.originalPrice ? (
              <p className="text-end text-sm text-[#94a3b8] line-through">
                {course.originalPrice} {course.currency}
              </p>
            ) : null}

            {subscribeError ? <ApiFailureAlert message={subscribeError} /> : null}

            <Button
              type="button"
              disabled={mutations.createSession.isPending}
              onClick={() => void handleSubscribe()}
              className="h-12 w-full rounded-xl bg-[#1e88e5] font-bold text-white hover:bg-[#1976d2]"
            >
              {mutations.createSession.isPending ? tCommon("loading") : t("enrollNow")}
            </Button>
          </aside>
        </div>
      )}
    </div>
  );
}
