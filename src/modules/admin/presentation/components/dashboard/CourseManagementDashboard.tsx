"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  persistLearningPathReviewSnapshot,
  moderationStatusCodeToCourseStatus,
  courseStatusFilterToModerationQuery,
  mapLearningPathCourseAccessType,
} from "@/modules/admin/domain/utils/learningPathModeration";
import {
  deleteLearningPath,
  approveLearningPath,
  getLearningPathsModerationPage,
  getLearningPathsModerationStats,
  type LearningPathModerationStats,
  type LearningPathModerationListItemDto,
} from "@/modules/admin/infrastructure/api/learningPathsModerationApi";
import { getSubjectsPage } from "@/modules/admin/infrastructure/api/subjectApi";
import type { SubjectListItem } from "@/modules/admin/infrastructure/api/subjectApi";
import {
  getCountriesDropdown,
  getEducationLevelsDropdown,
  getUserManagementGradesDropdown,
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
  DashboardDataTable,
  DashboardFilterSelect,
  DashboardFiltersPanel,
  DashboardPageHeader,
  DashboardPagination,
  DashboardSearchFilter,
  DashboardStatCard,
  DashboardTableCard,
  type DashboardDataTableColumn,
  type DashboardFilterOption,
} from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";
import { UserAvatarImageOrInitials } from "@/shared/presentation/components/user";

const PAGE_SIZE = 12;

