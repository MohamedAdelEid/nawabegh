"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  BookOpen,
  FlaskConical,
  Calculator,
  Languages,
  Landmark,
  Moon,
  Plus,
  TrendingUp,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import {
  useParentChildCourses,
  useParentChildLearningDashboard,
  useParentChildReports,
} from "@/modules/parent/application/hooks/useParentLearning";
import {
  clampPercent,
  formatPercent,
  resolveLocalizedText,
} from "@/modules/parent/application/lib/parentHome.utils";
import { ParentProgressBar } from "@/modules/parent/presentation/components/home/ParentProgressBar";
import { ParentProgressRing } from "@/modules/parent/presentation/components/home/ParentProgressRing";
import type { ParentChildCourseItem } from "@/modules/parent/domain/types/parentLearning.types";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { Button } from "@/shared/presentation/components/ui/button";
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";
import { cn } from "@/shared/application/lib/cn";

function subjectTone(progress: number) {
  if (progress >= 75) {
    return {
      levelKey: "levelHigh" as const,
      badge: "bg-[#dcf4cb] text-[#3b8c00]",
      bar: "bg-[#58cc02]",
      grade: progress >= 90 ? "A+" : "A",
    };
  }
  if (progress >= 50) {
    return {
      levelKey: "levelMedium" as const,
      badge: "bg-[#fff3cd] text-[#b78103]",
      bar: "bg-[#f4c430]",
      grade: progress >= 60 ? "B" : "B-",
    };
  }
  return {
    levelKey: "levelLow" as const,
    badge: "bg-[#ffe2e2] text-[#dc2626]",
    bar: "bg-[#ef4444]",
    grade: "C",
  };
}

function subjectIcon(title: string) {
  const t = title.toLowerCase();
  if (t.includes("رياض") || t.includes("math")) return Calculator;
  if (t.includes("علوم") || t.includes("science") || t.includes("فيز")) return FlaskConical;
  if (t.includes("عربي") || t.includes("arabic")) return BookOpen;
  if (t.includes("إنجل") || t.includes("english")) return Languages;
  if (t.includes("إسلام") || t.includes("islami")) return Moon;
  if (t.includes("تاريخ") || t.includes("اجتماع") || t.includes("histor")) return Landmark;
  return BookOpen;
}

function groupCoursesBySubject(courses: ParentChildCourseItem[], locale: string) {
  const map = new Map<
    string,
    {
      key: string;
      title: string;
      progressSum: number;
      count: number;
      courseId: string;
    }
  >();

  for (const course of courses) {
    const title =
      resolveLocalizedText(locale, course.subjectNameAr, course.subjectNameEn) ||
      course.title;
    const key = title.trim() || course.courseId;
    const existing = map.get(key);
    if (existing) {
      existing.progressSum += course.progressPercent;
      existing.count += 1;
    } else {
      map.set(key, {
        key,
        title,
        progressSum: course.progressPercent,
        count: 1,
        courseId: course.courseId,
      });
    }
  }

  return Array.from(map.values()).map((item) => ({
    ...item,
    progressPercent: item.count ? item.progressSum / item.count : 0,
    pathsCount: item.count * 2 || 1,
  }));
}

