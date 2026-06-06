"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Award,
  Database,
  Download,
  Eye,
  FileText,
  Lightbulb,
  Pencil,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useExamsDashboard } from "@/modules/admin/application/hooks/useExamsDashboard";
import type { ExamDashboardStatus, LatestExamRow } from "@/modules/admin/domain/types/examsManagement.types";
import { getCoursesPage } from "@/modules/admin/infrastructure/api/courseApi";
import { deleteFinalExam } from "@/modules/admin/infrastructure/api/finalExamsApi";
import {
  ExamDeleteConfirmModal,
  ExamsManagementDashboardSkeleton,
  ExamsManagementFilterBar,
  ExamsSuccessRateDonut,
} from "@/modules/admin/presentation/components/exams-management";
import { notify } from "@/shared/application/lib/toast";
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
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { ExamsManagementFilterState } from "@/modules/admin/domain/types/examsManagementFilters.types";

const STAT_ICONS = {
  totalExams: FileText,
  totalQuestions: Database,
  passedStudents: Users,
  issuedCertificates: Award,
} as const;

const STAT_TONES = {
  totalExams: "info",
  totalQuestions: "warning",
  passedStudents: "success",
  issuedCertificates: "primary",
} as const;

function statusTone(status: ExamDashboardStatus) {
  switch (status) {
    case "Active":
      return "success" as const;
    case "Processing":
      return "info" as const;
    case "Failed":
      return "warning" as const;
    default:
      return "neutral" as const;
  }
}

export type ExamsManagementDashboardProps = {
  showFilters?: boolean;
  showWidgets?: boolean;
  pageSize?: number;
};

