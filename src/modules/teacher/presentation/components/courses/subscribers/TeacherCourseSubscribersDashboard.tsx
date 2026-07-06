"use client";

import { useCallback, useMemo } from "react";
import {
  CheckCircle2,
  Download,
  Eye,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useTeacherCourseSubscribersDashboard } from "@/modules/teacher/application/hooks/useTeacherCourseSubscribersDashboard";
import type { TeacherSubscriberListItem } from "@/modules/teacher/domain/types/teacher.types";
import {
  formatEnrolledDate,
  formatSubscriberPercent,
  formatSubscriberRelativeTime,
  progressBarTone,
} from "@/modules/teacher/domain/utils/courseSubscribersDisplay";
import { TeacherCourseSubscribersDashboardSkeleton } from "@/modules/teacher/presentation/components/courses/subscribers/TeacherCourseSubscribersDashboardSkeleton";
import { TeacherCourseSubscribersFilterBar } from "@/modules/teacher/presentation/components/courses/subscribers/TeacherCourseSubscribersFilterBar";
import { formatNumber } from "@/shared/application/lib/format";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { cn } from "@/shared/application/lib/cn";
import {
  DashboardBadge,
  DashboardDataTable,
  type DashboardDataTableColumn,
  DashboardPageHeader,
  DashboardPagination,
  DashboardStatCard,
  DashboardTableCard,
} from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";
import { UserAvatarImageOrInitials } from "@/shared/presentation/components/user";

