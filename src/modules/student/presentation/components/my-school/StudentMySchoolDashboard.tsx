"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Building2,
  CalendarDays,
  Star,
  Trophy,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { formatNumber } from "@/shared/application/lib/format";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import {
  DashboardBreadcrumb,
  DashboardPageHeader,
} from "@/shared/presentation/components/dashboard";
import { ApiFailureAlert } from "@/shared/presentation/components/ui/ApiFailureAlert";
import { Button } from "@/shared/presentation/components/ui/button";
import { UserAvatarImageOrInitials } from "@/shared/presentation/components/user/UserAvatarImageOrInitials";
import { useStudentMySchool } from "@/modules/student/application/hooks/useStudentMySchool";
import { SchoolEventCard } from "@/modules/student/presentation/components/school-events/SchoolEventCard";
import { SchoolEventsPageSkeleton } from "@/modules/student/presentation/components/school-events/SchoolEventsSkeleton";
import { StudentSchoolLinkGate } from "@/modules/student/presentation/components/school-events/StudentSchoolLinkGate";

const PODIUM_ORDER = [2, 1, 3] as const;

function KpiCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof Trophy;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-start">
        <p className="text-xs text-slate-500">{label}</p>
        <p className="mt-1 text-lg font-bold text-[#1e3a5f]">{value}</p>
      </div>
      <span className="flex size-10 items-center justify-center rounded-xl bg-[#eef3f9] text-[#1e3a5f]">
        <Icon className="size-5" aria-hidden />
      </span>
    </div>
  );
}

