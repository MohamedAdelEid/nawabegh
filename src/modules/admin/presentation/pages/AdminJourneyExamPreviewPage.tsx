"use client";

import {
  CheckCircle2,
  Pencil,
  Shuffle,
  Sparkles,
  Star,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import type { ExamStation } from "@/modules/admin/domain/data/journeyEditorData";
import {
  mapExamStationToUpdateSettingsPayload,
  mapQuizToExamStation,
} from "@/modules/admin/domain/utils/quizExamMappers";
import {
  generateQuizQuestions,
  getQuiz,
  resolveQuizIdForStation,
  updateQuizSettings,
} from "@/modules/admin/infrastructure/api/quizzesApi";
import {
  ChallengeAiGenerationPanel,
  getChallengeGenerateLabel,
} from "@/modules/admin/presentation/components/journey-editor/ChallengeAiGenerationPanel";
import { notify } from "@/shared/application/lib/toast";
import { cn } from "@/shared/application/lib/cn";
import { QuestionGenerationStatus } from "@/shared/domain/enums/cms.enums";
import { useElapsedSeconds } from "@/shared/application/hooks/useElapsedSeconds";
import { useScopedDashboardRoutes } from "@/shared/application/hooks/useScopedDashboardRoutes";
import { JourneyEditorStationPageSkeleton } from "@/modules/admin/presentation/components/journey-editor";
import { DashboardPageHeader } from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { ToggleSwitch } from "@/shared/presentation/components/ui/toggle-switch";

interface Props {
  journeyId: string;
  stationId: string;
}

const POLL_INTERVAL_MS = 3000;

export function AdminJourneyExamPreviewPage({ journeyId, stationId }: Props) {
  const t = useTranslations("admin.dashboard.journeyEditor.examPreview");
  const tEditor = useTranslations("admin.dashboard.journeyEditor.examEditor");
  const tQuestion = useTranslations("admin.dashboard.journeyEditor.examEditQuestions.question");
  const tBc = useTranslations("admin.dashboard.journeyEditor.breadcrumbs");
  const router = useRouter();
  const routes = useScopedDashboardRoutes();

  const [exam, setExam] = useState<ExamStation | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [generatingQuestions, setGeneratingQuestions] = useState(false);
  const generationElapsedSeconds = useElapsedSeconds(generatingQuestions);

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

  const handleRandomOrderChange = async (checked: boolean) => {
    if (!exam) return;

    const previous = exam;
    const nextExam = { ...exam, randomOrder: checked };
    setExam(nextExam);
    setSavingSettings(true);

    const result = await updateQuizSettings(
      exam.id,
      mapExamStationToUpdateSettingsPayload(nextExam),
    );
    setSavingSettings(false);

    if (result.errorMessage || !result.data) {
      setExam(previous);
      notify.error(result.errorMessage ?? t("messages.settingsSaveError"));
      return;
    }

    notify.success(t("messages.settingsSaveSuccess"));
  };

  const handleGenerateQuestions = async () => {
    if (!exam?.id) return;

    if (exam.questionsCount < 1) {
      notify.error(tEditor("messages.questionsCountRequired"));
      return;
    }

    if (exam.sourceFiles.length === 0 && !exam.aiSourceFileUrl.trim()) {
      notify.error(tEditor("messages.sourceRequiredForAi"));
      return;
    }

    setGeneratingQuestions(true);

    const settingsResult = await updateQuizSettings(
      exam.id,
      mapExamStationToUpdateSettingsPayload(exam),
    );
    if (settingsResult.errorMessage || !settingsResult.data) {
      setGeneratingQuestions(false);
      notify.error(settingsResult.errorMessage ?? t("messages.settingsSaveError"));
      return;
    }

    const result = await generateQuizQuestions(exam.id);
    if (result.errorMessage || !result.data) {
      setGeneratingQuestions(false);
      notify.error(result.errorMessage ?? tEditor("messages.generateQuestionsError"));
      return;
    }

    notify.success(tEditor("messages.generateQuestionsSuccess"));

    for (let attempt = 0; attempt < 60; attempt += 1) {
      const quizResult = await getQuiz(exam.id);
      if (quizResult.data) {
        setExam(mapQuizToExamStation(quizResult.data, stationId));
        const status = quizResult.data.questionGenerationStatus;
        if (
          status === QuestionGenerationStatus.Completed ||
          status === QuestionGenerationStatus.Failed ||
          quizResult.data.questions.length > 0
        ) {
          setGeneratingQuestions(false);
          if (status === QuestionGenerationStatus.Failed) {
            notify.error(tEditor("messages.generateQuestionsError"));
          } else if (quizResult.data.questions.length > 0) {
            notify.success(
              tEditor("messages.generateQuestionsComplete", {
                count: quizResult.data.questions.length,
              }),
            );
          }
          return;
        }
      }
      await new Promise((resolve) => window.setTimeout(resolve, POLL_INTERVAL_MS));
    }

    setGeneratingQuestions(false);
    notify.error(tEditor("messages.generateQuestionsTimeout"));
  };

  if (loading || !exam) {
    return <JourneyEditorStationPageSkeleton />;
  }

  const totalPoints = exam.questions.reduce((sum, q) => sum + q.points, 0);
  const generateQuestionsLabel = getChallengeGenerateLabel(
    generatingQuestions,
    generationElapsedSeconds,
    tEditor("actions.generateQuestions"),
    (elapsed) => tEditor("actions.generatingQuestions", { elapsed }),
  );

  return (
    <div className="space-y-7">
      {generatingQuestions ? (
        <ChallengeAiGenerationPanel
          elapsedSeconds={generationElapsedSeconds}
          title={tEditor("messages.generatingQuestionsTitle")}
          description={tEditor("messages.generatingQuestionsDescription")}
        />
      ) : null}
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
          { label: tBc("examPreview") },
        ]}
        action={
          <div className="flex flex-wrap gap-3">
            <Button
              className="h-12 gap-2 rounded-xl bg-[#C8AC59] px-6 text-white hover:bg-[#B79A46] shadow-[0px_4px_0px_0px_#8F6C0B]"
              onClick={() => void handleGenerateQuestions()}
              disabled={generatingQuestions}
            >
              <Sparkles className={cn("h-4 w-4", generatingQuestions && "animate-pulse")} />
              {generateQuestionsLabel}
            </Button>
            <Button
              className="h-12 gap-2 rounded-xl bg-[#2C4260] px-6 text-white hover:bg-[#243652] shadow-[0px_4px_0px_0px_#0000000D]"
              onClick={() =>
                router.push(
                  routes.journeyEditor.EXAM_EDIT_QUESTIONS(journeyId, stationId),
                )
              }
            >
              <Pencil className="h-4 w-4" />
              {t("actions.editQuestions")}
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <main className="space-y-6">
          <Card className="rounded-[1.75rem] border-white/80 shadow-[0px_4px_0px_0px_#0000000D]">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-600">
                    {t("status.published")}
                  </span>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-1.5">
                  <span className="text-sm font-bold text-slate-700">{exam.questions.length}</span>
                  <span className="text-xs text-slate-400">
                    {t("stats.totalQuestions")} {t("stats.questions")}
                  </span>
                </div>
              </div>
              <h2 className="mt-3 text-2xl font-bold text-slate-800">{exam.name}</h2>
            </CardContent>
          </Card>

          {exam.questions.length === 0 ? (
            <Card className="rounded-[1.75rem] border-white/80 shadow-[0px_4px_0px_0px_#0000000D]">
              <CardContent className="space-y-4 p-8 text-center">
                <p className="text-lg font-bold text-slate-800">{t("emptyState.title")}</p>
                <p className="text-sm text-slate-500">{t("emptyState.description")}</p>
                <Button
                  className="h-11 gap-2 rounded-xl bg-[#C8AC59] px-6 text-white hover:bg-[#B79A46]"
                  onClick={() => void handleGenerateQuestions()}
                  disabled={generatingQuestions}
                >
                  <Sparkles className={cn("h-4 w-4", generatingQuestions && "animate-pulse")} />
                  {generateQuestionsLabel}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-5">
              {exam.questions.map((question, index) => (
                <Card
                  key={question.id}
                  className="rounded-[1.75rem] border-white/80 shadow-[0px_4px_0px_0px_#0000000D]"
                >
                  <CardContent className="space-y-4 p-5">
                    <div className="flex items-center justify-end gap-2 text-right">
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-500">
                        {question.type === "multipleChoice"
                          ? tQuestion("multipleChoice")
                          : tQuestion("trueFalse")}
                      </span>
                      <span className="font-bold text-slate-500">{index + 1}</span>
                    </div>
                    <p className="text-right text-base font-bold text-slate-800">{question.text}</p>

                    {question.imageUrl ? (
                      <div className="relative h-40 overflow-hidden rounded-2xl bg-slate-100">
                        <Image
                          src={question.imageUrl}
                          alt="question"
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    ) : null}

                    <div className="grid gap-2 sm:grid-cols-2">
                      {question.options.map((option) => {
                        const isCorrect = option.id === question.correctOptionId;
                        return (
                          <div
                            key={option.id}
                            className={cn(
                              "flex items-center justify-between rounded-2xl border-2 px-4 py-3",
                              isCorrect
                                ? "border-[#C8AC59] bg-[#F8EFD5]"
                                : "border-slate-200 bg-slate-50",
                            )}
                          >
                            <span className="text-xs font-semibold text-slate-400">
                              {option.label}
                            </span>
                            <span className="text-sm font-semibold text-slate-700">
                              {option.text}
                            </span>
                            {isCorrect ? (
                              <CheckCircle2 className="h-4 w-4 text-[#C8AC59]" />
                            ) : (
                              <span className="h-4 w-4 rounded-full border-2 border-slate-300" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>

        <aside className="space-y-4">
          <Card className="rounded-[1.75rem] border-white/80 shadow-[0px_8px_0px_0px_#0000000D]">
            <CardContent className="space-y-4 p-5">
              <h3 className="flex items-center gap-2 font-bold text-slate-800">
                <Star className="h-4 w-4 text-[#C8AC59]" />
                {t("settings.title")}
              </h3>

              {[
                {
                  label: t("settings.passing"),
                  value: `${exam.passingGradePct}%`,
                  className: "text-[#C8AC59] font-bold text-lg",
                },
                {
                  label: t("settings.duration"),
                  value: `${exam.durationMin} ${t("settings.minutes")}`,
                  className: "text-slate-800 font-bold text-lg",
                },
                {
                  label: tEditor("sidebar.questionsCount"),
                  value: `${exam.questionsCount}`,
                  className: "text-slate-800 font-bold text-lg",
                },
                {
                  label: t("settings.totalPoints"),
                  value: `${totalPoints}`,
                  className: "text-[#C8AC59] font-bold text-lg",
                },
              ].map(({ label, value, className }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">{label}</span>
                  <span className={className}>{value}</span>
                </div>
              ))}

              <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2.5">
                <ToggleSwitch
                  checked={exam.randomOrder}
                  onCheckedChange={(checked) => void handleRandomOrderChange(checked)}
                  disabled={savingSettings}
                  ariaLabel={t("settings.randomOrder")}
                />
                <div className="space-y-0.5 text-right">
                  <div className="flex items-center justify-end gap-1.5 text-sm text-slate-600">
                    <Shuffle className="h-4 w-4" />
                    <span className="font-semibold">{t("settings.randomOrder")}</span>
                  </div>
                  <p className="text-xs text-slate-400">{t("settings.randomOrderDesc")}</p>
                  <span
                    className={cn(
                      "text-xs font-semibold",
                      exam.randomOrder ? "text-[#C8AC59]" : "text-slate-400",
                    )}
                  >
                    {exam.randomOrder ? t("settings.enabled") : t("settings.disabled")}
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center">
                <div className="mb-2 flex justify-center">
                  <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                </div>
                <p className="text-sm font-bold text-emerald-700">{t("readyBadge")}</p>
                <p className="mt-1 text-xs text-emerald-600">{t("readyDesc")}</p>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
