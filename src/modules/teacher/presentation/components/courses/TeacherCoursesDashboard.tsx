"use client";

import { useMemo, useState } from "react";
import {
  BookOpen,
  ClipboardClock,
  Eye,
  FileDown,
  Pencil,
  Plus,
  SlidersHorizontal,
  Trash2,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useTeacherCourses } from "@/modules/teacher/application/hooks/useTeacherCourses";
import {
  teacherCourseAccessToBadge,
  teacherCourseStatusToBadge,
} from "@/modules/teacher/presentation/components/courses/teacherCourseMappers";
import {
  CourseAccessBadge,
  CourseCoverPreview,
  CourseStatusBadge,
} from "@/modules/admin/presentation/components/course-management";
import type { TeacherCourseListRow } from "@/modules/teacher/domain/types/teacher.types";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import {
  DashboardDataTable,
  DashboardFilterSelect,
  DashboardFiltersPanel,
  DashboardPageHeader,
  DashboardPagination,
  DashboardSearchFilter,
  DashboardStatCard,
  DashboardTableCard,
  type DashboardDataTableColumn,
} from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";

const statIcons = {
  totalTracks: BookOpen,
  pendingApproval: ClipboardClock,
  activeLearners: Users,
  totalCourses: BookOpen,
} as const;

export function TeacherCoursesDashboard() {
  const t = useTranslations("teacher.dashboard");
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [gradeId, setGradeId] = useState("all");
  const [subjectId, setSubjectId] = useState("all");
  const [status, setStatus] = useState<"all" | TeacherCourseListRow["status"]>("all");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useTeacherCourses({
    query,
    gradeId,
    subjectId,
    status,
    page,
    pageSize: 10,
  });

  const pages = useMemo(
    () =>
      data
        ? Array.from({ length: Math.max(data.pagination.totalPages, 1) }, (_, index) => index + 1)
        : [1],
    [data],
  );

  const columns = useMemo<DashboardDataTableColumn<TeacherCourseListRow>[]>(
    () => [
      {
        id: "title",
        header: t("courses.list.table.title"),
        renderCell: (row) => (
          <div className="flex items-center gap-4">
            <CourseCoverPreview
              tone={row.coverTone}
              label={row.coverLabel}
              imageUrl={row.coverImageUrl}
              className="h-14 w-14"
            />
            <span className="font-semibold text-slate-800">{row.title}</span>
          </div>
        ),
      },
      {
        id: "subjectGrade",
        header: t("courses.list.table.subjectGrade"),
        renderCell: (row) => (
          <div className="space-y-1">
            <p>{row.subject}</p>
            <p className="text-xs text-slate-400">{row.grade}</p>
          </div>
        ),
      },
      {
        id: "access",
        header: t("courses.list.table.access"),
        renderCell: (row) => (
          <CourseAccessBadge
            accessType={teacherCourseAccessToBadge(row.accessType)}
            label={t(`courses.list.access.${row.accessType}`)}
          />
        ),
      },
      {
        id: "status",
        header: t("courses.list.table.status"),
        renderCell: (row) => (
          <CourseStatusBadge
            status={teacherCourseStatusToBadge(row.status)}
            label={t(`courses.list.status.${row.status}`)}
          />
        ),
      },
    ],
    [t],
  );

  if (isLoading) {
    return <Skeleton className="h-96 w-full rounded-[2rem]" />;
  }

  if (isError || !data) {
    return <p className="text-sm text-red-600">{t("common.error")}</p>;
  }

  const { rows, pagination, stats, filterOptions } = data;
  const rangeStart = (pagination.currentPage - 1) * pagination.pageSize + 1;
  const rangeEnd = Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems);

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title={t("courses.list.title")}
        description={t("courses.list.description")}
        action={
          <div className="flex flex-wrap gap-3">
            <Button className="rounded-xl bg-[#2C4260]" asChild>
              <Link href={ROUTES.USER.TEACHER.COURSES.CREATE}>
                <Plus className="ml-2 h-4 w-4" />
                {t("courses.list.actions.addCourse")}
              </Link>
            </Button>
            <Button variant="outline" className="rounded-xl">
              <FileDown className="ml-2 h-4 w-4" />
              {t("courses.list.actions.exportReport")}
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = statIcons[stat.id as keyof typeof statIcons] ?? BookOpen;
          const indicator =
            stat.trend && stat.trend.startsWith("courses.")
              ? t(stat.trend)
              : stat.trend;
          return (
            <DashboardStatCard
              key={stat.id}
              label={t(stat.labelKey)}
              value={stat.value}
              indicator={indicator}
              indicatorClassName={
                stat.id === "pendingApproval"
                  ? "text-amber-600"
                  : stat.trendDirection === "up"
                    ? "text-emerald-600"
                    : undefined
              }
              icon={Icon}
              iconTone={stat.id === "pendingApproval" ? "warning" : "primary"}
            />
          );
        })}
      </div>

      <DashboardFiltersPanel>
        <DashboardSearchFilter
          label={t("courses.list.filters.searchLabel")}
          value={query}
          onChange={(value) => {
            setQuery(value);
            setPage(1);
          }}
          placeholder={t("courses.list.filters.searchPlaceholder")}
        />
        <DashboardFilterSelect
          label={t("courses.list.filters.gradeAria")}
          value={gradeId}
          onChange={(value) => {
            setGradeId(value);
            setPage(1);
          }}
          options={filterOptions.grades.map((option) => ({
            id: option.id,
            label: t(option.labelKey),
          }))}
        />
        <DashboardFilterSelect
          label={t("courses.list.filters.subjectAria")}
          value={subjectId}
          onChange={(value) => {
            setSubjectId(value);
            setPage(1);
          }}
          options={filterOptions.subjects.map((option) => ({
            id: option.id,
            label: t(option.labelKey),
          }))}
        />
        <DashboardFilterSelect
          label={t("courses.list.filters.statusAria")}
          value={status}
          onChange={(value) => {
            setStatus(value as typeof status);
            setPage(1);
          }}
          options={filterOptions.statuses.map((option) => ({
            id: option.id,
            label: t(option.labelKey),
          }))}
        />
        <Button variant="outline" size="icon" className="shrink-0 rounded-xl" aria-label={t("courses.list.filters.more")}>
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </DashboardFiltersPanel>

      <DashboardTableCard
        footer={
          <div className="flex flex-col gap-4 px-2 py-2 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-slate-500">
              {t("courses.list.pagination.summary", {
                start: rangeStart,
                end: rangeEnd,
                total: pagination.totalItems,
              })}
            </p>
            <DashboardPagination
              pages={pages}
              currentPage={pagination.currentPage}
              previousLabel={t("courses.list.pagination.previous")}
              nextLabel={t("courses.list.pagination.next")}
              onPageChange={setPage}
            />
          </div>
        }
      >
        <DashboardDataTable
          rows={rows}
          columns={columns}
          getRowKey={(row) => row.id}
          emptyMessage={t("courses.list.table.empty")}
          actionsHeader={t("courses.list.table.actions")}
          renderActions={(row) => (
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-xl"
                aria-label={t("courses.list.actions.view")}
                onClick={() => router.push(ROUTES.USER.TEACHER.COURSES.DETAILS(row.id))}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-xl"
                aria-label={t("courses.list.actions.edit")}
                onClick={() => router.push(ROUTES.USER.TEACHER.COURSES.EDIT(row.id))}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-xl text-red-500 hover:text-red-600"
                aria-label={t("courses.list.actions.delete")}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        />
      </DashboardTableCard>
    </div>
  );
}
