"use client";

import Link from "next/link";
import {
  Award,
  BookOpen,
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Flame,
  Radio,
  Settings,
  Trophy,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useParentChildDetails } from "@/modules/parent/application/hooks/useParentChildDetails";
import {
  getChildAlertTone,
  getEstimatedLevel,
  getLearningPathStatusTone,
} from "@/modules/parent/application/lib/parentChildren.utils";
import {
  clampPercent,
  formatPercent,
  getActivityIconTone,
  resolveLocalizedText,
} from "@/modules/parent/application/lib/parentHome.utils";
import { ParentAvatar } from "@/modules/parent/presentation/components/home/ParentAvatar";
import { ParentProgressBar } from "@/modules/parent/presentation/components/home/ParentProgressBar";
import type {
  ParentChildAlert,
  ParentChildDetails,
} from "@/modules/parent/domain/types/parentChildren.types";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { Button } from "@/shared/presentation/components/ui/button";
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";
import { cn } from "@/shared/application/lib/cn";

function KpiCard({
  label,
  value,
  accent,
  sub,
}: {
  label: string;
  value: string;
  accent: string;
  sub?: string;
}) {
  return (
    <article className="relative overflow-hidden rounded-[16px] bg-white p-5 shadow-[0px_8px_0px_rgba(0,0,0,0.05)]">
      <div className={cn("absolute inset-x-0 top-0 h-1.5", accent)} />
      <p className="text-xs font-bold text-[#64748b]">{label}</p>
      <p className="mt-3 text-2xl font-bold text-[#2b415e]">{value}</p>
      {sub ? <p className="mt-1 text-[11px] text-[#94a3b8]">{sub}</p> : null}
    </article>
  );
}