function formatAbbrevInt(value: number) {
  return new Intl.NumberFormat(undefined, {
    notation: value >= 10_000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(value);
}

function moderationDtoToDashboardRow(row: LearningPathModerationListItemDto): CourseManagementRow {
  return {
    id: row.learningPathId,
    title: row.title,
    subject: row.subjectNameAr,
    grade: row.gradeNameAr,
    teacherName: row.teacherName,
    teacherAvatarUrl: row.teacherProfileImageUrl ?? undefined,
    accessType: mapLearningPathCourseAccessType(row.courseAccessType),
    statusId: moderationStatusCodeToCourseStatus(row.status),
    coverTone: "blue",
    coverLabel:
      row.stationCount > 0
        ? `×${formatAbbrevInt(row.stationCount)}`
        : "LP",
    coverImageUrl: row.courseCoverImageUrl,
    courseId: row.courseId,
    revenue: "—",
    lessonCount: row.stationCount,
    studentCount: 0,
    createdAt: row.createdAt,
  };
}

function persistModerationReviewSnapshot(dto: LearningPathModerationListItemDto) {
  persistLearningPathReviewSnapshot(dto.learningPathId, {
    teacherName: dto.teacherName,
    teacherProfileImageUrl: dto.teacherProfileImageUrl,
    subjectNameAr: dto.subjectNameAr,
    gradeNameAr: dto.gradeNameAr,
    courseTitle: dto.courseTitle,
    courseCoverImageUrl: dto.courseCoverImageUrl,
    courseId: dto.courseId,
    courseAccessType: dto.courseAccessType,
  });
}

type CourseFilterState = {
  stageId: string;
  subjectId: string;
  statusId: "all" | CourseStatusId;
  query: string;
};

export function CourseManagementDashboard() {
  const t = useTranslations("admin.dashboard");
  const router = useRouter();
  const moderationRowsRef = useRef<LearningPathModerationListItemDto[]>([]);

  const [stats, setStats] = useState<LearningPathModerationStats | null>(null);
  const [moderationRows, setModerationRows] = useState<LearningPathModerationListItemDto[]>([]);
  const [moderationPaging, setModerationPaging] = useState({
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
    query: "",
  });
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [subjectOptionsRecords, setSubjectOptionsRecords] = useState<SubjectListItem[]>([]);
  const [gradeStageOptionsLoading, setGradeStageOptionsLoading] = useState(true);
  /** Grade options keyed by numeric id (serialized as string ids for the select primitive). */
  const [flattenedGradeOptions, setFlattenedGradeOptions] = useState<
    DashboardFilterOption<string>[]
  >([]);

  moderationRowsRef.current = moderationRows;

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setDebouncedKeyword(filters.query.trim());
    }, 320);
    return () => window.clearTimeout(handle);
  }, [filters.query]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters.statusId, filters.subjectId, filters.stageId, debouncedKeyword]);

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
      moderationPaging.totalPages > 0 && page > moderationPaging.totalPages ? moderationPaging.totalPages : page,
    );
  }, [moderationPaging.totalPages]);

  const loadModeration = useCallback(async () => {
    setLoadState("loading");
    const statusParam = courseStatusFilterToModerationQuery(filters.statusId);
    const subjectIdParam =
      filters.subjectId !== "all" ? Number(filters.subjectId) : undefined;
    const gradeIdParam = filters.stageId !== "all" ? Number(filters.stageId) : undefined;

    const [statsResult, listResult] = await Promise.all([
      getLearningPathsModerationStats(),
      getLearningPathsModerationPage({
        ...(typeof statusParam === "number" ? { status: statusParam } : {}),
        ...(typeof subjectIdParam === "number" && !Number.isNaN(subjectIdParam)
          ? { subjectId: subjectIdParam }
          : {}),
        ...(typeof gradeIdParam === "number" && !Number.isNaN(gradeIdParam)
          ? { gradeId: gradeIdParam }
          : {}),
        ...(debouncedKeyword ? { keyword: debouncedKeyword } : {}),
        pageNumber: currentPage,
        pageSize: PAGE_SIZE,
      }),
    ]);

    if (!listResult.data) {
      setLoadState("error");
      notify.error(listResult.errorMessage ?? t("courseManagement.table.loadError"));
      return;
    }

    if (!statsResult.data) {
      if (statsResult.errorMessage) notify.error(statsResult.errorMessage);
      else notify.error(t("courseManagement.stats.loadWarning"));
      setStats(null);
    } else {
      setStats(statsResult.data);
    }

    const pageOut = listResult.data;
    setModerationRows(pageOut.rows);
    const totalPages = Math.max(1, pageOut.totalPages);
    setModerationPaging({
      currentPage: pageOut.currentPage,
      totalPages,
      totalItems: pageOut.totalItems,
      visibleItems: pageOut.rows.length,
    });

    setLoadState("success");
  }, [filters.statusId, filters.subjectId, filters.stageId, debouncedKeyword, currentPage, t]);

  useEffect(() => {
    let alive = true;
    const run = async () => {
      await loadModeration();
      if (!alive) return;
    };
    void run();
    return () => {
      alive = false;
    };
  }, [loadModeration]);

  const dashboardRows = useMemo(
    () => moderationRows.map(moderationDtoToDashboardRow),
    [moderationRows],
  );

  const statCards = useMemo<CourseManagementStat[]>(() => {
    const zeroStats: LearningPathModerationStats = {
      totalLearningPaths: 0,
      pendingCount: 0,
      approvedCount: 0,
      rejectedCount: 0,
      draftCount: 0,
    };
    const s = stats ?? zeroStats;

    return [
      {
        id: "learningPathsTotal",
        labelKey: "courseManagement.stats.learningPathsTotal.label",
        value: formatAbbrevInt(s.totalLearningPaths),
        indicatorKey: "courseManagement.stats.learningPathsTotal.indicator",
        indicatorToneClassName: "text-emerald-500",
        icon: BookOpen,
        iconTone: "primary",
      },
      {
        id: "learningPathsPending",
        labelKey: "courseManagement.stats.learningPathsPending.label",
        value: formatAbbrevInt(s.pendingCount),
        indicatorKey: "courseManagement.stats.learningPathsPending.indicator",
        indicatorToneClassName: "text-amber-600",
        icon: ClipboardClock,
        iconTone: "warning",
      },
      {
        id: "learningPathsApproved",
        labelKey: "courseManagement.stats.learningPathsApproved.label",
        value: formatAbbrevInt(s.approvedCount),
        indicatorKey: "courseManagement.stats.learningPathsApproved.indicator",
        indicatorToneClassName: "text-emerald-500",
        icon: CheckCircle2,
        iconTone: "success",
      },
      {
        id: "learningPathsRejected",
        labelKey: "courseManagement.stats.learningPathsRejected.label",
        value: formatAbbrevInt(s.rejectedCount),
        indicatorKey: "courseManagement.stats.learningPathsRejected.indicator",
        indicatorToneClassName: "text-red-600",
        icon: XCircle,
        iconTone: "warning",
      },
      {
        id: "learningPathsDraft",
        labelKey: "courseManagement.stats.learningPathsDraft.label",
        value: formatAbbrevInt(s.draftCount),
        indicatorKey: "courseManagement.stats.learningPathsDraft.indicator",
        indicatorToneClassName: "text-slate-500",
        icon: FilePenLine,
        iconTone: "info",
      },
    ];
  }, [stats]);

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
      { id: "pending", label: t("courseManagement.status.pending") },
      { id: "approved", label: t("courseManagement.status.approved") },
      { id: "rejected", label: t("courseManagement.status.rejected") },
      { id: "draft", label: t("courseManagement.status.draft") },
    ],
    [t],
  );

  const pages = useMemo(
    () =>
      Array.from({ length: Math.max(moderationPaging.totalPages, 1) }, (_, index) => index + 1),
    [moderationPaging.totalPages],
  );

  const approveLearningPathRow = async (learningPathId: string) => {
    const result = await approveLearningPath(learningPathId);
    if (result.errorMessage) {
      notify.error(result.errorMessage);
      return;
    }
    notify.success(t("courseManagement.messages.approved"));
    await loadModeration();
  };

  const confirmAndDeleteLearningPath = async (learningPathId: string) => {
    const ok = typeof window !== "undefined" ? window.confirm(t("courseManagement.table.confirmDelete")) : true;
    if (!ok) return;
    const result = await deleteLearningPath(learningPathId);
    if (result.errorMessage) {
      notify.error(result.errorMessage);
      return;
    }
    notify.success(t("courseManagement.messages.deleted"));
    await loadModeration();
  };

  const openReviewRoute = useCallback(
    (learningPathId: string) => {
      const dto = moderationRowsRef.current.find((r) => r.learningPathId === learningPathId);
      if (dto) persistModerationReviewSnapshot(dto);
      router.push(ROUTES.ADMIN.COURSE_MANAGEMENT.REVIEW(learningPathId));
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
      <DashboardPageHeader
        title={t("courseManagement.page.title")}
        description={t("courseManagement.page.description")}
        breadcrumbs={[
          { label: t("tabs.home.title"), href: ROUTES.ADMIN.HOME },
          { label: t("tabs.courseManagement.title") },
        ]}
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

      <DashboardFiltersPanel isLoading={loadState === "loading"}>
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
                  moderationPaging.totalItems > 0
                    ? moderationPaging.visibleItems || dashboardRows.length
                    : 0,
                total: moderationPaging.totalItems || dashboardRows.length,
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
                  delete: t("courseManagement.table.actions.delete"),
                  more: t("courseManagement.table.actions.more"),
                  rejectionDetails: t("courseManagement.table.actions.rejectionDetails"),
                }}
                onApprove={approveLearningPathRow}
                onReject={(learningPathId) =>
                  router.push(ROUTES.ADMIN.COURSE_MANAGEMENT.REJECT(learningPathId))
                }
                onView={openReviewRoute}
                onDelete={confirmAndDeleteLearningPath}
                onRejectionDetails={(learningPathId) =>
                  router.push(ROUTES.ADMIN.COURSE_MANAGEMENT.REJECTION_DETAILS(learningPathId))
                }
              />
            )}
          />
        )}
      </DashboardTableCard>
    </div>
  );
}