function SubjectCard({
  title,
  progressPercent,
  pathsCount,
  href,
}: {
  title: string;
  progressPercent: number;
  pathsCount: number;
  href: string;
}) {
  const t = useTranslations("parent.dashboard.learning");
  const tone = subjectTone(progressPercent);
  const Icon = subjectIcon(title);

  return (
    <article className="relative flex h-full flex-col overflow-hidden rounded-[20px] border border-[#eef2f6] bg-white p-6 shadow-[0px_8px_0px_rgba(0,0,0,0.04)]">
      <div className="pointer-events-none absolute -start-4 -top-4 size-24 rounded-full bg-[#f4ecd8]/40 blur-2xl" />
      <div className="relative flex items-start justify-between gap-3">
        <span className={cn("rounded-full px-3 py-1 text-xs font-bold", tone.badge)}>
          {t(tone.levelKey)}
        </span>
        <div className="flex size-12 items-center justify-center rounded-2xl bg-[#eef4ff] text-[#1e88e5]">
          <Icon className="size-6" />
        </div>
      </div>
      <h3 className="relative mt-5 text-end text-2xl font-bold text-[#2b415e]">{title}</h3>
      <p className="relative mt-2 text-end text-sm text-[#64748b]">
        {t("pathsCount", { count: pathsCount })}
      </p>
      <div className="relative mt-auto space-y-3 pt-8">
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-[#2b415e]">
            {formatPercent(clampPercent(progressPercent))}
          </span>
          <span className="text-sm font-medium text-[#64748b]">{t("completionRate")}</span>
        </div>
        <ParentProgressBar value={progressPercent} barClassName={tone.bar} heightClassName="h-4" />
        <div className="flex items-center justify-between border-t border-[#eef2f6] pt-4">
          <Link
            href={href}
            className="inline-flex items-center gap-1 text-sm font-bold text-[#1e88e5] hover:underline"
          >
            <ArrowUpRight className="size-3.5" />
            {t("viewProgress")}
          </Link>
          <span className="flex size-8 items-center justify-center rounded-full border border-[#dbe3f3] text-xs font-bold text-[#2b415e]">
            {tone.grade}
          </span>
        </div>
      </div>
    </article>
  );
}

export function ParentChildLearningDashboard({
  studentUserId,
}: {
  studentUserId: string;
}) {
  const t = useTranslations("parent.dashboard.learning");
  const tCommon = useTranslations("parent.dashboard.common");
  const locale = useLocale();
  const coursesQuery = useParentChildCourses(studentUserId);
  const reportsQuery = useParentChildReports(studentUserId);
  const dashboardQuery = useParentChildLearningDashboard(studentUserId);

  const isLoading =
    coursesQuery.isLoading || reportsQuery.isLoading || dashboardQuery.isLoading;
  const error =
    coursesQuery.error ?? reportsQuery.error ?? dashboardQuery.error;

  const childName =
    coursesQuery.data?.childFullName ||
    reportsQuery.data?.childFullName ||
    dashboardQuery.data?.childFullName ||
    "—";

  const subjects = groupCoursesBySubject(coursesQuery.data?.courses ?? [], locale);
  const overallProgress =
    reportsQuery.data?.overallProgressPercent ??
    coursesQuery.data?.overallProgressPercent ??
    dashboardQuery.data?.achievementRatePercent ??
    0;
  const weekStations =
    dashboardQuery.data?.weekStationsCompleted ??
    dashboardQuery.data?.weeklySummary?.lessonsCompleted ??
    0;
  const weekImprovement = dashboardQuery.data?.weekImprovementPercent ?? 0;
  const pointsCurrent = dashboardQuery.data?.pointsCurrent ?? 950;
  const pointsTarget = dashboardQuery.data?.pointsTarget ?? 1000;
  const pointsNeeded = Math.max(0, pointsTarget - pointsCurrent);

  if (isLoading) {
    return (
      <div className="space-y-6 p-4 md:p-8">
        <Skeleton className="h-20 w-full rounded-2xl" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 p-8">
        <p className="text-[#64748b]">{tCommon("error")}</p>
        <Button
          type="button"
          onClick={() => {
            void coursesQuery.refetch();
            void reportsQuery.refetch();
            void dashboardQuery.refetch();
          }}
        >
          {tCommon("retry")}
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-8 p-4 md:p-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <Button asChild className="order-2 h-12 rounded-xl bg-[#1e88e5] px-6 font-bold text-white hover:bg-[#1976d2] sm:order-1">
          <Link href={ROUTES.USER.PARENT.CHILDREN_ADD}>
            <Plus className="size-4" />
            {t("addChild")}
          </Link>
        </Button>
        <div className="order-1 text-end sm:order-2">
          <nav className="mb-1 flex items-center justify-end gap-2 text-sm text-[#94a3b8]">
            <span>{t("breadcrumbLearning")}</span>
            <span>/</span>
            <Link href={ROUTES.USER.PARENT.HOME} className="hover:text-[#2b415e]">
              {t("breadcrumbHome")}
            </Link>
          </nav>
          <h1 className="text-2xl font-bold text-[#2b415e] md:text-3xl">
            {t("title", { name: childName })}
          </h1>
          <p className="mt-1 text-sm text-[#64748b]">{t("subtitle")}</p>
        </div>
      </header>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="flex items-center gap-5 rounded-[20px] border border-[#eef2f6] bg-white p-6 shadow-[0px_8px_0px_rgba(0,0,0,0.04)]">
          <div className="min-w-0 flex-1 text-end">
            <h2 className="text-lg font-bold text-[#2b415e]">{t("badgeTitle")}</h2>
            <p className="mt-2 text-sm leading-6 text-[#64748b]">
              {t("badgeHint", { name: childName, points: pointsNeeded })}
            </p>
            <div className="mt-4 space-y-2">
              <ParentProgressBar
                value={(pointsCurrent / Math.max(pointsTarget, 1)) * 100}
                barClassName="bg-[#c7af6d]"
              />
              <p className="text-xs font-bold text-[#94a3b8]">
                {pointsCurrent} / {pointsTarget}
              </p>
            </div>
          </div>
          <ParentProgressRing value={overallProgress} size={128} color="#58cc02">
            <div className="text-center">
              <p className="text-2xl font-bold text-[#2b415e]">
                {formatPercent(clampPercent(overallProgress))}
              </p>
              <p className="text-[10px] font-medium text-[#64748b]">{t("overallProgress")}</p>
            </div>
          </ParentProgressRing>
        </article>

        <article className="relative overflow-hidden rounded-[20px] bg-[#1e2d4a] p-6 text-white shadow-[0px_8px_0px_rgba(0,0,0,0.08)]">
          <div className="pointer-events-none absolute inset-y-0 end-0 w-24 opacity-20">
            <div className="h-full w-full bg-[radial-gradient(circle_at_center,#fff_1px,transparent_1px)] bg-size-[12px_12px]" />
          </div>
          <h2 className="relative text-end text-lg font-bold">{t("weekStationsTitle")}</h2>
          <div className="relative mt-4 flex items-end justify-end gap-3">
            <span className="pb-2 text-lg font-medium text-white/80">{t("stationsUnit")}</span>
            <span className="text-5xl font-bold">{weekStations}</span>
          </div>
          <p className="relative mt-4 flex items-center justify-end gap-2 text-sm text-[#9be15d]">
            <TrendingUp className="size-4" />
            {t("weekImprovement", {
              name: childName.split(" ")[0] || childName,
              percent: Math.round(Math.abs(weekImprovement) || 12),
            })}
          </p>
        </article>
      </section>

      {subjects.length === 0 ? (
        <p className="rounded-2xl bg-white p-8 text-center text-[#64748b] shadow-sm">
          {t("emptySubjects")}
        </p>
      ) : (
        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {subjects.map((subject) => (
            <SubjectCard
              key={subject.key}
              title={subject.title}
              progressPercent={subject.progressPercent}
              pathsCount={subject.pathsCount}
              href={`${ROUTES.USER.PARENT.CHILD_COURSES(studentUserId)}?subject=${encodeURIComponent(subject.title)}`}
            />
          ))}
        </section>
      )}
    </div>
  );
}
