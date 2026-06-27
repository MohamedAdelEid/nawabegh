"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  ClipboardClock,
  CheckCircle2,
  FilePenLine,
  Plus,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import type {
  CourseManagementStat,
  CourseManagementRow,
  CourseStatusId,
} from "@/modules/admin/domain/data/courseManagementData";
import {
  approveCourse,
  archiveCourse,
  getCoursesPage,
  type CourseListItemDto,
} from "@/modules/admin/infrastructure/api/courseApi";
import { getSubjectsPage } from "@/modules/admin/infrastructure/api/subjectApi";
import type { SubjectListItem } from "@/modules/admin/infrastructure/api/subjectApi";
import {
  getCountriesDropdown,
  getEducationLevelsDropdown,
  getUserManagementGradesDropdown,
  getUserManagementUsers,
  type UserManagementListRow,
} from "@/modules/admin/infrastructure/api/userManagementApi";
import {
  CourseAccessBadge,
  CourseCoverPreview,
  CourseManagementRowActions,
  CourseStatusBadge,
} from "@/modules/admin/presentation/components/course-management";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { notify } from "@/shared/application/lib/toast";
import {
  CourseAccessType,
  CourseTerm,
} from "@/shared/domain/enums/cms.enums";
import {
  courseAccessTypeFromApi,
  courseStatusFromApi,
  courseStatusIdToApi,
} from "@/shared/domain/enums/cms.mappers";
import {DashboardDataTable,
  DashboardFilterSelect,
  DashboardFiltersPanel,
  DashboardPageHeader,
  DashboardPagination,
  DashboardSearchFilter,
  DashboardStatCard,
  DashboardTableCard,
  type DashboardDataTableColumn,
  type DashboardFilterOption,
  DashboardBreadcrumb,} from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";
import { UserAvatarImageOrInitials } from "@/shared/presentation/components/user";

const PAGE_SIZE = 12;

