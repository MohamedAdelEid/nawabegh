"use client";

import { useEffect, useMemo, useState } from "react";
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
import { useTeacherDeleteCourse } from "@/modules/teacher/application/hooks/useTeacherCourseMutations";
import {
  teacherCourseAccessToBadge,
  teacherCourseStatusToBadge,
} from "@/modules/teacher/presentation/components/courses/teacherCourseMappers";
import {
  CourseAccessBadge,
  CourseCoverPreview,
  CourseStatusBadge,
} from "@/modules/admin/presentation/components/course-management";
import { ContentFileDeleteModal } from "@/modules/admin/presentation/components/content-management/ContentFileDeleteModal";
import type { TeacherCourseListRow } from "@/modules/teacher/domain/types/teacher.types";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { notify } from "@/shared/application/lib/toast";
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
import { TeacherCoursesDashboardSkeleton } from "@/modules/teacher/presentation/components/courses/TeacherCoursesDashboardSkeleton";

const statIcons = {
  totalTracks: BookOpen,
  pendingApproval: ClipboardClock,
  activeLearners: Users,
  totalCourses: BookOpen,
} as const;

const SEARCH_DEBOUNCE_MS = 350;

export function TeacherCoursesDashboard() {
  const t = useTranslations("teacher.dashboard");
  const router = useRouter();
  const deleteMutation = useTeacherDeleteCourse();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [gradeId, setGradeId] = useState("all");
  const [subjectId, setSubjectId] = useState("all");
  const [status, setStatus] = useState<"all" | TeacherCourseListRow["status"]>("all");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<TeacherCourseListRow | null>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [query]);

  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, gradeId, subjectId, status]);

  const { data, isPending, isFetching, isError } = useTeacherCourses({
    query: debouncedQuery,
    gradeId,
    subjectId,
    status,
    page,
    pageSize: 10,
  });

  const isInitialLoading = isPending && !data;
  const isTableRefetching = isFetching && !isPending;

  const pages = useMemo(
    () =>
      data
        ? Array.from({ length: Math.max(data.pagination.totalPages, 1) }, (_, index) => index + 1)
        : [1],
    [data],
  );

  const openDeleteModal = (row: TeacherCourseListRow) => {
    if (row.status !== "draft") {
      notify.error(t("courses.list.actions.deleteDraftOnly"));
      return;
    }
    setDeleteTarget(row);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      notify.success(t("courses.list.actions.deleteSuccess"));
      setDeleteTarget(null);
    } catch (error) {
      notify.error(error instanceof Error ? error.message : t("common.error"));
    }
  };

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

  if (isInitialLoading) {
    return <TeacherCoursesDashboardSkeleton label={t("common.loading")} />;
  }

  if ((isError && !data) || !data) {
    return <p className="text-sm text-red-600">{t("common.error")}</p>;
  }

  const { rows, pagination, stats, filterOptions } = data;
  const rangeStart = (pagination.currentPage - 1) * pagination.pageSize + 1;
  const rangeEnd = Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems);

  const resolveFilterLabel = (option: { id: string; labelKey?: string; label?: string }) => {
    if (option.label) return option.label;
    if (option.labelKey) return t(option.labelKey);
    return option.id;
  };

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title={t("courses.list.title")}
        description={t("courses.list.description")}
        action={
          <div className="flex flex-wrap gap-3">
            <Button 
              type="button"
              onClick={() => router.push(ROUTES.USER.TEACHER.COURSES.CREATE)}
              className="h-14 rounded-2xl bg-[#2C4260] px-6 text-base font-semibold text-white hover:bg-[#243751] cursor-pointer shadow-[var(--dashboard-shadow-button)]"
            >
              <Plus className="ml-2 h-4 w-4" />
              {t("courses.list.actions.addCourse")}
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
        <DashboardFilterSelect
          label={t("courses.list.filters.gradeAria")}
          value={gradeId}
          onChange={setGradeId}
          options={filterOptions.grades.map((option) => ({
            id: option.id,
            label: resolveFilterLabel(option),
          }))}
        />
        <DashboardFilterSelect
          label={t("courses.list.filters.subjectAria")}
          value={subjectId}
          onChange={setSubjectId}
          options={filterOptions.subjects.map((option) => ({
            id: option.id,
            label: resolveFilterLabel(option),
          }))}
        />
        <DashboardFilterSelect
          label={t("courses.list.filters.statusAria")}
          value={status}
          onChange={(value) => setStatus(value as typeof status)}
          options={filterOptions.statuses.map((option) => ({
            id: option.id,
            label: t(option.labelKey),
          }))}
        />
        <DashboardSearchFilter
          label={t("courses.list.filters.searchLabel")}
          value={query}
          onChange={setQuery}
          placeholder={t("courses.list.filters.searchPlaceholder")}
        />
      </DashboardFiltersPanel>

      <DashboardTableCard
        className={isTableRefetching ? "opacity-60 transition-opacity" : undefined}
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
                disabled={deleteMutation.isPending}
                onClick={() => openDeleteModal(row)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        />
      </DashboardTableCard>

      <ContentFileDeleteModal
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title={t("courses.list.deleteModal.title")}
        description={t("courses.list.deleteModal.description", {
          title: deleteTarget?.title ?? "",
        })}
        confirmLabel={t("courses.list.deleteModal.confirm")}
        cancelLabel={t("courses.list.deleteModal.cancel")}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
}
