"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import type { QuizQuestionPerformanceRow } from "@/modules/admin/domain/types/resultsAnalytics.types";
import { DashboardPagination } from "@/shared/presentation/components/dashboard";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/presentation/components/ui/tooltip";
import { cn } from "@/shared/application/lib/cn";

export type QuestionPerformanceBarChartProps = {
  title: string;
  subtitle: string;
  rows: QuizQuestionPerformanceRow[];
};

const SCALE_TICKS = [0, 25, 50, 75, 100] as const;
const PAGE_SIZE = 5;

function barColor(value: number) {
  if (value >= 80) return "#58CC02";
  if (value >= 60) return "#2C4260";
  if (value >= 40) return "#C7AF6E";
  return "#F25555";
}

function buildPages(currentPage: number, totalPages: number): number[] {
  if (totalPages <= 0) return [1];
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, start + 4);
  const adjustedStart = Math.max(1, end - 4);
  return Array.from({ length: end - adjustedStart + 1 }, (_, index) => adjustedStart + index);
}

export function QuestionPerformanceBarChart({
  title,
  subtitle,
  rows,
}: QuestionPerformanceBarChartProps) {
  const t = useTranslations("admin.dashboard.resultsAnalytics");
  const [pageNumber, setPageNumber] = useState(1);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));

  useEffect(() => {
    setPageNumber(1);
  }, [rows]);

  useEffect(() => {
    if (pageNumber > totalPages) {
      setPageNumber(totalPages);
    }
  }, [pageNumber, totalPages]);

  const visibleRows = useMemo(() => {
    const start = (pageNumber - 1) * PAGE_SIZE;
    return rows.slice(start, start + PAGE_SIZE);
  }, [pageNumber, rows]);

  const pages = buildPages(pageNumber, totalPages);
  const from = rows.length === 0 ? 0 : (pageNumber - 1) * PAGE_SIZE + 1;
  const to = Math.min(pageNumber * PAGE_SIZE, rows.length);

  return (
    <Card className="rounded-[2rem] border-white/80 bg-white shadow-[var(--dashboard-shadow-soft)]">
      <CardContent className="space-y-4 p-6">
        <div className="space-y-1 text-right">
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>

        <TooltipProvider>
          <div className="space-y-5 pe-2">
            {visibleRows.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">
                {t("quizAnalysis.questions.empty")}
              </p>
            ) : (
              visibleRows.map((row) => {
                const label = `#${row.order}`;
                const fill = barColor(row.correctAnswerPercent);
                const width = Math.min(100, Math.max(0, row.correctAnswerPercent));

                return (
                  <div
                    key={row.questionId}
                    className="grid grid-cols-[2.5rem_minmax(0,1fr)] items-start gap-3"
                  >
                    <span className="pt-5 text-xs font-semibold text-slate-400">{label}</span>

                    <div className="min-w-0 space-y-1.5">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <p className="line-clamp-2 cursor-default text-right text-xs font-medium leading-5 text-slate-600">
                            {row.questionTextPreview}
                          </p>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-sm text-right">
                          {row.questionTextPreview}
                        </TooltipContent>
                      </Tooltip>

                      <div className="relative h-2.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={cn(
                            "absolute inset-y-0 rounded-full transition-[width] duration-300",
                            width === 0 ? "hidden" : "end-0",
                          )}
                          style={{ width: `${width}%`, backgroundColor: fill }}
                          title={`${label}: ${width}%`}
                        />
                      </div>

                      <p className="text-left text-[10px] font-medium text-slate-400">
                        {width.toLocaleString()}%
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </TooltipProvider>

        <div className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-3 pt-1">
          <span aria-hidden />
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            {SCALE_TICKS.map((tick) => (
              <span key={tick}>{tick}</span>
            ))}
          </div>
        </div>

        {rows.length > PAGE_SIZE ? (
          <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-slate-500">
              {t("quizAnalysis.questions.showing", { from, to, total: rows.length })}
            </p>
            <DashboardPagination
              pages={pages}
              currentPage={pageNumber}
              onPageChange={setPageNumber}
              previousLabel={t("pagination.previous")}
              nextLabel={t("pagination.next")}
            />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
