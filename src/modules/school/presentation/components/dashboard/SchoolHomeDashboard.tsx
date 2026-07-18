"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  BellRing,
  BookOpen,
  Medal,
  Megaphone,
  Trophy,
  UserPlus,
  Users,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useSchoolHome } from "@/modules/school/application/hooks/useSchoolHome";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { DashboardStatCard } from "@/shared/presentation/components/dashboard";
import { UserAvatarImageOrInitials } from "@/shared/presentation/components/user";
import { Button } from "@/shared/presentation/components/ui/button";
import { ApiFailureAlert } from "@/shared/presentation/components/ui/ApiFailureAlert";
import { SchoolArticlesTable } from "./SchoolArticlesTable";
import { SchoolHomeSkeleton } from "./SchoolHomeSkeleton";

function CompetitionProgress({ value }: { value: number }) {
  const reduceMotion = useReducedMotion();
  const percent = Math.min(100, Math.max(0, value));
  const radius = 62;
  const circumference = 2 * Math.PI * radius;
  return (
    <div className="relative h-40 w-40" aria-label={`${percent}%`}>
      <svg className="-rotate-90" viewBox="0 0 144 144" role="img">
        <circle cx="72" cy="72" r={radius} fill="none" stroke="#E8EDF3" strokeWidth="9" />
        <motion.circle
          cx="72"
          cy="72"
          r={radius}
          fill="none"
          stroke="var(--dashboard-primary)"
          strokeLinecap="round"
          strokeWidth="9"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - percent / 100) }}
          transition={{ duration: reduceMotion ? 0 : 0.9, ease: "easeOut" }}
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center text-3xl font-bold text-slate-800">
        {percent.toLocaleString()}%
      </span>
    </div>
  );
}