function AlertsPanel({ alerts }: { alerts: ParentChildAlert[] }) {
  const t = useTranslations("parent.dashboard.childrenManagement.details");
  const locale = useLocale();

  return (
    <article className="rounded-[20px] bg-white p-6 shadow-[0px_8px_0px_rgba(0,0,0,0.05)]">
      <h2 className="mb-4 text-sm font-bold text-[#2b415e]">{t("alertsTitle")}</h2>
      {alerts.length === 0 ? (
        <p className="text-sm text-[#64748b]">{t("noAlerts")}</p>
      ) : (
        <ul className="space-y-3">
          {alerts.slice(0, 6).map((alert, index) => {
            const tone = getChildAlertTone(alert.severity);
            const title = resolveLocalizedText(locale, alert.titleAr, alert.titleEn);
            const message = resolveLocalizedText(locale, alert.messageAr, alert.messageEn);
            return (
              <li
                key={`${alert.type}-${index}`}
                className={cn("rounded-xl p-3 text-start", tone.container)}
              >
                <p className={cn("text-xs font-bold", tone.title)}>{title}</p>
                {message ? (
                  <p className={cn("mt-0.5 text-[11px]", tone.message)}>{message}</p>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </article>
  );
}

function AchievementsPanel({ details }: { details: ParentChildDetails }) {
  const t = useTranslations("parent.dashboard.childrenManagement.details");
  const tCommon = useTranslations("parent.dashboard.common");
  const locale = useLocale();
  const achievements = details.achievements ?? [];

  return (
    <article className="rounded-[20px] bg-white p-6 shadow-[0px_8px_0px_rgba(0,0,0,0.05)]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-sm font-bold text-[#2b415e]">{t("achievementsTitle")}</h2>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f4ecd8] px-3 py-1 text-xs font-bold text-[#a38f5a]">
          <Award className="size-3.5" aria-hidden />
          {tCommon("points", { count: details.points })}
        </span>
      </div>
      {achievements.length === 0 ? (
        <p className="text-sm text-[#64748b]">{t("noAchievements")}</p>
      ) : (
        <ul className="grid grid-cols-3 gap-3">
          {achievements.slice(0, 6).map((achievement) => (
            <li
              key={achievement.id}
              className="flex flex-col items-center gap-2 rounded-xl bg-[#f8f9fa] p-3 text-center"
            >
              <span className="flex size-10 items-center justify-center rounded-full bg-[#f4ecd8] text-[#c7af6d]">
                <Trophy className="size-5" aria-hidden />
              </span>
              <p className="line-clamp-2 text-[11px] font-bold text-[#2b415e]">
                {resolveLocalizedText(locale, achievement.titleAr, achievement.titleEn)}
              </p>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-4 text-xs font-bold text-[#64748b]">
        {t("totalPoints")}: <span className="text-[#2b415e]">{details.points}</span>
      </p>
    </article>
  );
}

function RecentActivityPanel({ details }: { details: ParentChildDetails }) {
  const t = useTranslations("parent.dashboard.childrenManagement.details");
  const tTypes = useTranslations("parent.dashboard.home.activity.types");
  const locale = useLocale();
  const activities = details.recentActivities ?? [];

  const iconMap = { quiz: BookOpenCheck, station: CheckCircle2, live: Radio } as const;
  const toneMap = {
    quiz: "bg-[#ffe4e4] text-[#d33131]",
    station: "bg-[#e8f5ff] text-[#2b415e]",
    live: "bg-[#dcf4cb] text-[#46a302]",
  } as const;

  return (
    <article className="rounded-[20px] bg-white p-6 shadow-[0px_8px_0px_rgba(0,0,0,0.05)]">
      <h2 className="mb-4 text-sm font-bold text-[#2b415e]">{t("recentActivity")}</h2>
      {activities.length === 0 ? (
        <p className="text-sm text-[#64748b]">{t("noActivity")}</p>
      ) : (
        <ul className="space-y-3">
          {activities.slice(0, 6).map((activity, index) => {
            const tone = getActivityIconTone(
              activity.type as "quiz_submitted" | "live_joined" | "station_completed",
            );
            const Icon = iconMap[tone];
            const title = resolveLocalizedText(locale, activity.titleAr, activity.title);
            return (
              <li key={`${activity.occurredAtUtc}-${index}`} className="flex items-start gap-3">
                <span
                  className={cn(
                    "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg",
                    toneMap[tone],
                  )}
                >
                  <Icon className="size-4" aria-hidden />
                </span>
                <div className="min-w-0 flex-1 text-start">
                  <p className="text-sm font-medium text-[#0f172a]">
                    {title || tTypes(activity.type)}
                  </p>
                  {activity.scorePercent != null ? (
                    <p className="text-xs text-[#64748b]">
                      {formatPercent(activity.scorePercent)}
                    </p>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </article>
  );
}

function SchoolRankCard({ details }: { details: ParentChildDetails }) {
  const t = useTranslations("parent.dashboard.childrenManagement.details");

  return (
    <article className="flex flex-col items-center justify-center gap-2 rounded-[20px] bg-[#2b415e] p-6 text-center shadow-[0px_4px_0px_#1e2e42]">
      <span className="flex size-12 items-center justify-center rounded-full bg-white/10 text-[#c7af6d]">
        <Flame className="size-6" aria-hidden />
      </span>
      <p className="text-sm font-bold text-white">
        {details.schoolRank != null
          ? t("schoolRank", { rank: details.schoolRank })
          : "—"}
      </p>
    </article>
  );
}

function SubjectsSection({ details }: { details: ParentChildDetails }) {
  const t = useTranslations("parent.dashboard.childrenManagement.details");
  const locale = useLocale();
  const subjects = details.subjects ?? [];

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold text-[#2b415e]">{t("subjectsTitle")}</h2>
      {subjects.length === 0 ? (
        <p className="rounded-[16px] border border-dashed border-[#cbd5e1] bg-white p-6 text-center text-sm text-[#64748b]">
          {t("noSubjects")}
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject, index) => {
            const name = resolveLocalizedText(
              locale,
              subject.subjectNameAr,
              subject.subjectNameEn,
            );
            const level = resolveLocalizedText(
              locale,
              subject.levelLabelAr,
              subject.levelLabelEn,
            );
            return (
              <article
                key={subject.subjectId ?? `${name}-${index}`}
                className="flex flex-col gap-3 rounded-[16px] bg-white p-5 shadow-[0px_8px_0px_rgba(0,0,0,0.05)]"
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="truncate text-sm font-bold text-[#2b415e]">{name}</h3>
                  {level ? (
                    <span className="shrink-0 rounded-full bg-[#f1f3f5] px-2 py-0.5 text-[10px] font-bold text-[#64748b]">
                      {level}
                    </span>
                  ) : null}
                </div>
                <ParentProgressBar
                  value={subject.progressPercent}
                  barClassName={index % 2 === 0 ? "bg-[#58cc02]" : "bg-[#2b415e]"}
                />
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#2b415e]">
                    {formatPercent(subject.progressPercent)}
                  </span>
                  {subject.totalLessons ? (
                    <span className="text-[#94a3b8]">
                      {t("lessons", {
                        completed: subject.completedLessons ?? 0,
                        total: subject.totalLessons,
                      })}
                    </span>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

function LearningPathSection({ details }: { details: ParentChildDetails }) {
  const t = useTranslations("parent.dashboard.childrenManagement.details");
  const locale = useLocale();
  const learningPath = details.learningPath;
  const items = learningPath?.items ?? [];
  const unitTitle = learningPath
    ? resolveLocalizedText(locale, learningPath.unitTitleAr, learningPath.unitTitleEn)
    : "";

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-bold text-[#2b415e]">{t("learningPath")}</h2>
        {unitTitle ? <p className="text-sm text-[#64748b]">{unitTitle}</p> : null}
      </div>

      {items.length === 0 ? (
        <p className="rounded-[16px] border border-dashed border-[#cbd5e1] bg-white p-6 text-center text-sm text-[#64748b]">
          {t("noLearningPath")}
        </p>
      ) : (
        <ul className="divide-y divide-[#f1f3f5] rounded-[16px] bg-white shadow-[0px_8px_0px_rgba(0,0,0,0.05)]">
          {items.map((item) => {
            const tone = getLearningPathStatusTone(item.status);
            const title = resolveLocalizedText(locale, item.titleAr, item.titleEn);
            return (
              <li key={item.id} className="flex items-center gap-3 px-5 py-4">
                <span className={cn("size-2.5 shrink-0 rounded-full", tone.dot)} aria-hidden />
                <div className="min-w-0 flex-1 text-start">
                  <p className="truncate text-sm font-bold text-[#0f172a]">{title}</p>
                  <p className="text-xs text-[#94a3b8]">{item.itemType}</p>
                </div>
                {item.scoreLabel || item.progressLabel ? (
                  <span className={cn("shrink-0 rounded-full px-3 py-1 text-xs font-bold", tone.badge)}>
                    {item.scoreLabel || item.progressLabel}
                  </span>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export function ParentChildDetailsDashboard({ studentUserId }: { studentUserId: string }) {
  const t = useTranslations("parent.dashboard.childrenManagement.details");
  const tCommon = useTranslations("parent.dashboard.common");
  const locale = useLocale();
  const { data: details, isLoading, isError, refetch, isFetching } =
    useParentChildDetails(studentUserId);

  if (isLoading) {
    return (
      <div className="flex w-full flex-col gap-8">
        <Skeleton className="h-52 w-full rounded-[24px]" />
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-28 rounded-[16px]" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-12">
          <Skeleton className="h-96 rounded-[20px] lg:col-span-8" />
          <Skeleton className="h-96 rounded-[20px] lg:col-span-4" />
        </div>
      </div>
    );
  }

  if (isError || !details) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-[20px] border border-red-100 bg-white p-6">
        <p className="text-sm text-red-600">{tCommon("error")}</p>
        <Button type="button" onClick={() => refetch()} disabled={isFetching}>
          {tCommon("retry")}
        </Button>
      </div>
    );
  }

  const progress = clampPercent(details.progressPercent);
  const grade = resolveLocalizedText(locale, details.gradeNameAr, details.gradeNameEn);
  const educationLevel = resolveLocalizedText(
    locale,
    details.educationLevelNameAr,
    details.educationLevelNameEn,
  );
  const gradeLine = [grade, educationLevel, details.schoolName].filter(Boolean).join(" - ");
  const estimatedLevel = getEstimatedLevel(details);

  return (
    <div className="mx-auto flex w-full flex-col gap-8 pb-8">
      <p className="text-xs text-[#64748b]">{t("breadcrumb")}</p>

      <section className="flex flex-col gap-6 rounded-[24px] border-2 border-[rgba(226,232,240,0.3)] bg-white p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-1 items-center gap-4 sm:gap-6">
          <div className="relative shrink-0">
            <ParentAvatar
              url={details.profileImageUrl}
              name={details.fullName}
              className="size-20 border-4 border-[rgba(199,175,109,0.2)] sm:size-24"
              roundedClassName="rounded-full"
            />
            <span className="absolute -bottom-1 -start-1 rounded-full bg-[#c7af6d] px-2 py-1 text-[10px] font-bold text-white">
              {estimatedLevel}
            </span>
          </div>
          <div className="min-w-0 space-y-2 text-start">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-[#2b415e] sm:text-[28px]">
                {details.fullName}
              </h1>
              <span
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-bold",
                  details.isActive
                    ? "bg-[#dcf4cb] text-[#46a302]"
                    : "bg-[#ffe4e4] text-[#d33131]",
                )}
              >
                {details.isActive ? t("activeAccount") : t("inactiveAccount")}
              </span>
            </div>
            {gradeLine ? <p className="text-sm text-[#64748b]">{gradeLine}</p> : null}
            <div className="max-w-xs space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-[#64748b]">{t("generalProgress")}</span>
                <span className="font-bold text-[#2b415e]">{formatPercent(progress)}</span>
              </div>
              <ParentProgressBar value={progress} barClassName="bg-[#58cc02]" />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            asChild
            className="h-11 gap-2 rounded-xl bg-[#2b415e] px-5 text-sm font-bold text-white hover:bg-[#24384f]"
          >
            <Link href={ROUTES.USER.PARENT.CHILD_REPORT(studentUserId)}>
              <ClipboardList className="size-4" aria-hidden />
              {t("viewReport")}
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-11 gap-2 rounded-xl border-[#e2e8f0] bg-[#f8f9fa] px-5 text-sm font-bold text-[#2b415e]"
          >
            <Link href={ROUTES.USER.PARENT.CHILD_LEARNING(studentUserId)}>
              <BookOpen className="size-4" aria-hidden />
              {t("viewLearning")}
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-11 gap-2 rounded-xl border-[#e2e8f0] bg-[#f8f9fa] px-5 text-sm font-bold text-[#2b415e]"
          >
            <Link href={ROUTES.USER.PARENT.CHILD_SETTINGS(studentUserId)}>
              <Settings className="size-4" aria-hidden />
              {t("updateData")}
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-11 gap-2 rounded-xl border-[#e2e8f0] bg-[#f8f9fa] px-5 text-sm font-bold text-[#2b415e]"
          >
            <Link href={ROUTES.USER.PARENT.CHILD_SCHEDULE(studentUserId)}>
              <CalendarDays className="size-4" aria-hidden />
              {t("viewSchedule")}
            </Link>
          </Button>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <KpiCard label={t("totalProgress")} value={formatPercent(progress)} accent="bg-[#58cc02]" />
        <KpiCard
          label={t("totalExams")}
          value={String(details.examStats?.totalAttempts ?? 0)}
          accent="bg-[#2b415e]"
        />
        <KpiCard
          label={t("completedStations")}
          value={`${details.completedStationsCount ?? 0}/${details.totalStationsCount ?? 0}`}
          accent="bg-[#c7af6d]"
        />
        <KpiCard
          label={t("examAverage")}
          value={formatPercent(details.examStats?.averageScorePercent ?? 0)}
          accent="bg-[#d33131]"
        />
        <KpiCard
          label={t("activityDays")}
          value={t("daysPerMonth", { count: details.activeDaysLast30 ?? 0 })}
          accent="bg-[#58cc02]"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-8 lg:col-span-8">
          <SubjectsSection details={details} />
          <LearningPathSection details={details} />
        </div>
        <div className="space-y-6 lg:col-span-4">
          <AlertsPanel alerts={details.alerts ?? []} />
          <AchievementsPanel details={details} />
          <RecentActivityPanel details={details} />
          <SchoolRankCard details={details} />
        </div>
      </div>
    </div>
  );
}