function SubscriberProgressBar({ percent }: { percent: number }) {
  const clamped = Math.min(100, Math.max(0, percent));
  return (
    <div className="min-w-[8rem] space-y-1 text-right">
      <p className="text-xs font-semibold text-slate-700">{clamped}%</p>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className={cn("h-full rounded-full transition-all", progressBarTone(clamped))}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}

export function TeacherCourseSubscribersDashboard({ courseId }: { courseId: string }) {
  const t = useTranslations("teacher.dashboard");
  const locale = useLocale();
  const router = useRouter();
  const dashboard = useTeacherCourseSubscribersDashboard(courseId);

  const handleViewProfile = useCallback(
    (row: TeacherSubscriberListItem) => {
      router.push(ROUTES.USER.TEACHER.COURSES.SUBSCRIBER_PROFILE(courseId, row.studentUserId));
    },
    [courseId, router],
  );

  const columns = useMemo<Array<DashboardDataTableColumn<TeacherSubscriberListItem>>>(
    () => [
      {
        id: "student",
        header: t("courses.subscribers.table.student"),
        renderCell: (row) => (
          <div className="flex min-w-0 items-center gap-3 sm:min-w-[12rem]">
            <UserAvatarImageOrInitials
              trackKey={row.studentUserId}
              name={row.fullName}
              imageUrl={row.profileImageUrl}
              size="sm"
              circleClassName="bg-[#DCE6F5] text-[#2C4260]"
            />
            <div className="space-y-0.5 text-right">
              <p className="font-semibold text-slate-800">{row.fullName}</p>
              <p className="text-xs text-slate-400">{row.email || row.username}</p>
            </div>
          </div>
        ),
      },
      {
        id: "grade",
        header: t("courses.subscribers.table.grade"),
        cellClassName: "text-slate-600",
        renderCell: (row) => row.gradeName || "—",
      },
      {
        id: "enrolledAt",
        header: t("courses.subscribers.table.enrolledAt"),
        cellClassName: "text-slate-600 whitespace-nowrap",
        renderCell: (row) => formatEnrolledDate(row.enrolledAt, locale),
      },
      {
        id: "progress",
        header: t("courses.subscribers.table.progress"),
        renderCell: (row) => <SubscriberProgressBar percent={row.progressPercent} />,
      },
      {
        id: "lastActivity",
        header: t("courses.subscribers.table.lastActivity"),
        cellClassName: "text-slate-600 whitespace-nowrap",
        renderCell: (row) => formatSubscriberRelativeTime(row.lastActivityAt, locale),
      },
      {
        id: "status",
        header: t("courses.subscribers.table.status"),
        renderCell: (row) => {
          const tone =
            row.statusLabelAr === "نشط"
              ? "success"
              : row.statusLabelAr === "غير نشط"
                ? "danger"
                : "neutral";
          return (
            <DashboardBadge tone={tone} withDot>
              {row.statusLabelAr || (row.isActive ? t("courses.subscribers.table.active") : "—")}
            </DashboardBadge>
          );
        },
      },
      {
        id: "actions",
        header: t("courses.subscribers.table.actions"),
        renderCell: (row) => (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-fit rounded-xl border-slate-200 text-[#2C4260]"
            onClick={() => handleViewProfile(row)}
          >
            <Eye className="h-4 w-4" aria-hidden />
          </Button>
        ),
      },
    ],
    [handleViewProfile, locale, t],
  );

  if (dashboard.isLoading && !dashboard.data) {
    return <TeacherCourseSubscribersDashboardSkeleton />;
  }

  if (dashboard.isError || !dashboard.data) {
    return <p className="text-sm text-red-600">{t("common.error")}</p>;
  }

  const { summary, students } = dashboard.data;
  const rows = students.items;
  const from =
    students.totalCount === 0 ? 0 : (students.currentPage - 1) * students.pageSize + 1;
  const to = (students.currentPage - 1) * students.pageSize + rows.length;

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title={t("courses.subscribers.title")}
        description={t("courses.subscribers.description")}
        breadcrumbs={[
          { label: t("sidebar.nav.home"), href: ROUTES.USER.TEACHER.HOME },
          { label: t("sidebar.nav.courses"), href: ROUTES.USER.TEACHER.COURSES.LIST },
          {
            label: t("courses.subscribers.breadcrumbCourse"),
            href: ROUTES.USER.TEACHER.COURSES.DETAILS(courseId),
          },
          { label: t("courses.subscribers.breadcrumb") },
        ]}
        action={
          <Button className="rounded-xl bg-[#2C4260]">
            <Download className="ml-2 h-4 w-4" aria-hidden />
            {t("courses.subscribers.actions.exportReport")}
          </Button>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DashboardStatCard
          label={t("courses.subscribers.stats.totalStudents")}
          value={formatNumber(summary.totalStudents, locale)}
          indicator={
            summary.newStudentsLast30Days > 0
              ? t("courses.subscribers.stats.newStudents", {
                  count: formatNumber(summary.newStudentsLast30Days, locale),
                })
              : undefined
          }
          indicatorClassName="text-emerald-600"
          icon={Users}
          iconTone="primary"
        />
        <DashboardStatCard
          label={t("courses.subscribers.stats.activeStudents")}
          value={formatNumber(summary.activeStudents, locale)}
          icon={UserPlus}
          iconTone="success"
        />
        <DashboardStatCard
          label={t("courses.subscribers.stats.completionRate")}
          value={formatSubscriberPercent(summary.completionPercent, locale)}
          indicator={t("courses.subscribers.stats.completionHint")}
          icon={CheckCircle2}
          iconTone="warning"
        />
        <DashboardStatCard
          label={t("courses.subscribers.stats.averageScore")}
          value={formatSubscriberPercent(summary.averageScorePercent, locale)}
          icon={TrendingUp}
          iconTone="info"
        />
      </section>

      <TeacherCourseSubscribersFilterBar
        keyword={dashboard.keyword}
        onKeywordChange={dashboard.setKeyword}
        onReset={dashboard.resetFilters}
      />

      <DashboardTableCard
        title={t("courses.subscribers.table.title")}
        className={dashboard.isRefetching ? "opacity-60 transition-opacity" : undefined}
      >
        <DashboardDataTable
          columns={columns}
          rows={rows}
          getRowKey={(row) => row.studentUserId}
          emptyMessage={t("courses.subscribers.table.empty")}
        />
        <div className="flex flex-col gap-4 border-t border-slate-100 px-6 py-5 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-slate-500">
            {t("courses.subscribers.table.showing", {
              from,
              to,
              total: formatNumber(students.totalCount, locale),
            })}
          </p>
          <DashboardPagination
            pages={dashboard.pages}
            currentPage={dashboard.pageNumber}
            onPageChange={dashboard.setPageNumber}
            previousLabel={t("courses.list.pagination.previous")}
            nextLabel={t("courses.list.pagination.next")}
          />
        </div>
      </DashboardTableCard>
    </div>
  );
}
