"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import type { FinalExamDetail } from "@/modules/admin/domain/types/examsManagement.types";
import { getFinalExam } from "@/modules/admin/infrastructure/api/finalExamsApi";
import { notify } from "@/shared/application/lib/toast";
import { DashboardBadge, DashboardPageHeader } from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";
import { ROUTES } from "@/shared/infrastructure/config/routes";

export type FinalExamPreviewProps = {
  courseId: string;
};

export function FinalExamPreview({ courseId }: FinalExamPreviewProps) {
  const t = useTranslations("admin.dashboard.examsManagement.preview");
  const tPage = useTranslations("admin.dashboard.examsManagement");
  const router = useRouter();
  const [exam, setExam] = useState<FinalExamDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      const result = await getFinalExam(courseId);
      setLoading(false);

      if (result.errorMessage || !result.data) {
        notify.error(result.errorMessage ?? tPage("messages.loadError"));
        router.push(ROUTES.ADMIN.EXAMS.LIST);
        return;
      }

      setExam(result.data);
    })();
  }, [courseId, router, tPage]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (!exam) return null;

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title={t("title")}
        description={t("description")}
        breadcrumbs={[
          { label: tPage("breadcrumbs.home"), href: ROUTES.ADMIN.HOME },
          { label: tPage("page.title"), href: ROUTES.ADMIN.EXAMS.LIST },
          { label: exam.title },
        ]}
        action={
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(ROUTES.ADMIN.EXAMS.EDIT(courseId))}
          >
            {t("backToEdit")}
          </Button>
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <DashboardBadge tone={exam.questions.length ? "success" : "neutral"} withDot>
          {tPage(`generationStatuses.${String(exam.questionGenerationStatus)}` as never)}
        </DashboardBadge>
        <p className="text-sm text-slate-500">
          {t("questionsCount", {
            count: exam.questions.length,
            total: exam.questionCount,
          })}
        </p>
      </div>

      {exam.questions.length === 0 ? (
        <Card className="rounded-[1.75rem]">
          <CardContent className="p-8 text-center text-slate-500">{t("noQuestions")}</CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {exam.questions.map((question, index) => (
            <Card key={question.id} className="rounded-[1.75rem] border-white/80 bg-white">
              <CardContent className="space-y-4 p-6 text-right">
                <p className="font-bold text-[#1E3A66]">
                  {index + 1}. {question.text}
                </p>
                <ul className="space-y-2">
                  {question.choices.map((choice) => (
                    <li
                      key={choice.id}
                      className={`rounded-xl px-4 py-2 text-sm ${
                        choice.isCorrect
                          ? "border border-emerald-200 bg-emerald-50 font-semibold text-emerald-800"
                          : "bg-slate-50 text-slate-700"
                      }`}
                    >
                      {choice.text}
                      {choice.isCorrect ? (
                        <span className="ms-2 text-xs text-emerald-600">({t("correctAnswer")})</span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
