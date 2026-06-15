"use client";

import { Eye, Pencil, Play, Radio, Star, Trash2, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useTeacherLiveSessions } from "@/modules/teacher/application/hooks/useTeacherLiveSessions";
import { DashboardPageHeader } from "@/shared/presentation/components/dashboard/DashboardPageHeader";
import { DashboardStatCard } from "@/shared/presentation/components/dashboard/DashboardStatCard";
import { DashboardBadge } from "@/shared/presentation/components/dashboard/DashboardBadge";
import { DashboardDataTable } from "@/shared/presentation/components/dashboard/DashboardDataTable";
import { DashboardTableCard } from "@/shared/presentation/components/dashboard/DashboardTableCard";
import { DashboardPagination } from "@/shared/presentation/components/dashboard/DashboardPagination";
import { Button } from "@/shared/presentation/components/ui/button";
import { Input } from "@/shared/presentation/components/ui/input";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";
import type { TeacherLiveSessionRow } from "@/modules/teacher/domain/types/teacher.types";

const statIcons = {
  totalStreaming: Radio,
  liveAttendance: Users,
  sessionsRating: Star,
} as const;

const statusTone = {
  live: "danger",
  upcoming: "gold",
  ended: "neutral",
} as const;

export function TeacherLiveSessionsDashboard() {
  const t = useTranslations("teacher.dashboard");
  const router = useRouter();
  const { data, isLoading, isError } = useTeacherLiveSessions();

  if (isLoading) {
    return <Skeleton className="h-96 w-full rounded-[2rem]" />;
  }

  if (isError || !data) {
    return <p className="text-sm text-red-600">{t("common.error")}</p>;
  }

  const { pagination } = data;
  const from = (pagination.currentPage - 1) * pagination.pageSize + 1;
  const to = Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems);

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title={t("liveSessions.title")}
        description={t("liveSessions.description")}
        action={
          <Button className="rounded-xl bg-[#2C4260]">
            <Play className="ml-2 h-4 w-4" />
            {t("liveSessions.actions.startNew")}
          </Button>
        }
      />

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder={t("liveSessions.filters.search")}
          className="max-w-xs rounded-xl text-right"
        />
        <Button variant="outline" className="rounded-xl">
          {t("liveSessions.filters.allSubjects")}
        </Button>
        <Button variant="outline" className="rounded-xl">
          {t("liveSessions.filters.allStatuses")}
        </Button>
        <Button variant="outline" className="rounded-xl">
          {t("liveSessions.filters.advanced")}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {data.stats.map((stat) => {
          const Icon = statIcons[stat.id as keyof typeof statIcons] ?? Radio;
          let value = stat.value;
          if (stat.id === "totalStreaming") {
            value = `${stat.value} ${t("liveSessions.stats.hoursSuffix")}`;
          } else if (stat.id === "liveAttendance") {
            value = `${stat.value} ${t("liveSessions.stats.studentsSuffix")}`;
          }
          return (
            <DashboardStatCard key={stat.id} label={t(stat.labelKey)} value={value} icon={Icon} />
          );
        })}
      </div>

      <DashboardTableCard>
        <DashboardDataTable<TeacherLiveSessionRow>
          rows={data.sessions}
          getRowKey={(row) => row.id}
          emptyMessage={t("liveSessions.table.empty")}
          onRowClick={(row) => router.push(ROUTES.USER.TEACHER.SESSION_DETAILS(row.id))}
          columns={[
            {
              id: "statusIcon",
              header: "",
              headerClassName: "w-12",
              renderCell: (row) =>
                row.status === "live" ? (
                  <Radio className="h-5 w-5 text-red-500" />
                ) : (
                  <span className="inline-block h-5 w-5" />
                ),
            },
            {
              id: "title",
              header: t("liveSessions.table.sessionName"),
              renderCell: (row) => (
                <span className="font-semibold text-slate-800">{t(row.titleKey)}</span>
              ),
            },
            {
              id: "subject",
              header: t("liveSessions.table.subject"),
              renderCell: (row) => t(row.subjectKey),
            },
            {
              id: "lecturer",
              header: t("liveSessions.table.lecturer"),
              renderCell: (row) => t(row.lecturerKey),
            },
            {
              id: "dateTime",
              header: t("liveSessions.table.dateTime"),
              renderCell: (row) => t(row.dateTimeLabelKey),
            },
            {
              id: "duration",
              header: t("liveSessions.table.duration"),
              renderCell: (row) => t(row.durationKey),
            },
            {
              id: "status",
              header: t("liveSessions.table.status"),
              renderCell: (row) => (
                <DashboardBadge tone={statusTone[row.status]}>
                  {t(`liveSessions.status.${row.status}`)}
                </DashboardBadge>
              ),
            },
          ]}
          actionsHeader={t("liveSessions.table.actions")}
          renderActions={(row) => (
            <div className="flex items-center justify-end gap-2">
              <Button
                size="icon"
                variant="ghost"
                aria-label={t("liveSessions.table.view")}
                asChild
              >
                <Link href={ROUTES.USER.TEACHER.SESSION_DETAILS(row.id)}>
                  <Eye className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="icon" variant="ghost" aria-label={t("liveSessions.table.edit")}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="text-red-500"
                aria-label={t("liveSessions.table.delete")}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        />
        <div className="flex flex-col gap-4 border-t border-slate-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            {t("liveSessions.pagination.showing", {
              from,
              to,
              total: pagination.totalItems,
            })}
          </p>
          <DashboardPagination
            pages={Array.from({ length: pagination.totalPages }, (_, i) => i + 1)}
            currentPage={pagination.currentPage}
            onPageChange={() => {}}
            previousLabel={t("liveSessions.pagination.previous")}
            nextLabel={t("liveSessions.pagination.next")}
          />
        </div>
      </DashboardTableCard>
    </div>
  );
}
