"use client";

import {
  CheckCircle2,
  Download,
  GripVertical,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import type { ExamQuestion, ExamStation, FlashcardDifficultyId } from "@/modules/admin/domain/data/journeyEditorData";
import { exportExamQuestionsToPdf } from "@/modules/admin/domain/utils/exportExamQuestionsPdf";
import { mapExamQuestionToUpdatePayload, mapQuizToExamStation } from "@/modules/admin/domain/utils/quizExamMappers";
import {
  deleteQuizQuestion,
  getQuiz,
  resolveQuizIdForStation,
  updateQuizQuestion,
} from "@/modules/admin/infrastructure/api/quizzesApi";
import { AddExamQuestionModal } from "@/modules/admin/presentation/components/journey-editor/AddExamQuestionModal";
import { notify } from "@/shared/application/lib/toast";
import { cn } from "@/shared/application/lib/cn";
import { ROUTES } from "@/shared/infrastructure/config/routes";
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

export function AdminJourneyExamEditQuestionsPage({ journeyId, stationId }: Props) {
  const t = useTranslations("admin.dashboard.journeyEditor.examEditQuestions");
  const tBc = useTranslations("admin.dashboard.journeyEditor.breadcrumbs");
  const router = useRouter();

  const [exam, setExam] = useState<ExamStation | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);

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
    const result = await deleteQuizQuestion(questionId);
    if (result.errorMessage || !result.data) {
      notify.error(result.errorMessage ?? t("messages.deleteError"));
      return;
    }

    notify.success(t("messages.deleteSuccess"));
    setExam((prev) =>
      prev ? { ...prev, questions: prev.questions.filter((q) => q.id !== questionId) } : prev,
    );
  };

  const startEdit = (question: ExamQuestion) => {
    setEditingId(question.id);
    setEditText(question.text);
  };

  const saveEdit = async () => {
    if (!exam || !editingId) return;

    const question = exam.questions.find((item) => item.id === editingId);
    if (!question) return;

    setSavingEdit(true);
    const result = await updateQuizQuestion(
      question.id,
      mapExamQuestionToUpdatePayload(question, { text: editText }),
    );
    setSavingEdit(false);

    if (result.errorMessage || !result.data) {
      notify.error(result.errorMessage ?? t("messages.updateError"));
      return;
    }

    setExam((prev) =>
      prev
        ? {
            ...prev,
            questions: prev.questions.map((q) =>
              q.id === editingId ? { ...q, text: editText } : q,
            ),
          }
        : prev,
    );
    setEditingId(null);
    setEditText("");
    notify.success(t("messages.updateSuccess"));
  };

  const handleExportPdf = () => {
    if (!exam) return;
    exportExamQuestionsToPdf(exam, {
      examTitle: t("pdf.examTitle"),
      questionLabel: t("pdf.questionLabel"),
      correctAnswer: t("pdf.correctAnswer"),
      points: t("pdf.points"),
      noQuestions: t("messages.noQuestionsForPdf"),
    });
  };

  if (loading || !exam) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-[#C8AC59]" />
      </div>
    );
  }

  const totalPoints = exam.questions.reduce((sum, q) => sum + q.points, 0);

  return (
    <div className="space-y-7">
      <DashboardPageHeader
        title={t("title", { name: exam.name })}
        description={t("description")}
        breadcrumbs={[
          { label: tBc("home"), href: ROUTES.ADMIN.HOME },
          {
            label: tBc("journeyEditor"),
            href: ROUTES.ADMIN.JOURNEY_EDITOR.EDITOR(journeyId),
          },
          {
            label: tBc("examEditor"),
            href: ROUTES.ADMIN.JOURNEY_EDITOR.EXAM_EDITOR(journeyId, stationId),
          },
          { label: tBc("examEditQuestions") },
        ]}
        action={
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="h-12 gap-2 rounded-xl border-slate-200 shadow-[0px_4px_0px_0px_#0000000D]"
              onClick={handleExportPdf}
            >
              <Download className="h-4 w-4" />
              {t("actions.exportPdf")} PDF
            </Button>
            <Button
              className="h-12 gap-2 rounded-xl bg-[#C8AC59] px-6 text-white hover:bg-[#B79A46] shadow-[0px_4px_0px_0px_#8F6C0B]"
              onClick={() =>
                router.push(ROUTES.ADMIN.JOURNEY_EDITOR.EXAM_PREVIEW(journeyId, stationId))
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
            className="rounded-[1.5rem] border-white/80 shadow-[0px_4px_0px_0px_#0000000D]"
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
        {exam.questions.map((question) => (
          <Card
            key={question.id}
            className="rounded-[1.75rem] border-white/80 shadow-[0px_4px_0px_0px_#0000000D]"
          >
            <CardContent className="space-y-4 p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-slate-300" />
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
                <div className="text-right">
                  <span className="text-xs font-semibold text-slate-400">
                    {question.type === "multipleChoice"
                      ? t("question.multipleChoice")
                      : t("question.trueFalse")}
                  </span>
                  <span className="mr-2 font-bold text-slate-500">
                    {t("question.title", { order: question.order })}
                  </span>
                </div>
              </div>

              {editingId === question.id ? (
                <div className="space-y-3">
                  <p className="text-right text-sm font-semibold text-slate-600">
                    {t("question.text")}
                  </p>
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    rows={3}
                    className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-right text-sm outline-none focus:border-[#C8AC59] transition-colors"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="flex-1 rounded-xl border border-slate-200 py-2 text-sm text-slate-500 hover:bg-slate-50"
                      disabled={savingEdit}
                    >
                      {t("question.cancel")}
                    </button>
                    <Button
                      className="flex-1 h-10 rounded-xl bg-[#C8AC59] text-sm text-white hover:bg-[#B79A46]"
                      onClick={() => void saveEdit()}
                      disabled={savingEdit}
                    >
                      {t("question.saveChanges")}
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-right font-semibold text-slate-800">{question.text}</p>
              )}

              {editingId !== question.id ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  {question.options.map((option) => {
                    const isCorrect = option.id === question.correctOptionId;
                    return (
                      <div
                        key={option.id}
                        className={cn(
                          "flex items-center justify-between rounded-2xl border-2 px-4 py-3",
                          isCorrect
                            ? "border-[#C8AC59] bg-[#FFF9EC]"
                            : "border-slate-200 bg-slate-50",
                        )}
                      >
                        <div className="flex items-center gap-2">
                          {isCorrect ? (
                            <CheckCircle2 className="h-4 w-4 text-[#C8AC59]" />
                          ) : (
                            <span className="flex h-4 w-4 items-center justify-center rounded-full border-2 border-slate-300 text-xs text-slate-400">
                              {option.label}
                            </span>
                          )}
                        </div>
                        <span className="text-sm font-semibold text-slate-700">{option.text}</span>
                        <span className="text-xs font-bold text-slate-400">{option.label}</span>
                      </div>
                    );
                  })}
                </div>
              ) : null}

              {editingId !== question.id ? (
                <div className="flex gap-2 border-t border-slate-100 pt-3">
                  <Button
                    variant="outline"
                    className="h-9 gap-1.5 rounded-xl border-rose-200 text-xs text-rose-500 hover:bg-rose-50"
                    onClick={() => void handleDelete(question.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {t("question.deleteQuestion")}
                  </Button>
                  <Button
                    className="h-9 gap-1.5 rounded-xl bg-[#2C4260] text-xs text-white hover:bg-[#1E3050]"
                    onClick={() => startEdit(question)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    {t("question.editQuestion")}
                  </Button>
                </div>
              ) : null}
            </CardContent>
          </Card>
        ))}

        <button
          type="button"
          onClick={() => setAddModalOpen(true)}
          className={cn(
            "flex w-full flex-col items-center justify-center gap-2 rounded-[1.75rem] border-2 border-dashed border-slate-200 py-8",
            "text-sm font-semibold text-slate-400 transition-colors hover:border-[#C8AC59]/70 hover:text-[#C8AC59]",
          )}
        >
          <Plus className="h-6 w-6" />
          {t("addQuestion")}
        </button>
      </div>

      <AddExamQuestionModal
        open={addModalOpen}
        quizId={exam.id}
        onClose={() => setAddModalOpen(false)}
        onAdded={() => void loadExam()}
      />
    </div>
  );
}