export function SchoolHomeDashboard() {
  const t = useTranslations("school.dashboard.homePage");
  const common = useTranslations("school.dashboard.common");
  const { data, isLoading, isError, refetch } = useSchoolHome();

  if (isLoading) return <SchoolHomeSkeleton label={common("loading")} />;
  if (isError || !data) {
    return (
      <div className="space-y-4">
        <ApiFailureAlert fallbackMessage={common("error")} />
        <Button type="button" onClick={() => void refetch()}>
          {common("retry")}
        </Button>
      </div>
    );
  }

  const kpis = [
    {
      id: "students",
      label: t("kpis.students"),
      value: data.kpis.registeredStudentsCount.toLocaleString(),
      indicator:
        data.kpis.studentsGrowthLabel ||
        t("kpis.studentGrowth", { value: data.kpis.studentsGrowthPercent }),
      icon: Users,
      iconTone: "primary" as const,
    },
    {
      id: "rank",
      label: t("kpis.rank"),
      value: `#${data.kpis.schoolRank.toLocaleString()}`,
      indicator: [data.kpis.performanceBadge, t("kpis.totalSchools", {
        total: data.kpis.totalSchools,
      })]
        .filter(Boolean)
        .join(" • "),
      icon: Trophy,
      iconTone: "warning" as const,
    },
    {
      id: "courses",
      label: t("kpis.activeCourses"),
      value: data.kpis.activeCoursesCount.toLocaleString(),
      indicator: t("kpis.courseProgress", {
        value: data.kpis.activeCoursesProgressPercent,
      }),
      icon: BookOpen,
      iconTone: "success" as const,
    },
    {
      id: "registrations",
      label: t("kpis.todayRegistrations"),
      value: data.kpis.todayRegistrationsCount.toLocaleString(),
      indicator: data.kpis.lastRegistrationAgoText,
      icon: UserPlus,
      iconTone: "danger" as const,
    },
  ];

  return (
    <div className="space-y-7">
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 rounded-[1.75rem] border border-white/80 bg-white p-5 shadow-[var(--dashboard-shadow-soft)] sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-4">
          <UserAvatarImageOrInitials
            trackKey={data.schoolId}
            name={data.schoolName || t("schoolFallback")}
            imageUrl={data.schoolLogoUrl}
            circleClassName="h-14 w-14 bg-[#F8EFD5] text-[#8F6C0B]"
          />
          <div>
            <p className="text-sm text-slate-400">{t("welcome")}</p>
            <h1 className="text-xl font-bold text-slate-800">
              {data.schoolName || t("schoolFallback")}
            </h1>
          </div>
        </div>
        {data.hasUnreadNotifications ? (
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600">
            <BellRing className="h-4 w-4" aria-hidden />
            {t("unreadNotifications")}
          </span>
        ) : null}
      </motion.section>

      <motion.section
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
      >
        {kpis.map((kpi) => (
          <motion.div
            key={kpi.id}
            variants={{
              hidden: { opacity: 0, y: 14 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
            }}
          >
            <DashboardStatCard
              label={kpi.label}
              value={kpi.value}
              indicator={kpi.indicator}
              icon={kpi.icon}
              iconTone={kpi.iconTone}
              indicatorClassName="text-xs text-slate-400"
            />
          </motion.div>
        ))}
      </motion.section>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-[2rem] border border-white/80 bg-white p-6 shadow-[var(--dashboard-shadow-soft)]">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-800">{t("announcements.title")}</h2>
              <p className="mt-1 text-sm text-slate-400">{t("announcements.subtitle")}</p>
            </div>
            <Button asChild variant="ghost" className="text-[var(--dashboard-primary)]">
              <Link href={ROUTES.USER.SCHOOL.ANNOUNCEMENTS.LIST}>
                {t("announcements.viewAll")}
              </Link>
            </Button>
          </div>
          <div className="space-y-3">
            {data.latestAnnouncements.length ? (
              data.latestAnnouncements.map((announcement, index) => (
                <motion.div
                  key={announcement.id}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className="flex items-center gap-4 rounded-2xl bg-slate-50 p-4"
                >
                  <span
                    className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${
                      announcement.isUrgent
                        ? "bg-rose-100 text-rose-600"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {announcement.isUrgent ? (
                      <BellRing className="h-5 w-5" />
                    ) : (
                      <Megaphone className="h-5 w-5" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-slate-800">{announcement.title}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {announcement.dateLabel || "—"}
                    </p>
                  </div>
                  {announcement.priorityLabel ? (
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500">
                      {announcement.priorityLabel}
                    </span>
                  ) : null}
                </motion.div>
              ))
            ) : (
              <p className="py-12 text-center text-sm text-slate-400">
                {t("announcements.empty")}
              </p>
            )}
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/80 bg-white p-6 text-center shadow-[var(--dashboard-shadow-soft)]">
          <Trophy className="mx-auto mb-2 h-7 w-7 text-[var(--dashboard-gold)]" />
          <h2 className="text-xl font-bold text-slate-800">{t("competition.title")}</h2>
          <p className="mt-1 text-sm text-slate-400">
            {data.competitionCenter.competitionPointsLabel}
          </p>
          <div className="my-5 flex justify-center">
            <CompetitionProgress value={data.competitionCenter.competitionPointsPercent} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
              <p className="text-xs text-slate-400">{t("competition.rank")}</p>
              <p className="mt-1 font-bold text-slate-800">
                {data.competitionCenter.competitionRankLabel ||
                  `#${data.competitionCenter.competitionRank}`}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
              <Medal className="mx-auto h-4 w-4 text-[var(--dashboard-gold)]" />
              <p className="mt-1 text-xs text-slate-400">
                {t("competition.medals", {
                  count: data.competitionCenter.medalsCount,
                })}
              </p>
            </div>
          </div>
          <p className="mt-4 text-xs text-slate-400">
            {t("competition.points", {
              current: data.competitionCenter.thisSchoolTotalPoints,
              top: data.competitionCenter.topSchoolTotalPoints,
            })}
          </p>
        </section>
      </div>

      <SchoolArticlesTable
        articles={data.latestArticles}
        totalCount={data.articlesTotalCount}
        action={
          <Button asChild variant="outline" className="rounded-xl">
            <Link href={ROUTES.USER.SCHOOL.ARTICLES}>{t("articles.viewAll")}</Link>
          </Button>
        }
      />
    </div>
  );
}
