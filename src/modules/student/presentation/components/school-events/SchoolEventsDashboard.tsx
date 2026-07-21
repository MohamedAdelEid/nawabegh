"use client";

import { useTranslations } from "next-intl";
import {
  DashboardBreadcrumb,
  DashboardPageHeader,
} from "@/shared/presentation/components/dashboard";
import { ApiFailureAlert } from "@/shared/presentation/components/ui/ApiFailureAlert";
import { Button } from "@/shared/presentation/components/ui/button";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import {
  useSchoolEvents,
  type SchoolEventsInitialData,
} from "@/modules/student/application/hooks/useSchoolEvents";
import type { SchoolEventStatusFilter } from "@/modules/student/domain/types/schoolEvent.types";
import { SchoolEventCard } from "./SchoolEventCard";
import { SchoolEventsFilterTabs } from "./SchoolEventsFilterTabs";
import { SchoolEventsPageSkeleton } from "./SchoolEventsSkeleton";

type SchoolEventsDashboardProps = {
  initial?: SchoolEventsInitialData;
};

export function SchoolEventsDashboard({ initial }: SchoolEventsDashboardProps) {
  const t = useTranslations("student.dashboard.schoolEvents");

  const {
    eventsQuery,
    events,
    status,
    setStatus,
    loadedCount,
    totalCount,
    hasNext,
    progress,
    loadMore,
    isLoadingMore,
  } = useSchoolEvents({ initial });

  const filterOptions: { value: SchoolEventStatusFilter; label: string }[] = [
    { value: "all", label: t("filters.all") },
    { value: "live", label: t("filters.live") },
    { value: "published", label: t("filters.published") },
    { value: "draft", label: t("filters.draft") },
    { value: "ended", label: t("filters.ended") },
  ];

  const error =
    eventsQuery.error instanceof Error ? eventsQuery.error.message : null;

  if (eventsQuery.isLoading && events.length === 0) {
    return <SchoolEventsPageSkeleton />;
  }

  return (
    <div className="space-y-8">
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

      <SchoolEventsFilterTabs
        value={status}
        options={filterOptions}
        onChange={setStatus}
      />

      {error && events.length === 0 ? (
        <ApiFailureAlert message={error} fallbackMessage={t("errors.load")} />
      ) : null}

      {events.length === 0 && !eventsQuery.isLoading ? (
        <p className="rounded-2xl border border-dashed border-[#e2e8f0] bg-white px-6 py-16 text-center text-[#64748b]">
          {t("empty")}
        </p>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
          {events.map((event) => (
            <SchoolEventCard key={event.id} event={event} />
          ))}
        </div>
      )}

      {totalCount > 0 ? (
        <div className="flex flex-col items-center gap-4 pt-4">
          <p className="text-sm font-medium text-[#64748b]">
            {t("footer.showing", { loaded: loadedCount, total: totalCount })}
          </p>
          <div className="h-1.5 w-full max-w-md overflow-hidden rounded-full bg-[#e2e8f0]">
            <div
              className="h-full rounded-full bg-[#2b415e] transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          {hasNext ? (
            <Button
              type="button"
              variant="outline"
              onClick={loadMore}
              disabled={isLoadingMore}
              className="h-12 rounded-xl border-2 border-[#2b415e] bg-white px-8 text-base font-bold text-[#2b415e] hover:bg-[#f8fafc]"
            >
              {t("footer.loadMore")}
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
