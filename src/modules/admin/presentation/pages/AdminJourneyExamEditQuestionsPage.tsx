"use client";

import {
  CheckCircle2,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import type { ExamQuestion, ExamStation, FlashcardDifficultyId } from "@/modules/admin/domain/data/journeyEditorData";
import { mapQuizToExamStation } from "@/modules/admin/domain/utils/quizExamMappers";
import {
  deleteQuizQuestion,
  getQuiz,
  resolveQuizIdForStation,
} from "@/modules/admin/infrastructure/api/quizzesApi";
import {
  AddExamQuestionModal,
  EditExamQuestionModal,
  JourneyEditorStationPageSkeleton,
} from "@/modules/admin/presentation/components/journey-editor";
import { notify } from "@/shared/application/lib/toast";
import { cn } from "@/shared/application/lib/cn";
import { useScopedDashboardRoutes } from "@/shared/application/hooks/useScopedDashboardRoutes";
import { DashboardPageHeader } from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";

interface Props {
  journeyId: string;
  stationId: string;
}

const DIFFICULTY_TONE: Record<FlashcardDifficultyId, string> = {
  easy: "bg-emerald-50 text-emerald-600",
  medium: "bg-amber-50 text-amber-600",
  hard: "bg-rose-50 text-rose-600",
};

function formatOrder(order: number): string {
  return String(order).padStart(2, "0");
}

export function AdminJourneyExamEditQuestionsPage({ journeyId, stationId }: Props) {
  const t = useTranslations("admin.dashboard.journeyEditor.examEditQuestions");
  const tBc = useTranslations("admin.dashboard.journeyEditor.breadcrumbs");
  const router = useRouter();
  const routes = useScopedDashboardRoutes();

  const [exam, setExam] = useState<ExamStation | null>(null);
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<ExamQuestion | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadExam = useCallback(async () => {
    setLoading(true);
    const quizId = await resolveQuizIdForStation(stationId);
    if (!quizId) {
      setExam(null);
      setLoading(false);
      return;
    }

    const result = await getQuiz(quizId);
    if (result.errorMessage || !result.data) {
      notify.error(result.errorMessage ?? t("messages.loadError"));
      setExam(null);
      setLoading(false);
      return;
    }

    setExam(mapQuizToExamStation(result.data, stationId));
    setLoading(false);
  }, [stationId, t]);

  useEffect(() => {
    void loadExam();
  }, [loadExam]);

  const handleDelete = async (questionId: string) => {
    setDeletingId(questionId);
    const result = await deleteQuizQuestion(questionId);
    setDeletingId(null);

    if (result.errorMessage || !result.data) {
      notify.error(result.errorMessage ?? t("messages.deleteError"));
      return;
    }

    notify.success(t("messages.deleteSuccess"));
    setExam((prev) =>
      prev ? { ...prev, questions: prev.questions.filter((q) => q.id !== questionId) } : prev,
    );
    if (editingQuestion?.id === questionId) {
      setEditingQuestion(null);
    }
  };

  if (loading || !exam) {
    return <JourneyEditorStationPageSkeleton />;
  }

  const totalPoints = exam.questions.reduce((sum, q) => sum + q.points, 0);

  return (
    <div className="space-y-7">
      <DashboardPageHeader
        title={t("title", { name: exam.name })}
        description={t("description")}
        breadcrumbs={[
          { label: tBc("home"), href: routes.home },
          {
            label: tBc("journeyEditor"),
            href: routes.journeyEditor.EDITOR(journeyId),
          },
          {
            label: tBc("examEditor"),
            href: routes.journeyEditor.EXAM_EDITOR(journeyId, stationId),
          },
          { label: tBc("examEditQuestions") },
        ]}
        action={
          <div className="flex flex-wrap gap-3">
            <Button
              className="h-12 gap-2 rounded-xl bg-[#C8AC59] px-6 text-white hover:bg-[#B79A46] shadow-[0px_4px_0px_0px_#8F6C0B]"
              onClick={() => setAddModalOpen(true)}
            >
              <Plus className="h-4 w-4" />
              {t("addQuestion")}
            </Button>
            <Button
              className="h-12 gap-2 rounded-xl bg-[#2C4260] px-6 text-white hover:bg-[#243652] shadow-[0px_4px_0px_0px_#0000000D]"
              onClick={() =>
                router.push(routes.journeyEditor.EXAM_PREVIEW(journeyId, stationId))
              }
            >
              {t("actions.saveChanges")}
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            label: t("stats.totalQuestions"),
            value: exam.questions.length,
            suffix: t("stats.questions"),
            className: "text-slate-800",
          },
          {
            label: t("stats.totalPoints"),
            value: totalPoints,
            suffix: t("stats.points"),
            className: "text-[#C8AC59]",
          },
          {
            label: t("stats.examName"),
            value: exam.name,
            suffix: "",
            className: "text-slate-800 text-base",
          },
        ].map(({ label, value, suffix, className }) => (
          <Card
            key={label}
            className="rounded-[1.5rem] border border-slate-100 bg-white !shadow-[var(--dashboard-shadow-soft)]"
          >
            <CardContent className="p-4 text-right">
              <p className="text-xs text-slate-400">{label}</p>
              <p className={cn("mt-0.5 font-bold", className)}>
                {value}
                {suffix ? (
                  <span className="mr-1 text-xs font-normal text-slate-400">{suffix}</span>
                ) : null}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-5">
        {exam.questions.length === 0 ? (
          <Card className="rounded-[1.75rem] border border-dashed border-slate-200 bg-white !shadow-none">
            <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF9EC] text-[#C8AC59]">
                <Plus className="h-7 w-7" />
              </div>
              <div className="space-y-1">
                <p className="text-lg font-bold text-slate-800">{t("empty.title")}</p>
                <p className="text-sm text-slate-500">{t("empty.description")}</p>
              </div>
              <Button
                className="h-11 gap-2 rounded-xl bg-[#C8AC59] px-6 text-white hover:bg-[#B79A46]"
                onClick={() => setAddModalOpen(true)}
              >
                <Plus className="h-4 w-4" />
                {t("addQuestion")}
              </Button>
            </CardContent>
          </Card>
        ) : (
          exam.questions.map((question) => {
            const typeLabel =
              question.type === "multipleChoice"
                ? t("question.multipleChoice")
                : t("question.trueFalse");

            return (
              <Card
                key={question.id}
                className={cn(
                  "overflow-hidden rounded-2xl border border-slate-100 bg-white transition-shadow duration-300",
                  "!shadow-[var(--dashboard-shadow-soft)] hover:!shadow-[0_10px_30px_rgba(36,59,90,0.08)]",
                )}
              >
                <CardContent className="space-y-5 p-6 text-right">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#EAF2FD] text-sm font-bold text-[#243B5A]">
                        {formatOrder(question.order)}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                        {typeLabel}
                      </span>
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                          DIFFICULTY_TONE[question.difficulty] ?? "bg-slate-100 text-slate-500",
                        )}
                      >
                        {t(`difficulty.${question.difficulty}`)}
                      </span>
                      <span className="text-xs text-slate-400">
                        {t("question.points")} {question.points}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-10 gap-2 rounded-xl px-3 text-sm font-semibold text-[#243B5A] hover:bg-slate-50 cursor-pointer"
                        onClick={() => setEditingQuestion(question)}
                      >
                        <Pencil className="h-4 w-4" />
                        {t("question.editQuestion")}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-10 gap-2 rounded-xl border-rose-200 px-3 text-sm font-semibold text-rose-500 hover:bg-rose-50 cursor-pointer"
                        onClick={() => void handleDelete(question.id)}
                        disabled={deletingId === question.id}
                      >
                        <Trash2 className="h-4 w-4" />
                        {t("question.deleteQuestion")}
                      </Button>
                    </div>
                  </div>

                  <p className="text-lg font-bold leading-8 text-slate-800">{question.text}</p>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {question.options.map((option) => {
                      const isCorrect = option.id === question.correctOptionId;
                      return (
                        <div
                          key={option.id}
                          className={cn(
                            "flex min-h-[3.5rem] items-center gap-3 rounded-2xl border px-4 py-3 transition-colors duration-200",
                            isCorrect
                              ? "border-[#243B5A] bg-white"
                              : "border-slate-200 bg-white",
                          )}
                        >
                          <span
                            className={cn(
                              "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
                              isCorrect ? "border-[#243B5A]" : "border-slate-300",
                            )}
                            aria-hidden
                          >
                            {isCorrect ? (
                              <span className="h-2.5 w-2.5 rounded-full bg-[#243B5A]" />
                            ) : (
                              <span className="text-[10px] font-bold text-slate-400">
                                {option.label}
                              </span>
                            )}
                          </span>

                          <span
                            className={cn(
                              "flex-1 text-sm font-semibold",
                              isCorrect ? "text-slate-800" : "text-slate-600",
                            )}
                          >
                            {option.text}
                          </span>

                          {isCorrect ? (
                            <span className="ms-auto inline-flex shrink-0 items-center gap-1 rounded-md bg-[#E9F8DF] px-2 py-1 text-[11px] font-bold text-[#3E8C0E]">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              {t("question.correctAnswer")}
                            </span>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}

        {exam.questions.length > 0 ? (
          <button
            type="button"
            onClick={() => setAddModalOpen(true)}
            className={cn(
              "flex w-full flex-col items-center justify-center gap-2 rounded-[1.75rem] border-2 border-dashed border-slate-200 py-8",
              "text-sm font-semibold text-slate-400 transition-colors hover:border-[#C8AC59]/70 hover:text-[#C8AC59] cursor-pointer",
            )}
          >
            <Plus className="h-6 w-6" />
            {t("addQuestion")}
          </button>
        ) : null}
      </div>

      <AddExamQuestionModal
        open={addModalOpen}
        quizId={exam.id}
        onClose={() => setAddModalOpen(false)}
        onAdded={() => void loadExam()}
      />

      <EditExamQuestionModal
        open={Boolean(editingQuestion)}
        question={editingQuestion}
        onClose={() => setEditingQuestion(null)}
        onUpdated={() => void loadExam()}
      />
    </div>
  );
}