function formatAbbrevInt(value: number) {
  return new Intl.NumberFormat(undefined, {
    notation: value >= 10_000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(value);
}

function courseDtoToDashboardRow(row: CourseListItemDto, gradeLabel: string): CourseManagementRow {
  return {
    id: row.id,
    title: row.title,
    subject: row.subjectNameAr,
    grade: gradeLabel,
    teacherName: row.teacherFullName,
    teacherAvatarUrl: row.teacherAvatarUrl ?? undefined,
    accessType: courseAccessTypeFromApi(row.accessType),
    statusId: courseStatusFromApi(row.status),
    coverTone: "blue",
    coverLabel: "CRS",
    coverImageUrl: row.coverImageUrl,
    revenue: row.discountedPrice || row.originalPrice ? formatAbbrevInt(row.discountedPrice || row.originalPrice) : "—",
    lessonCount: 0,
    studentCount: 0,
    createdAt: "",
  };
}

type CourseFilterState = {
  stageId: string;
  subjectId: string;
  statusId: "all" | CourseStatusId;
  termId: "all" | "1" | "2" | "3";
  teacherId: string;
  accessType: "all" | "0" | "1" | "2";
  isPublished: "all" | "true" | "false";
  query: string;
};

export function CourseManagementDashboard() {
  const t = useTranslations("admin.dashboard");
  const router = useRouter();

  const [courseRows, setCourseRows] = useState<CourseListItemDto[]>([]);
  const [coursePaging, setCoursePaging] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    visibleItems: 0,
  });
  const [loadState, setLoadState] = useState<"loading" | "success" | "error">("loading");
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<CourseFilterState>({
    stageId: "all",
    subjectId: "all",
    statusId: "all",
    termId: "all",
    teacherId: "all",
    accessType: "all",
    isPublished: "all",
    query: "",
  });
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [subjectOptionsRecords, setSubjectOptionsRecords] = useState<SubjectListItem[]>([]);
  const [gradeStageOptionsLoading, setGradeStageOptionsLoading] = useState(true);
  /** Grade options keyed by numeric id (serialized as string ids for the select primitive). */
  const [flattenedGradeOptions, setFlattenedGradeOptions] = useState<
    DashboardFilterOption<string>[]
  >([]);
  const [teacherOptionsRecords, setTeacherOptionsRecords] = useState<UserManagementListRow[]>([]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setDebouncedKeyword(filters.query.trim());
    }, 320);
    return () => window.clearTimeout(handle);
  }, [filters.query]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    filters.statusId,
    filters.subjectId,
    filters.stageId,
    filters.termId,
    filters.teacherId,
    filters.accessType,
    filters.isPublished,
    debouncedKeyword,
  ]);

  useEffect(() => {
    let alive = true;
    const loadSubjects = async () => {
      const result = await getSubjectsPage({ pageNumber: 1, pageSize: 240 });
      if (!alive) return;
      if (!result.errorMessage && result.data) setSubjectOptionsRecords(result.data.rows);
    };
    void loadSubjects();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;
    const loadTeachers = async () => {
      const result = await getUserManagementUsers({
        roleId: "teacher",
        pageNumber: 1,
        pageSize: 240,
      });
      if (!alive) return;
      if (!result.errorMessage && result.data) setTeacherOptionsRecords(result.data.rows);
    };
    void loadTeachers();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;
    setGradeStageOptionsLoading(true);

    const fill = async () => {
      try {
        const countries = await getCountriesDropdown();
        if (!alive) return;
        if (countries.errorMessage || !countries.data?.length) {
          setFlattenedGradeOptions([{ id: "all", label: t("courseManagement.filters.stages.all") }]);
          return;
        }
        const primary = countries.data[0];
        if (!primary) {
          setFlattenedGradeOptions([{ id: "all", label: t("courseManagement.filters.stages.all") }]);
          return;
        }
        const levelsRes = await getEducationLevelsDropdown(primary.id);
        if (!alive) return;
        const levels = levelsRes.data ?? [];
        const batches = await Promise.all(levels.map((lvl) => getUserManagementGradesDropdown(lvl.id)));
        const byId = new Map<number, string>();
        batches.forEach((batch, index) => {
          const lvlName = levels[index]?.name ?? "";
          const prefix = lvlName.trim() ? `${lvlName.trim()} — ` : "";
          (batch.data ?? []).forEach((g) => {
            const gid = typeof g.id === "number" ? g.id : Number(g.id);
            if (!Number.isNaN(gid) && !byId.has(gid)) {
              byId.set(gid, `${prefix}${g.name}`);
            }
          });
        });
        const rest = Array.from(byId.entries()).map(([id, label]) => ({
          id: String(id),
          label,
        }));
        if (!alive) return;
        setFlattenedGradeOptions([
          { id: "all", label: t("courseManagement.filters.stages.all") },
          ...rest,
        ]);
      } finally {
        if (alive) setGradeStageOptionsLoading(false);
      }
    };

    void fill();
    return () => {
      alive = false;
    };
  }, [t]);

  useEffect(() => {
    setCurrentPage((page) =>
      coursePaging.totalPages > 0 && page > coursePaging.totalPages ? coursePaging.totalPages : page,
    );
  }, [coursePaging.totalPages]);

  const loadCourses = useCallback(async () => {
    setLoadState("loading");
    const statusParam = courseStatusIdToApi(filters.statusId);
    const subjectIdParam =
      filters.subjectId !== "all" ? Number(filters.subjectId) : undefined;
    const gradeIdParam = filters.stageId !== "all" ? Number(filters.stageId) : undefined;
    const termParam = filters.termId !== "all" ? Number(filters.termId) : undefined;
    const accessTypeParam = filters.accessType !== "all" ? Number(filters.accessType) : undefined;
    const isPublishedParam =
      filters.isPublished === "all" ? undefined : filters.isPublished === "true";

    const listResult = await getCoursesPage({
      ...(typeof statusParam === "number" ? { status: statusParam } : {}),
      ...(typeof subjectIdParam === "number" && !Number.isNaN(subjectIdParam)
        ? { subjectId: subjectIdParam }
        : {}),
      ...(typeof gradeIdParam === "number" && !Number.isNaN(gradeIdParam)
        ? { gradeId: gradeIdParam }
        : {}),
      ...(typeof termParam === "number" && !Number.isNaN(termParam) ? { term: termParam } : {}),
      ...(filters.teacherId !== "all" ? { teacherId: filters.teacherId } : {}),
      ...(typeof accessTypeParam === "number" && !Number.isNaN(accessTypeParam)
        ? { accessType: accessTypeParam }
        : {}),
      ...(typeof isPublishedParam === "boolean" ? { isPublished: isPublishedParam } : {}),
      ...(debouncedKeyword ? { keyword: debouncedKeyword } : {}),
      pageNumber: currentPage,
      pageSize: PAGE_SIZE,
    });

    if (!listResult.data) {
      setLoadState("error");
      notify.error(listResult.errorMessage ?? t("courseManagement.table.loadError"));
      return;
    }

    const pageOut = listResult.data;
    setCourseRows(pageOut.rows);
    const totalPages = Math.max(1, pageOut.totalPages);
    setCoursePaging({
      currentPage: pageOut.currentPage,
      totalPages,
      totalItems: pageOut.totalItems,
      visibleItems: pageOut.rows.length,
    });

    setLoadState("success");
  }, [
    filters.statusId,
    filters.subjectId,
    filters.stageId,
    filters.termId,
    filters.teacherId,
    filters.accessType,
    filters.isPublished,
    debouncedKeyword,
    currentPage,
    t,
  ]);

  useEffect(() => {
    let alive = true;
    const run = async () => {
      await loadCourses();
      if (!alive) return;
    };
    void run();
    return () => {
      alive = false;
    };
  }, [loadCourses]);

  const dashboardRows = useMemo(
    () =>
      courseRows.map((row) => {
        const gradeLabel =
          flattenedGradeOptions.find((option) => option.id === String(row.gradeId))?.label ??
          String(row.gradeId || "—");
        return courseDtoToDashboardRow(row, gradeLabel);
      }),
    [courseRows, flattenedGradeOptions],
  );

  const statCards = useMemo<CourseManagementStat[]>(() => {
    const pageCounts = courseRows.reduce(
      (acc, row) => {
        const status = courseStatusFromApi(row.status);
        acc[status] += 1;
        return acc;
      },
      { draft: 0, pending: 0, approved: 0, rejected: 0, archived: 0 },
    );

    return [
      {
        id: "learningPathsTotal",
        labelKey: "courseManagement.stats.learningPathsTotal.label",
        value: formatAbbrevInt(coursePaging.totalItems),
        indicatorKey: "courseManagement.stats.learningPathsTotal.indicator",
        indicatorToneClassName: "text-emerald-500",
        icon: BookOpen,
        iconTone: "primary",
      },
      {
        id: "learningPathsPending",
        labelKey: "courseManagement.stats.learningPathsPending.label",
        value: formatAbbrevInt(pageCounts.pending),
        indicatorKey: "courseManagement.stats.learningPathsPending.indicator",
        indicatorToneClassName: "text-amber-600",
        icon: ClipboardClock,
        iconTone: "warning",
      },
      {
        id: "learningPathsApproved",
        labelKey: "courseManagement.stats.learningPathsApproved.label",
        value: formatAbbrevInt(pageCounts.approved),
        indicatorKey: "courseManagement.stats.learningPathsApproved.indicator",
        indicatorToneClassName: "text-emerald-500",
        icon: CheckCircle2,
        iconTone: "success",
      },
      {
        id: "learningPathsRejected",
        labelKey: "courseManagement.stats.learningPathsRejected.label",
        value: formatAbbrevInt(pageCounts.rejected),
        indicatorKey: "courseManagement.stats.learningPathsRejected.indicator",
        indicatorToneClassName: "text-red-600",
        icon: XCircle,
        iconTone: "warning",
      },
      {
        id: "learningPathsDraft",
        labelKey: "courseManagement.stats.learningPathsDraft.label",
        value: formatAbbrevInt(pageCounts.draft),
        indicatorKey: "courseManagement.stats.learningPathsDraft.indicator",
        indicatorToneClassName: "text-slate-500",
        icon: FilePenLine,
        iconTone: "info",
      },
    ];
  }, [courseRows, coursePaging.totalItems]);

  const stageOptions = useMemo<Array<DashboardFilterOption<string>>>(
    () =>
      flattenedGradeOptions.length > 0
        ? flattenedGradeOptions
        : [{ id: "all", label: t("courseManagement.filters.stages.all") }],
    [flattenedGradeOptions, t],
  );

  const subjectOptions = useMemo<Array<DashboardFilterOption<string>>>(
    () => [
      { id: "all", label: t("courseManagement.filters.subjects.all") },
      ...subjectOptionsRecords.map((s) => ({
        id: String(s.id),
        label: s.nameAr || s.nameEn,
      })),
    ],
    [subjectOptionsRecords, t],
  );

  const statusOptions = useMemo<Array<DashboardFilterOption<CourseFilterState["statusId"]>>>(
    () => [
      { id: "all", label: t("courseManagement.filters.statuses.all") },
      { id: "draft", label: t("courseManagement.status.draft") },
      { id: "pending", label: t("courseManagement.status.pending") },
      { id: "approved", label: t("courseManagement.status.approved") },
      { id: "rejected", label: t("courseManagement.status.rejected") },
      { id: "archived", label: t("courseManagement.status.archived") },
    ],
    [t],
  );

  const termOptions = useMemo<Array<DashboardFilterOption<CourseFilterState["termId"]>>>(
    () => [
      { id: "all", label: t("courseManagement.filters.terms.all") },
      { id: String(CourseTerm.FirstTerm) as "1", label: t("courseManagement.filters.terms.first") },
      { id: String(CourseTerm.SecondTerm) as "2", label: t("courseManagement.filters.terms.second") },
      { id: String(CourseTerm.ThirdTerm) as "3", label: t("courseManagement.filters.terms.third") },
    ],
    [t],
  );

  const teacherOptions = useMemo<Array<DashboardFilterOption<string>>>(
    () => [
      { id: "all", label: t("courseManagement.filters.teachers.all") },
      ...teacherOptionsRecords.map((teacher) => ({
        id: teacher.id,
        label: teacher.fullName,
      })),
    ],
    [teacherOptionsRecords, t],
  );

  const accessTypeOptions = useMemo<Array<DashboardFilterOption<CourseFilterState["accessType"]>>>(
    () => [
      { id: "all", label: t("courseManagement.filters.accessTypes.all") },
      { id: String(CourseAccessType.Free) as "0", label: t("courseManagement.access.free") },
      { id: String(CourseAccessType.Paid) as "1", label: t("courseManagement.access.paid") },
      {
        id: String(CourseAccessType.Subscription) as "2",
        label: t("courseManagement.access.subscription"),
      },
    ],
    [t],
  );

  const publishingOptions = useMemo<Array<DashboardFilterOption<CourseFilterState["isPublished"]>>>(
    () => [
      { id: "all", label: t("courseManagement.filters.publishing.all") },
      { id: "true", label: t("courseManagement.filters.publishing.published") },
      { id: "false", label: t("courseManagement.filters.publishing.unpublished") },
    ],
    [t],
  );

  const pages = useMemo(
    () =>
      Array.from({ length: Math.max(coursePaging.totalPages, 1) }, (_, index) => index + 1),
    [coursePaging.totalPages],
  );

  const approveCourseRow = async (courseId: string) => {
    const result = await approveCourse(courseId);
    if (result.errorMessage) {
      notify.error(result.errorMessage);
      return;
    }
    notify.success(t("courseManagement.messages.approved"));
    await loadCourses();
  };

  const confirmAndArchiveCourse = async (courseId: string) => {
    const ok = typeof window !== "undefined" ? window.confirm(t("courseManagement.table.confirmArchive")) : true;
    if (!ok) return;
    const result = await archiveCourse(courseId);
    if (result.errorMessage) {
      notify.error(result.errorMessage);
      return;
    }
    notify.success(t("courseManagement.messages.archived"));
    await loadCourses();
  };

  const openReviewRoute = useCallback(
    (courseId: string) => {
      router.push(ROUTES.ADMIN.COURSE_MANAGEMENT.REVIEW(courseId));
    },
    [router],
  );

  const columns: Array<DashboardDataTableColumn<CourseManagementRow>> = [
    {
      id: "title",
      header: t("courseManagement.table.columns.title"),
      renderCell: (row) => (
        <div className="flex min-w-[15rem] items-center gap-3">
          <CourseCoverPreview
            tone={row.coverTone}
            label={row.coverLabel}
            imageUrl={row.coverImageUrl}
            className="h-14 w-14 shrink-0"
          />
          <div className="space-y-1 text-right">
            <p className="font-bold text-slate-800">{row.title}</p>
            <p className="text-xs text-slate-400">{row.id}</p>
          </div>
        </div>
      ),
    },
    {
      id: "teacher",
      header: t("courseManagement.table.columns.teacher"),
      renderCell: (row) => (
        <div className="flex items-center gap-2">
          <UserAvatarImageOrInitials
            trackKey={row.id}
            name={row.teacherName}
            imageUrl={row.teacherAvatarUrl}
            circleClassName="bg-[#2C4260] text-white"
          />
          <span>{row.teacherName}</span>
        </div>
      ),
    },
    {
      id: "subject",
      header: t("courseManagement.table.columns.subject"),
      renderCell: (row) => (
        <div className="space-y-1">
          <p className="font-semibold">{row.subject}</p>
          <p className="text-xs text-slate-400">{row.grade}</p>
        </div>
      ),
    },
    {
      id: "access",
      header: t("courseManagement.table.columns.access"),
      renderCell: (row) => (
        <CourseAccessBadge
          accessType={row.accessType}
          label={t(`courseManagement.access.${row.accessType}`)}
        />
      ),
    },
    {
      id: "status",
      header: t("courseManagement.table.columns.status"),
      renderCell: (row) => (
        <CourseStatusBadge status={row.statusId} label={t(`courseManagement.status.${row.statusId}`)} />
      ),
    },
  ];

  return (
    <div className="space-y-8">
            <div className="space-y-2">
        <DashboardBreadcrumb items={[
          { label: t("tabs.home.title"), href: ROUTES.ADMIN.HOME },
          { label: t("tabs.courseManagement.title") },
        ]} />
        <DashboardPageHeader
        title={t("courseManagement.page.title")}
        description={t("courseManagement.page.description")}
        action={
          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant="outline"
              className="h-12 rounded-2xl border-slate-200 bg-white px-5 text-slate-700"
            >
              {t("courseManagement.page.export")}
            </Button>
            <Button
              type="button"
              className="dashboard-raised-button h-12 rounded-2xl bg-[#2C4260] px-5 text-white hover:bg-[#243751]"
              onClick={() => router.push(ROUTES.ADMIN.COURSE_MANAGEMENT.CREATE)}
            >
              <Plus className="h-4 w-4" aria-hidden />
              {t("courseManagement.page.addCourse")}
            </Button>
          </div>
        }
      />
      </div>

      <section className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {statCards.map((stat) => (
          <DashboardStatCard
            key={stat.id}
            label={t(stat.labelKey)}
            value={stat.value}
            indicator={t(stat.indicatorKey)}
            indicatorClassName={stat.indicatorToneClassName}
            icon={stat.icon}
            iconTone={stat.iconTone}
          />
        ))}
      </section>

      <DashboardFiltersPanel isLoading={loadState === "loading"} className="flex flex-wrap gap-4">
        <DashboardFilterSelect
          label={t("courseManagement.filters.stages.label")}
          value={filters.stageId}
          options={stageOptions}
          disabled={gradeStageOptionsLoading && stageOptions.length <= 1}
          onChange={(value) =>
            setFilters((current) => ({ ...current, stageId: value }))
          }
        />
        <DashboardFilterSelect
          label={t("courseManagement.filters.subjects.label")}
          value={filters.subjectId}
          options={subjectOptions}
          onChange={(value) =>
            setFilters((current) => ({ ...current, subjectId: value }))
          }
        />
        <DashboardFilterSelect
          label={t("courseManagement.filters.statuses.label")}
          value={filters.statusId}
          options={statusOptions}
          onChange={(value) =>
            setFilters((current) => ({ ...current, statusId: value }))
          }
        />
        <DashboardFilterSelect
          label={t("courseManagement.filters.terms.label")}
          value={filters.termId}
          options={termOptions}
          onChange={(value) =>
            setFilters((current) => ({ ...current, termId: value }))
          }
        />
        <DashboardFilterSelect
          label={t("courseManagement.filters.teachers.label")}
          value={filters.teacherId}
          options={teacherOptions}
          onChange={(value) =>
            setFilters((current) => ({ ...current, teacherId: value }))
          }
        />
        <DashboardFilterSelect
          label={t("courseManagement.filters.accessTypes.label")}
          value={filters.accessType}
          options={accessTypeOptions}
          onChange={(value) =>
            setFilters((current) => ({ ...current, accessType: value }))
          }
        />
        <DashboardFilterSelect
          label={t("courseManagement.filters.publishing.label")}
          value={filters.isPublished}
          options={publishingOptions}
          onChange={(value) =>
            setFilters((current) => ({ ...current, isPublished: value }))
          }
        />
        <DashboardSearchFilter
          label={t("courseManagement.filters.search.label")}
          placeholder={t("courseManagement.filters.search.placeholder")}
          value={filters.query}
          onChange={(value) =>
            setFilters((current) => ({ ...current, query: value }))
          }
        />
      </DashboardFiltersPanel>

      <DashboardTableCard
        title={t("courseManagement.table.title")}
        footer={
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <p className="text-right text-sm text-slate-400">
              {t("courseManagement.table.pagination.summary", {
                visible:
                  coursePaging.totalItems > 0
                    ? coursePaging.visibleItems || dashboardRows.length
                    : 0,
                total: coursePaging.totalItems || dashboardRows.length,
              })}
            </p>
            <DashboardPagination
              pages={pages}
              currentPage={currentPage}
              previousLabel={t("courseManagement.table.pagination.previous")}
              nextLabel={t("courseManagement.table.pagination.next")}
              onPageChange={setCurrentPage}
            />
          </div>
        }
      >
        {loadState === "loading" ? (
          <p className="px-6 py-12 text-center text-sm text-slate-500">{t("courseManagement.table.loading")}</p>
        ) : loadState === "error" ? (
          <p className="px-6 py-12 text-center text-sm text-red-600">{t("courseManagement.table.loadError")}</p>
        ) : (
          <DashboardDataTable
            rows={dashboardRows}
            columns={columns}
            getRowKey={(row) => row.id}
            emptyMessage={t("courseManagement.table.empty")}
            actionsHeader={t("courseManagement.table.columns.actions")}
            renderActions={(row) => (
              <CourseManagementRowActions
                row={row}
                labels={{
                  approve: t("courseManagement.table.actions.approve"),
                  reject: t("courseManagement.table.actions.reject"),
                  view: t("courseManagement.table.actions.view"),
                  edit: t("courseManagement.table.actions.edit"),
                  archive: t("courseManagement.table.actions.archive"),
                  more: t("courseManagement.table.actions.more"),
                }}
                onApprove={approveCourseRow}
                onReject={(courseId) =>
                  router.push(ROUTES.ADMIN.COURSE_MANAGEMENT.REJECT(courseId))
                }
                onView={openReviewRoute}
                onArchive={confirmAndArchiveCourse}
              />
            )}
          />
        )}
      </DashboardTableCard>
    </div>
  );
}