export function StudentMySchoolDashboard() {
  const t = useTranslations("student.dashboard.mySchool");
  const tEvents = useTranslations("student.dashboard.schoolEvents");
  const locale = useLocale();
  const {
    profileQuery,
    linked,
    schoolRankQuery,
    schoolLeadersQuery,
    kpisQuery,
    eventsPreviewQuery,
    isInitialLoading,
  } = useStudentMySchool();

  if (profileQuery.isLoading && !profileQuery.data) {
    return <SchoolEventsPageSkeleton />;
  }

  if (profileQuery.isError && !profileQuery.data) {
    return (
      <div className="space-y-4">
        <ApiFailureAlert
          message={
            profileQuery.error instanceof Error
              ? profileQuery.error.message
              : null
          }
          fallbackMessage={t("errors.load")}
        />
        <Button variant="outline" onClick={() => void profileQuery.refetch()}>
          {t("errors.retry")}
        </Button>
      </div>
    );
  }

  if (!linked && profileQuery.data) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <DashboardBreadcrumb
            items={[
              { label: t("page.breadcrumbHome"), href: ROUTES.USER.STUDENT.HOME },
              { label: t("page.breadcrumbCurrent") },
            ]}
          />
          <DashboardPageHeader
            title={t("page.title")}
            description={t("page.description")}
          />
        </div>
        <StudentSchoolLinkGate profile={profileQuery.data} />
      </div>
    );
  }

  if (isInitialLoading) {
    return <SchoolEventsPageSkeleton />;
  }

  const schoolName =
    schoolRankQuery.data?.schoolName ||
    profileQuery.data?.schoolName ||
    t("kpis.schoolName");
  const schoolRank = schoolRankQuery.data?.rank;
  const myPoints = schoolRankQuery.data?.currentPoints ?? 0;
  const ongoingCount = kpisQuery.data?.ongoingCount ?? 0;
  const leaders = schoolLeadersQuery.data;
  const byRank = new Map(
    (leaders?.topThree ?? []).map((entry) => [entry.rank, entry]),
  );
  const previewEvents = eventsPreviewQuery.data?.items ?? [];
  const profile = profileQuery.data;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <DashboardBreadcrumb
          items={[
            { label: t("page.breadcrumbHome"), href: ROUTES.USER.STUDENT.HOME },
            { label: t("page.breadcrumbCurrent") },
          ]}
        />
        <DashboardPageHeader
          title={t("page.title")}
          description={t("page.description")}
        />
      </div>

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[1.5rem] border border-slate-200 bg-gradient-to-l from-[#1e3a5f] to-[#2c4260] p-5 text-white shadow-sm sm:p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1 text-start">
            <p className="text-sm text-white/70">{t("eventsCta.title")}</p>
            <h2 className="text-xl font-bold">{schoolName}</h2>
            <p className="max-w-xl text-sm leading-6 text-white/80">
              {t("eventsCta.description")}
            </p>
          </div>
          <Button
            asChild
            className="min-h-12 rounded-xl bg-white px-6 font-semibold text-[#1e3a5f] hover:translate-y-0 hover:bg-slate-100"
          >
            <Link href={ROUTES.USER.STUDENT.EVENTS}>
              <CalendarDays className="size-4" aria-hidden />
              {t("eventsCta.button")}
            </Link>
          </Button>
        </div>
      </motion.section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label={t("kpis.schoolRank")}
          value={schoolRank != null ? `#${formatNumber(schoolRank, locale)}` : "—"}
          icon={Trophy}
        />
        <KpiCard
          label={t("kpis.myPoints")}
          value={formatNumber(myPoints, locale)}
          icon={Star}
        />
        <KpiCard
          label={t("kpis.ongoingEvents")}
          value={formatNumber(ongoingCount, locale)}
          icon={CalendarDays}
        />
        <KpiCard label={t("kpis.schoolName")} value={schoolName} icon={Building2} />
      </section>

      <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="mb-2 flex items-center gap-2">
          <h2 className="text-xl font-bold text-[#1e3a5f]">{t("leaderboard.title")}</h2>
          <Trophy className="size-5 text-[#c7af6d]" aria-hidden />
        </div>
        <p className="mb-6 text-sm text-slate-500">{t("leaderboard.subtitle")}</p>

        {schoolLeadersQuery.isError && !(leaders?.topThree.length ?? 0) ? (
          <ApiFailureAlert
            message={
              schoolLeadersQuery.error instanceof Error
                ? schoolLeadersQuery.error.message
                : null
            }
            fallbackMessage={t("errors.load")}
          />
        ) : null}

        {(leaders?.topThree.length ?? 0) === 0 ? (
          <p className="py-10 text-center text-sm text-slate-500">
            {t("leaderboard.empty")}
          </p>
        ) : (
          <div className="flex items-end justify-center gap-6 pb-2 pt-4">
            {PODIUM_ORDER.map((rank) => {
              const entry = byRank.get(rank);
              if (!entry) return <div key={rank} className="w-20" />;
              const featured = rank === 1;
              return (
                <div
                  key={entry.userId || rank}
                  className={`flex flex-col items-center ${featured ? "-mt-2" : "mt-4"}`}
                >
                  <div className="relative">
                    <div
                      className={`rounded-full border-4 p-0.5 ${
                        featured ? "border-[#c7af6d]" : "border-slate-200"
                      }`}
                    >
                      <UserAvatarImageOrInitials
                        trackKey={entry.userId}
                        name={entry.fullName}
                        imageUrl={entry.profileImageUrl}
                        size={featured ? "xl" : "large"}
                        circleClassName="bg-[#DCE6F5] text-[#2C4260]"
                      />
                    </div>
                    <span
                      className={`absolute -bottom-2 start-1/2 flex -translate-x-1/2 items-center justify-center rounded-full font-extrabold ${
                        featured
                          ? "size-6 bg-[#c7af6d] text-[#141c27]"
                          : "size-5 bg-slate-200 text-slate-700"
                      }`}
                    >
                      {rank}
                    </span>
                  </div>
                  <p
                    className={`mt-4 text-center font-bold text-[#2b415e] ${
                      featured ? "text-sm" : "text-xs"
                    }`}
                  >
                    {entry.fullName}
                  </p>
                  {entry.gradeLabel ? (
                    <p className="mt-0.5 text-center text-[10px] text-slate-400">
                      {entry.gradeLabel}
                    </p>
                  ) : null}
                  <p className="mt-1 text-center text-xs text-slate-500">
                    {t("leaderboard.points", {
                      count: formatNumber(entry.points, locale),
                    })}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {schoolRank != null && profile ? (
          <div className="mt-6 flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3">
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-slate-400">
                {formatNumber(schoolRank, locale)}
              </span>
              <UserAvatarImageOrInitials
                trackKey={profile.userId}
                name={profile.fullName}
                imageUrl={profile.profileImageUrl}
                size="sm"
                shape="square"
              />
              <div className="text-start">
                <p className="text-sm font-semibold text-[#2b415e]">{profile.fullName}</p>
                <p className="text-xs text-slate-500">{t("leaderboard.you")}</p>
              </div>
            </div>
            <span className="rounded-full bg-[#dbe3f3] px-2 py-0.5 text-xs font-bold text-[#2b415e]">
              {formatNumber(myPoints, locale)}
            </span>
          </div>
        ) : null}

        {(leaders?.others.length ?? 0) > 0 ? (
          <div className="mt-6 space-y-2 border-t border-slate-100 pt-5">
            <h3 className="text-sm font-bold text-[#1e3a5f]">
              {t("leaderboard.othersTitle")}
            </h3>
            <ul className="divide-y divide-slate-100">
              {leaders!.others.slice(0, 7).map((entry) => (
                <li
                  key={entry.userId || entry.rank}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="w-6 text-sm font-bold text-slate-400">
                      {formatNumber(entry.rank, locale)}
                    </span>
                    <UserAvatarImageOrInitials
                      trackKey={entry.userId}
                      name={entry.fullName}
                      imageUrl={entry.profileImageUrl}
                      size="sm"
                    />
                    <div className="min-w-0 text-start">
                      <p className="truncate text-sm font-semibold text-[#2b415e]">
                        {entry.fullName}
                      </p>
                      {entry.gradeLabel ? (
                        <p className="truncate text-xs text-slate-400">{entry.gradeLabel}</p>
                      ) : null}
                    </div>
                  </div>
                  <span className="shrink-0 text-xs font-bold text-[#2b415e]">
                    {formatNumber(entry.points, locale)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-[#1e3a5f]">
            {t("currentEvents.title")}
          </h2>
          <Button asChild variant="outline" className="rounded-xl hover:translate-y-0">
            <Link href={ROUTES.USER.STUDENT.EVENTS}>{t("currentEvents.viewAll")}</Link>
          </Button>
        </div>

        {previewEvents.length === 0 ? (
          <p className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
            {t("currentEvents.empty")}
          </p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {previewEvents.map((event) => (
              <SchoolEventCard
                key={event.id}
                event={event}
                participantsLabel={(count) => tEvents("participants", { count })}
                statusLabel={
                  event.statusLabel ||
                  tEvents(`status.${event.status}` as "status.Ongoing")
                }
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
