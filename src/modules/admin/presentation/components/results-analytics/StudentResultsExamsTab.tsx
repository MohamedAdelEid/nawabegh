"use client";

import { useMemo } from "react";
import { BarChart3 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useStudentResultsExams } from "@/modules/admin/application/hooks/useStudentResultsExams";
import type { StudentExamRow } from "@/modules/admin/domain/types/resultsAnalytics.types";
import {
  formatPercent,
  formatRelativeTime,
  resultStatusTone,
  scorePercentClassName,
} from "@/modules/admin/domain/utils/resultsAnalyticsDisplay";
import {
  DashboardBadge,
  DashboardDataTable,
  type DashboardDataTableColumn,
  DashboardPagination,
  DashboardTableCard,
} from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";
import { ROUTES } from "@/shared/infrastructure/config/routes";

export type StudentResultsExamsTabProps = {
  studentId: string;
};

export function StudentResultsExamsTab({ studentId }: StudentResultsExamsTabProps) {
  const t = useTranslations("admin.dashboard.resultsAnalytics");
  const locale = useLocale();
  const router = useRouter();
  const exams = useStudentResultsExams(studentId);
  const rows = exams.page?.exams ?? [];

  const columns = useMemo<Array<DashboardDataTableColumn<StudentExamRow>>>(
    () => [
      {
        id: "examName",
        header: t("student.examsTab.examName"),
        renderCell: (row) => (
          <div className="space-y-0.5 text-right">
            <p className="font-semibold text-slate-800">{row.quizTitle}</p>
            <p className="text-xs text-slate-400">{row.courseTitle}</p>
          </div>
        ),
      },
      {
        id: "result",
        header: t("student.examsTab.result"),
        renderCell: (row) => (
          <span className={scorePercentClassName(row.bestScorePercent)}>
            {formatPercent(row.bestScorePercent, locale)}
          </span>
        ),
      },
      {
        id: "attempts",
        header: t("student.examsTab.attempts"),
        renderCell: (row) => new Intl.NumberFormat(locale).format(row.attemptCount),
      },
      {
        id: "status",
        header: t("student.examsTab.status"),
        renderCell: (row) => (
          <DashboardBadge tone={resultStatusTone(row.resultStatus)} withDot>
            {t(`resultStatus.${row.resultStatus}`)}
          </DashboardBadge>
        ),
      },
    ],
    [locale, t],
  );

  return (
    <DashboardTableCard>
      <DashboardDataTable
        rows={rows}
        columns={columns}
        getRowKey={(row) => row.quizId}
        emptyMessage={t("student.examsTab.empty")}
        actionsHeader={t("student.examsTab.analysis")}
        renderActions={(row) => (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={!row.canAnalyze}
            className="rounded-xl text-[#2C4260] hover:bg-slate-50 bg-[#2C4260]/10"
            onClick={() => router.push(ROUTES.ADMIN.RESULTS.QUIZ_ANALYSIS(row.quizId))}
          >
            <BarChart3 className="h-4 w-4" aria-hidden />
            {t("student.examsTab.analyzePerformance")}
          </Button>
        )}
      />

      {exams.page ? (
        <div className="flex flex-col gap-4 border-t border-slate-100 px-6 py-5 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-slate-500">
            {t("student.examsTab.showing", {
              from: (exams.pageNumber - 1) * exams.page.pageSize + (rows.length ? 1 : 0),
              to: (exams.pageNumber - 1) * exams.page.pageSize + rows.length,
              total: exams.page.totalCount,
            })}
          </p>
          <DashboardPagination
            pages={exams.pages}
            currentPage={exams.pageNumber}
            onPageChange={exams.setPageNumber}
            previousLabel={t("pagination.previous")}
            nextLabel={t("pagination.next")}
          />
        </div>
      ) : null}
    </DashboardTableCard>
  );
}
