"use client";

import {
  Eye,
  FileUp,
  GripVertical,
  Save,
  Sparkles,
  Star,
  CheckCircle2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import type { ExamStation, FlashcardDifficultyId } from "@/modules/admin/domain/data/journeyEditorData";
import {
  generateExamQuestionsWithAi,
  getExamStation,
  saveExamStation,
} from "@/modules/admin/infrastructure/api/journeyEditorApi";
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

const DURATION_OPTIONS = [5, 10, 15, 30] as const;
const DIFFICULTY_OPTIONS: FlashcardDifficultyId[] = ["easy", "medium", "hard"];
const PASSING_GRADE_OPTIONS = [50, 60, 70, 75, 80, 90];
const ATTEMPTS_OPTIONS: ExamStation["maxAttempts"][] = ["one", "two", "three", "unlimited"];

export function AdminJourneyExamEditorPage({ journeyId, stationId }: Props) {
  const t = useTranslations("admin.dashboard.journeyEditor.examEditor");
  const tBc = useTranslations("admin.dashboard.journeyEditor.breadcrumbs");
  const router = useRouter();

  const [exam, setExam] = useState<ExamStation | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    void (async () => {
      const result = await getExamStation(stationId);
      if (result.data) setExam(result.data);
      setLoading(false);
    })();
  }, [stationId]);

  const update = <K extends keyof ExamStation>(key: K, value: ExamStation[K]) => {
    setExam((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const handleSave = async () => {
    if (!exam) return;
    setSaving(true);
    const result = await saveExamStation(stationId, exam);
    setSaving(false);
    if (result.errorMessage) {
      notify.error(result.errorMessage);
      return;
    }
    notify.success("Exam saved");
  };

  const handleAiFill = async () => {
    if (!exam) return;
    setAiLoading(true);
    const result = await generateExamQuestionsWithAi({
      examId: exam.id,
      difficulty: exam.difficulty,
      count: 5,
    });
    setAiLoading(false);
    if (result.errorMessage || !result.data) {
      notify.error(result.errorMessage ?? "AI generation failed");
      return;
    }
    setExam((prev) =>
      prev ? { ...prev, questions: [...prev.questions, ...result.data!] } : prev,
    );
    notify.success(`${result.data.length} questions added`);
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
        title={t("title")}
        description={t("description")}
        breadcrumbs={[
          { label: tBc("home"), href: ROUTES.ADMIN.HOME },
          {
            label: tBc("journeyEditor"),
            href: ROUTES.ADMIN.JOURNEY_EDITOR.EDITOR(journeyId),
          },
          { label: tBc("examEditor") },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
        {/* Left sidebar */}
        <aside className="space-y-4">
          <Card className="rounded-[1.75rem] border-white/80 bg-[#2C4260] text-white shadow-[0px_8px_0px_0px_#0000000D]">
            <CardContent className="space-y-4 p-5">
              <h2 className="font-bold">{t("sidebar.title")}</h2>

              <div className="space-y-2 text-sm">
                {[
                  {
                    label: t("sidebar.questionsCount"),
                    value: `${exam.questions.length} ${t("sidebar.questions")}`,
                  },
                  {
                    label: t("sidebar.time"),
                    value: `${exam.durationMin} ${t("sidebar.minutes")}`,
                  },
                  {
                    label: t("sidebar.difficulty"),
                    value: t(`difficulty.${exam.difficulty}`),
                  },
                  {
                    label: t("sidebar.passing"),
                    value: `${exam.passingGradePct}%`,
                    className: "text-[#C8AC59]",
                  },
                  {
                    label: t("sidebar.totalPoints"),
                    value: `${totalPoints} ${t("sidebar.points")}`,
                    className: "text-[#C8AC59]",
                  },
                ].map(({ label, value, className }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between rounded-xl bg-white/10 px-3 py-2"
                  >
                    <span className={cn("font-bold", className)}>{value}</span>
                    <span className="text-xs text-white/60">{label}</span>
                  </div>
                ))}
              </div>

              <Button
                className="h-11 w-full gap-2 rounded-2xl bg-[#C8AC59] text-white hover:bg-[#B79A46]"
                onClick={() => void handleSave()}
                disabled={saving}
              >
                <Save className="h-4 w-4" />
                {t("sidebar.saveAndPublish")}
              </Button>
              <Button
                variant="outline"
                className="h-11 w-full gap-2 rounded-2xl border-white/20 text-white hover:bg-white/10 hover:text-white"
                onClick={() =>
                  router.push(
                    ROUTES.ADMIN.JOURNEY_EDITOR.EXAM_PREVIEW(journeyId, stationId),
                  )
                }
              >
                <Eye className="h-4 w-4" />
                {t("sidebar.preview")}
              </Button>
            </CardContent>
          </Card>
        </aside>

        {/* Main */}
        <main className="space-y-6">
          {/* Settings */}
          <Card className="rounded-[1.75rem] border-white/80 shadow-[0px_4px_0px_0px_#0000000D]">
            <CardContent className="space-y-5 p-5">
              <h2 className="flex items-center gap-2 font-bold text-slate-800">
                <Star className="h-4 w-4 text-[#C8AC59]" />
                {t("sections.settings")}
              </h2>

              <div className="space-y-1.5 text-right">
                <label className="text-sm font-semibold text-slate-600">
                  {t("settings.examName")}
                </label>
                <input
                  value={exam.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder={t("settings.examNamePlaceholder")}
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-right text-sm outline-none focus:border-[#C8AC59] transition-colors"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5 text-right">
                  <p className="text-sm font-semibold text-slate-600">
                    {t("settings.duration")}
                  </p>
                  <div className="flex gap-2">
                    {DURATION_OPTIONS.map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => update("durationMin", d)}
                        className={cn(
                          "flex-1 rounded-xl py-2.5 text-xs font-bold transition-colors",
                          exam.durationMin === d
                            ? "bg-[#2C4260] text-white"
                            : "bg-slate-100 text-slate-500 hover:bg-slate-200",
                        )}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5 text-right">
                  <p className="text-sm font-semibold text-slate-600">
                    {t("settings.difficulty")}
                  </p>
                  <div className="flex gap-2">
                    {DIFFICULTY_OPTIONS.map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => update("difficulty", d)}
                        className={cn(
                          "flex-1 rounded-xl py-2.5 text-xs font-semibold transition-colors",
                          exam.difficulty === d
                            ? "bg-[#2C4260] text-white"
                            : "bg-slate-100 text-slate-500 hover:bg-slate-200",
                        )}
                      >
                        {t(`difficulty.${d}`)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5 text-right">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[#C8AC59]">
                      {exam.passingGradePct}%
                    </span>
                    <label className="text-sm font-semibold text-slate-600">
                      {t("settings.passingGrade")}
                    </label>
                  </div>
                  <input
                    type="range"
                    min={50}
                    max={100}
                    step={5}
                    value={exam.passingGradePct}
                    onChange={(e) => update("passingGradePct", Number(e.target.value))}
                    className="w-full accent-[#C8AC59]"
                  />
                </div>

                <div className="space-y-1.5 text-right">
                  <label className="text-sm font-semibold text-slate-600">
                    {t("settings.attempts")}
                  </label>
                  <select
                    value={exam.maxAttempts}
                    onChange={(e) => update("maxAttempts", e.target.value as ExamStation["maxAttempts"])}
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-right text-sm outline-none"
                  >
                    {ATTEMPTS_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {t(`settings.attemptsOptions.${opt}`)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* File upload */}
          <Card className="rounded-[1.75rem] border-white/80 shadow-[0px_4px_0px_0px_#0000000D]">
            <CardContent className="space-y-4 p-5">
              <h3 className="text-right text-sm font-bold text-slate-700">
                <span className="ml-2 text-slate-400">02.</span>
                {t("sections.sources")}
              </h3>

              <input ref={fileInputRef} type="file" accept=".pdf,.pptx,.mp4" className="hidden" />

              {exam.sourceFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
                >
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        update(
                          "sourceFiles",
                          exam.sourceFiles.filter((f) => f.id !== file.id),
                        )
                      }
                      className="rounded-full bg-slate-200 p-0.5 text-slate-500 hover:bg-rose-100 hover:text-rose-500"
                    >
                      ×
                    </button>
                    <span className="text-xs text-emerald-500">تم الرفع بنجاح</span>
                    <span className="text-xs text-slate-400">{file.sizeLabel}</span>
                  </div>
                  <div className="flex items-center gap-2 text-right">
                    <span className="text-sm font-semibold text-slate-700">{file.name}</span>
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 text-rose-500">
                      <FileUp className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 py-7 text-sm text-slate-400 transition-colors hover:border-[#C8AC59]/70 hover:text-[#C8AC59]"
              >
                <FileUp className="h-8 w-8" />
                <p className="font-semibold">{t("upload.drag")}</p>
                <p className="text-xs">
                  {t("upload.formats")} · {t("upload.maxSize")}
                </p>
              </button>

              <Button
                className="h-11 w-full gap-2 rounded-2xl bg-[#2C4260] text-white hover:bg-[#1E3050]"
                onClick={() => void handleAiFill()}
                disabled={aiLoading}
              >
                {aiLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {t("aiButton")}
              </Button>
            </CardContent>
          </Card>

          {/* Questions list */}
          <Card className="rounded-[1.75rem] border-white/80 shadow-[0px_4px_0px_0px_#0000000D]">
            <CardContent className="space-y-4 p-5">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  className="h-9 gap-1.5 rounded-xl border-[#C8AC59] text-xs text-[#C8AC59] hover:bg-[#FFF9EC]"
                  onClick={() =>
                    router.push(ROUTES.ADMIN.JOURNEY_EDITOR.EXAM_EDIT_QUESTIONS(journeyId, stationId))
                  }
                >
                  {t("bankButton")}
                </Button>
                <h3 className="font-bold text-slate-800">{t("sections.questions")}</h3>
              </div>

              <div className="space-y-3">
                {exam.questions.map((question) => (
                  <div
                    key={question.id}
                    className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
                  >
                    <GripVertical className="h-4 w-4 shrink-0 text-slate-300" />
                    <div className="flex-1 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-500">
                          {question.type === "multipleChoice"
                            ? t("questionItem.multipleChoice")
                            : t("questionItem.trueFalse")}
                        </span>
                        <span className="text-xs font-semibold text-slate-400">
                          سؤال {question.order}
                        </span>
                      </div>
                      <p className="mt-0.5 text-sm font-semibold text-slate-700">
                        {question.text}
                      </p>
                      <p className="mt-0.5 text-xs text-emerald-500">
                        {t("questionItem.correctAnswer")}:{" "}
                        {question.options.find((o) => o.id === question.correctOptionId)?.text}
                      </p>
                    </div>
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                  </div>
                ))}
              </div>

              {exam.questions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
                  <FileUp className="mb-2 h-8 w-8" />
                  <p className="text-sm">Upload files or use AI to generate questions</p>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
