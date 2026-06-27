"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useTeacherLiveAnalytics } from "@/modules/teacher/application/hooks/useTeacherLiveAnalytics";
import { DashboardPageHeader } from "@/shared/presentation/components/dashboard/DashboardPageHeader";
import { DashboardPagination } from "@/shared/presentation/components/dashboard/DashboardPagination";
import { DashboardTableCard } from "@/shared/presentation/components/dashboard/DashboardTableCard";
import { Button } from "@/shared/presentation/components/ui/button";
import { Input } from "@/shared/presentation/components/ui/input";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { TeacherAbsentStudentsDashboardSkeleton } from "@/modules/teacher/presentation/components/live-analytics/TeacherAbsentStudentsDashboardSkeleton";

const SEARCH_DEBOUNCE_MS = 350;
const PAGE_SIZE = 10;

export function TeacherAbsentStudentsDashboard() {
  const t = useTranslations("teacher.dashboard");
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedKeyword(keyword.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timeoutId);
  }, [keyword]);

  useEffect(() => {
    setPage(1);
  }, [debouncedKeyword]);

  const { data, isPending, isFetching, isError } = useTeacherLiveAnalytics({
    chartPeriod: "weekly",
    absentKeyword: debouncedKeyword,
    absentPage: page,
    absentPageSize: PAGE_SIZE,
  });

  const pages = useMemo(() => {
    if (!data) return [1];
    const totalPages = Math.max(Math.ceil(data.totalAbsentCount / PAGE_SIZE), 1);
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }, [data]);

  if (isPending && !data) {
    return <TeacherAbsentStudentsDashboardSkeleton label={t("common.loading")} />;
  }

  if (isError || !data) {
    return <p className="text-sm text-red-600">{t("common.error")}</p>;
  }

  const from =
    data.totalAbsentCount === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, data.totalAbsentCount);

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        breadcrumbs={[
          {
            label: t("liveSessionsHub.title"),
            href: `${ROUTES.USER.TEACHER.LIVE_SESSIONS}?tab=analytics`,
          },
          { label: t("liveAnalytics.absent.pageTitle") },
        ]}
        title={t("liveAnalytics.absent.pageTitle")}
        description={t("liveAnalytics.absent.pageDescription")}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          placeholder={t("liveAnalytics.absent.search")}
          className="max-w-md rounded-xl text-right"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
        />
        <Button variant="outline" className="rounded-xl border-[#2C4260] text-[#2C4260]">
          {t("liveAnalytics.absent.alertAll")}
        </Button>
      </div>

      <DashboardTableCard>
        {data.absentStudents.length === 0 ? (
          <Card className="border-0 shadow-none">
            <CardContent className="p-8 text-center text-sm text-slate-500">
              {t("liveAnalytics.absent.empty")}
            </CardContent>
          </Card>
        ) : (
          <div className="divide-y divide-slate-100">
            {data.absentStudents.map((student) => (
              <div
                key={student.id}
                className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between"
              >
                <Button size="sm" variant="outline" className="rounded-xl self-end sm:self-auto">
                  {t("liveAnalytics.absent.sendReminder")}
                </Button>
                <div className="flex flex-1 items-center justify-end gap-3 text-right">
                  <div>
                    <p className="font-semibold text-slate-800">{student.fullName}</p>
                    <p className="text-xs text-slate-500">{student.lastSeenLabel}</p>
                    {student.sessionTitle ? (
                      <p className="text-sm text-slate-600">{student.sessionTitle}</p>
                    ) : null}
                    {student.courseTitle ? (
                      <p className="text-xs text-slate-400">{student.courseTitle}</p>
                    ) : null}
                  </div>
                  {student.profileImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={student.profileImageUrl}
                      alt={student.fullName}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2C4260] text-sm font-bold text-white">
                      {student.avatarInitials}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {data.totalAbsentCount > 0 ? (
          <div className="flex flex-col gap-4 border-t border-slate-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              {t("liveAnalytics.absent.pagination", { from, to, total: data.totalAbsentCount })}
            </p>
            <DashboardPagination
              pages={pages}
              currentPage={page}
              onPageChange={setPage}
              previousLabel={t("liveSessions.pagination.previous")}
              nextLabel={t("liveSessions.pagination.next")}
            />
          </div>
        ) : null}

        {isFetching && !isPending ? (
          <p className="px-6 pb-4 text-xs text-slate-400">{t("common.loading")}</p>
        ) : null}
      </DashboardTableCard>

      <div className="flex justify-end">
        <Button variant="outline" className="rounded-xl" asChild>
          <Link href={`${ROUTES.USER.TEACHER.LIVE_SESSIONS}?tab=analytics`}>
            {t("liveAnalytics.absent.backToAnalytics")}
          </Link>
        </Button>
      </div>
    </div>
  );
}