export function ExamsManagementDashboard({
  showFilters = false,
  showWidgets = true,
  pageSize = 10,
}: ExamsManagementDashboardProps) {
  const t = useTranslations("admin.dashboard.examsManagement");
  const locale = useLocale();
  const router = useRouter();
  const exams = useExamsDashboard(pageSize);
  const [courseOptions, setCourseOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [deleteTarget, setDeleteTarget] = useState<LatestExamRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    void (async () => {
      const result = await getCoursesPage({ pageNumber: 1, pageSize: 200, isPublished: true });
      if (result.data?.rows?.length) {
        setCourseOptions(result.data.rows.map((row) => ({ value: row.id, label: row.title })));
      }
    })();
  }, []);

  useEffect(() => {
    if (exams.errorMessage) {
      notify.error(exams.errorMessage);
    }
  }, [exams.errorMessage]);

  const summary = exams.dashboard?.summary;
  const successRate = exams.dashboard?.successRate;
  const rows = exams.dashboard?.latestExams ?? [];

  const statCards = useMemo(
    () =>
      (["totalExams", "totalQuestions", "passedStudents", "issuedCertificates"] as const).map(
        (id) => ({
          id,
          label: t(`stats.${id}.label`),
          value: summary
            ? new Intl.NumberFormat(locale).format(
                id === "totalExams"
                  ? summary.totalExams
                  : id === "totalQuestions"
                    ? summary.totalQuestions
                    : id === "passedStudents"
                      ? summary.passedStudents
                      : summary.issuedCertificates,
              )
            : "—",
          indicator: t(`stats.${id}.indicatorStatic`),
          icon: STAT_ICONS[id],
          iconTone: STAT_TONES[id],
        }),
      ),
    [locale, summary, t],
  );

  const columns = useMemo<Array<DashboardDataTableColumn<LatestExamRow>>>(
    () => [
      {
        id: "examName",
        header: t("table.columns.examName"),
        cellClassName: "font-semibold text-[#1E3A66]",
        renderCell: (row) => row.examName,
      },
      {
        id: "course",
        header: t("table.columns.course"),
        renderCell: (row) => row.courseTitle,
      },
      {
        id: "status",
        header: t("table.columns.status"),
        renderCell: (row) => (
          <DashboardBadge tone={statusTone(row.status)} withDot>
            {t(`statuses.${row.status}`)}
          </DashboardBadge>
        ),
      },
      {
        id: "participants",
        header: t("table.columns.participants"),
        renderCell: (row) => new Intl.NumberFormat(locale).format(row.participantsCount),
      },
      {
        id: "actions",
        header: t("table.columns.actions"),
        renderCell: (row) => (
          <div className="flex justify-end gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-xl"
              aria-label={t("table.actions.view")}
              onClick={() => router.push(ROUTES.ADMIN.EXAMS.PREVIEW(row.courseId))}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-xl"
              aria-label={t("table.actions.edit")}
              onClick={() => router.push(ROUTES.ADMIN.EXAMS.EDIT(row.courseId))}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-xl text-rose-500 hover:bg-rose-50 hover:text-rose-600"
              aria-label={t("table.actions.delete")}
              onClick={() => setDeleteTarget(row)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [locale, router, t],
  );

  const handleExport = useCallback(() => {
    notify.success(t("messages.exportSoon"));
  }, [t]);

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const result = await deleteFinalExam(deleteTarget.courseId);
    setIsDeleting(false);
    setDeleteTarget(null);

    if (result.errorMessage) {
      notify.error(result.errorMessage);
      return;
    }

    notify.success(result.message ?? t("deleteModal.success"));
    await exams.refetch();
  }, [deleteTarget, exams, t]);

  if (exams.isLoading && !exams.dashboard) {
    return <ExamsManagementDashboardSkeleton />;
  }

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        title={t("page.title")}
        description={t("page.description")}
        breadcrumbs={[
          { label: t("breadcrumbs.home"), href: ROUTES.ADMIN.HOME },
          { label: t("page.title") },
        ]}
        action={
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-14 rounded-2xl px-6 text-base font-semibold"
              onClick={handleExport}
            >
              <Download className="ms-2 h-5 w-5" aria-hidden />
              {t("page.exportReports")}
            </Button>
            <Button
              type="button"
              className="h-14 rounded-2xl bg-[#C8AC59] px-6 text-base font-semibold text-white shadow-[0px_4px_0px_0px_#A38F5A] hover:bg-[#B79A46]"
         
              onClick={() => router.push(ROUTES.ADMIN.EXAMS.CREATE)}
            >
              <Plus className="ms-2 h-5 w-5" aria-hidden />
              {t("page.createExam")}
            </Button>
          </div>
        }
      />

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => (
          <DashboardStatCard
            key={stat.id}
            label={stat.label}
            value={stat.value}
            indicator={stat.indicator}
            icon={stat.icon}
            iconTone={stat.iconTone}
          />
        ))}
      </section>

      {showFilters ? (
        <ExamsManagementFilterBar
          filters={exams.filters}
          courseOptions={courseOptions}
          onChange={(patch: Partial<ExamsManagementFilterState>) => exams.setFilters((prev) => ({ ...prev, ...patch }))}
          onApply={() => void exams.refetch()}
        />
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <DashboardTableCard
          title={t("table.title")}
          footer={
            exams.dashboard?.pagination && exams.dashboard.pagination.totalPages > 1 ? (
              <DashboardPagination
                pages={exams.pages}
                currentPage={exams.pageNumber}
                previousLabel={t("table.pagination.previous")}
                nextLabel={t("table.pagination.next")}
                onPageChange={exams.setPageNumber}
              />
            ) : null
          }
        >
          <DashboardDataTable
            rows={rows}
            columns={columns}
            getRowKey={(row) => row.quizId}
            emptyMessage={t("table.empty")}
          />
        </DashboardTableCard>
      
        <Card className="rounded-[1.75rem] border-white/80 bg-white !shadow-[var(--dashboard-shadow-soft)]">
          <CardContent className="space-y-4 p-6 text-right">
            <h3 className="text-xl font-bold text-[#1E3A66]">{t("successRate.title")}</h3>
            {successRate ? (
              <>
                <ExamsSuccessRateDonut data={successRate} />
                <div className="space-y-2 text-sm text-slate-500">
                  <div className="flex justify-between">
                    <span>{t("successRate.passed")}</span>
                    <span className="font-semibold text-emerald-600">
                      {successRate.passedCount}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("successRate.failed")}</span>
                    <span className="font-semibold text-rose-600">{successRate.failedCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("successRate.notAttempted")}</span>
                    <span className="font-semibold text-slate-600">
                      {successRate.notAttemptedCount}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-slate-400">—</p>
            )}
          </CardContent>
        </Card>
        </div>

      {showWidgets ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="rounded-[1.75rem] border-emerald-100 bg-emerald-50/60">
            <CardContent className="flex items-start gap-4 p-6 text-right">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                <Lightbulb className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-[#1E3A66]">{t("widgets.tip.title")}</h3>
                <p className="text-sm leading-relaxed text-slate-600">{t("widgets.tip.body")}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden rounded-[1.75rem] border-white/80 bg-[#2C4260] text-white">
            <CardContent className="flex flex-col justify-between gap-4 p-6 text-right sm:flex-row sm:items-center">
              <div className="space-y-2">
                <h3 className="text-lg font-bold">{t("widgets.certificates.title")}</h3>
                <p className="text-sm text-white/80">{t("widgets.certificates.body")}</p>
              </div>
              <Button
                type="button"
                className="shrink-0 rounded-2xl bg-[#C8AC59] text-white hover:bg-[#B79A46]"
                onClick={() => router.push(ROUTES.ADMIN.EXAMS.CERTIFICATE_TEMPLATES)}
              >
                {t("widgets.certificates.action")}
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : null}

      <ExamDeleteConfirmModal
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        itemName={deleteTarget?.examName}
        title={t("deleteModal.title")}
        description={t("deleteModal.description")}
        confirmLabel={t("deleteModal.confirm")}
        cancelLabel={t("deleteModal.cancel")}
        onConfirm={() => void handleConfirmDelete()}
        isConfirming={isDeleting}
      />
    </div>
  );
}
