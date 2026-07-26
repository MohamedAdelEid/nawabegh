"use client";

import { useLocale, useTranslations } from "next-intl";
import {
  DashboardBreadcrumb,
  DashboardPageHeader,
} from "@/shared/presentation/components/dashboard";
import { ApiFailureAlert } from "@/shared/presentation/components/ui/ApiFailureAlert";
import { Button } from "@/shared/presentation/components/ui/button";
import { formatNumber } from "@/shared/application/lib/format";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { useStudentHomeProfile } from "@/modules/student/application/hooks/useStudentHomeDashboard";
import {
  useSchoolEvents,
  type SchoolEventsInitialData,
} from "@/modules/student/application/hooks/useSchoolEvents";
import type { SchoolEventStatusFilter } from "@/modules/student/domain/types/schoolEvent.types";
import { SchoolEventCard } from "./SchoolEventCard";
import { SchoolEventsFilterTabs } from "./SchoolEventsFilterTabs";
import { SchoolEventsPageSkeleton } from "./SchoolEventsSkeleton";
import {
  hasLinkedSchool,
  StudentSchoolLinkGate,
} from "./StudentSchoolLinkGate";

function KpiCard({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className={`text-2xl font-bold ${tone ?? "text-[#1e3a5f]"}`}>{value}</p>
      <p className="mt-1 text-xs text-slate-500">{label}</p>
    </div>
  );
}

type SchoolEventsDashboardProps = {
  initial?: SchoolEventsInitialData;
};

export function SchoolEventsDashboard({ initial }: SchoolEventsDashboardProps) {
  const t = useTranslations("student.dashboard.schoolEvents");
  const locale = useLocale();
  const profileQuery = useStudentHomeProfile();
  const linked = hasLinkedSchool(profileQuery.data);

  const {
    eventsQuery,
    kpisQuery,
    events,
    status,
    setStatus,
    filterOptions,
    loadedCount,
    totalCount,
    hasNext,
    progress,
    loadMore,
    isLoadingMore,
  } = useSchoolEvents({ initial, enabled: linked });

  const resolvedFilters = filterOptions.map((option) => ({
    value: option.value,
    label:
      option.label === option.value
        ? t(`filters.${option.value}` as "filters.all")
        : option.label,
  }));

  const error =
    eventsQuery.error instanceof Error ? eventsQuery.error.message : null;

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
              {
                label: t("page.breadcrumbMySchool"),
                href: ROUTES.USER.STUDENT.SCHOOL,
              },
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

  if (eventsQuery.isLoading && events.length === 0) {
    return <SchoolEventsPageSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <DashboardBreadcrumb
          items={[
            { label: t("page.breadcrumbHome"), href: ROUTES.USER.STUDENT.HOME },
            {
              label: t("page.breadcrumbMySchool"),
              href: ROUTES.USER.STUDENT.SCHOOL,
            },
            { label: t("page.breadcrumbCurrent") },
          ]}
        />
        <DashboardPageHeader
          title={t("page.title")}
          description={t("page.description")}
        />
      </div>

      {kpisQuery.data ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            label={t("kpis.ongoing")}
            value={formatNumber(kpisQuery.data.ongoingCount, locale)}
            tone="text-emerald-700"
          />
          <KpiCard
            label={t("kpis.published")}
            value={formatNumber(kpisQuery.data.publishedCount, locale)}
            tone="text-sky-700"
          />
          <KpiCard
            label={t("kpis.finished")}
            value={formatNumber(kpisQuery.data.finishedCount, locale)}
          />
          <KpiCard
            label={t("kpis.total")}
            value={formatNumber(kpisQuery.data.totalCount, locale)}
          />
        </div>
      ) : null}

      <SchoolEventsFilterTabs
        value={status}
        options={resolvedFilters}
        onChange={(value: SchoolEventStatusFilter) => setStatus(value)}
      />

      {error && events.length === 0 ? (
        <div className="space-y-4">
          <ApiFailureAlert message={error} fallbackMessage={t("errors.load")} />
          <Button variant="outline" onClick={() => void eventsQuery.refetch()}>
            {t("errors.retry")}
          </Button>
        </div>
      ) : null}

      {events.length === 0 && !eventsQuery.isLoading ? (
        <p className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
          {t("empty")}
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {events.map((event) => (
            <SchoolEventCard
              key={event.id}
              event={event}
              participantsLabel={(count) => t("participants", { count })}
              statusLabel={
                event.statusLabel || t(`status.${event.status}` as "status.Ongoing")
              }
            />
          ))}
        </div>
      )}

      {totalCount > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 text-sm text-slate-600">
            <span>
              {t("footer.showing", {
                loaded: formatNumber(loadedCount, locale),
                total: formatNumber(totalCount, locale),
              })}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-[#1e3a5f] transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          {hasNext ? (
            <div className="flex justify-center">
              <Button
                type="button"
                variant="outline"
                onClick={loadMore}
                disabled={isLoadingMore}
                className="min-h-12 rounded-xl border-[#1e3a5f]/30 px-8 text-[#1e3a5f] hover:translate-y-0"
              >
                {isLoadingMore ? t("footer.loading") : t("footer.loadMore")}
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
