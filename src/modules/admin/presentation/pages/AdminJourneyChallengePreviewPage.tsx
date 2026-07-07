"use client";

import { CheckCircle2, Pencil, Sparkles, Star, Swords } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import {
  generateChallengeQuestions,
  getChallenge,
  getChallengeIdForStation,
  type Challenge,
} from "@/modules/admin/infrastructure/api/challengesApi";
import { notify } from "@/shared/application/lib/toast";
import { cn } from "@/shared/application/lib/cn";
import { QuestionGenerationStatus } from "@/shared/domain/enums/cms.enums";
import { useScopedDashboardRoutes } from "@/shared/application/hooks/useScopedDashboardRoutes";
import {
  ChallengeAiGenerationPanel,
  getChallengeGenerateLabel,
  JourneyEditorStationPageSkeleton,
} from "@/modules/admin/presentation/components/journey-editor";
import { useElapsedSeconds } from "@/shared/application/hooks/useElapsedSeconds";
import { DashboardPageHeader } from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";

interface Props {
  journeyId: string;
  stationId: string;
}

const STATION_CHALLENGE_STORAGE_KEY_PREFIX = "admin.challenge.station.";

function getStoredChallengeId(stationId: string) {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(`${STATION_CHALLENGE_STORAGE_KEY_PREFIX}${stationId}`);
}

function storeChallengeId(stationId: string, challengeId: string) {
  window.localStorage.setItem(`${STATION_CHALLENGE_STORAGE_KEY_PREFIX}${stationId}`, challengeId);
}

function formatTime(value: string) {
  if (!value.trim()) return "—";
  return value.slice(0, 5);
}

export function AdminJourneyChallengePreviewPage({ journeyId, stationId }: Props) {
  const t = useTranslations("admin.dashboard.journeyEditor.challengePreview");
  const tEditor = useTranslations("admin.dashboard.journeyEditor.challengeEditor");
  const tBc = useTranslations("admin.dashboard.journeyEditor.breadcrumbs");
  const router = useRouter();
  const routes = useScopedDashboardRoutes();

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingQuestions, setGeneratingQuestions] = useState(false);
  const generationElapsedSeconds = useElapsedSeconds(generatingQuestions);

  const loadChallenge = useCallback(async () => {
    setLoading(true);

    let challengeId = getStoredChallengeId(stationId);
    if (!challengeId) {
      const stationChallengeResult = await getChallengeIdForStation(stationId);
      challengeId = stationChallengeResult.data;
    }

    if (!challengeId) {
      setChallenge(null);
      setLoading(false);
      router.replace(`${routes.journeyEditor.CHALLENGE_EDITOR(journeyId, stationId)}?edit=1`);
      return;
    }

    const result = await getChallenge(challengeId);
    if (result.errorMessage || !result.data) {
      notify.error(result.errorMessage ?? t("messages.loadError"));
      setChallenge(null);
      setLoading(false);
      return;
    }

    storeChallengeId(stationId, result.data.id);
    setChallenge(result.data);
    setLoading(false);
  }, [journeyId, router, routes.journeyEditor, stationId, t]);

  useEffect(() => {
    void loadChallenge();
  }, [loadChallenge]);

  const handleGenerateQuestions = async () => {
    if (!challenge) return;

    setGeneratingQuestions(true);
    const result = await generateChallengeQuestions(challenge.id);
    setGeneratingQuestions(false);

    if (result.errorMessage || !result.data) {
      notify.error(result.errorMessage ?? tEditor("messages.generateQuestionsError"));
      return;
    }

    notify.success(tEditor("messages.generateQuestionsSuccess"));
    void loadChallenge();
  };

  if (loading || !challenge) {
    return <JourneyEditorStationPageSkeleton />;
  }

  const totalPoints = challenge.questions.reduce((sum, question) => sum + question.points, 0);
  const isGenerating =
    challenge.questionGenerationStatus === QuestionGenerationStatus.Processing;
  const generationFailed =
    challenge.questionGenerationStatus === QuestionGenerationStatus.Failed;
  const hasQuestions = challenge.questions.length > 0;
  const generateQuestionsLabel = getChallengeGenerateLabel(
    generatingQuestions,
    generationElapsedSeconds,
    t("actions.generateQuestions"),
    (elapsed) => tEditor("actions.generatingQuestions", { elapsed }),
  );
  const editHref = `${routes.journeyEditor.CHALLENGE_EDITOR(journeyId, stationId)}?edit=1`;

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
        title={t("title", { name: challenge.title })}
        description={t("description")}
        breadcrumbs={[
          { label: tBc("home"), href: routes.home },
          {
            label: tBc("journeyEditor"),
            href: routes.journeyEditor.EDITOR(journeyId),
          },
          {
            label: tBc("challengeEditor"),
            href: routes.journeyEditor.CHALLENGE_EDITOR(journeyId, stationId),
          },
          { label: tBc("challengePreview") },
        ]}
        action={
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              className="h-12 gap-2 rounded-xl border-slate-200 shadow-[0px_4px_0px_0px_#0000000D]"
              onClick={() => router.push(editHref)}
            >
              <Pencil className="h-4 w-4" />
              {t("actions.editChallenge")}
            </Button>
            {!hasQuestions ? (
              <Button
                className="h-12 gap-2 rounded-xl bg-[#2C4260] px-6 text-white hover:bg-[#243652] shadow-[0px_4px_0px_0px_#0000000D]"
                onClick={() => void handleGenerateQuestions()}
                disabled={generatingQuestions || isGenerating}
              >
                <Sparkles className={cn("h-4 w-4", generatingQuestions && "animate-pulse")} />
                {generateQuestionsLabel}
              </Button>
            ) : null}
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <main className="space-y-6">
          <Card className="rounded-[1.75rem] border-white/80 shadow-[0px_4px_0px_0px_#0000000D]">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-1.5">
                  <span className="text-sm font-bold text-slate-700">
                    {challenge.questions.length}
                  </span>
                  <span className="text-xs text-slate-400">
                    {t("stats.totalQuestions")} {t("stats.questions")}
                  </span>
                </div>
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-600">
                  {t("status.ready")}
                </span>
              </div>
              <h2 className="mt-3 text-2xl font-bold text-slate-800">{challenge.title}</h2>
              <p className="mt-1 text-sm text-slate-500">
                {challenge.challengeDate} · {formatTime(challenge.startTime)} →{" "}
                {formatTime(challenge.endTime)} ({challenge.timeZoneId})
              </p>
            </CardContent>
          </Card>

          {!hasQuestions ? (
            <Card className="rounded-[1.75rem] border-dashed border-slate-200 bg-slate-50/60 shadow-none">
              <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EEF2FB] text-[#2C4260]">
                  <Swords className="h-7 w-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-800">{t("emptyState.title")}</h3>
                  <p className="text-sm text-slate-500">
                    {isGenerating
                      ? t("emptyState.generating")
                      : generationFailed
                        ? t("emptyState.failed")
                        : t("emptyState.description")}
                  </p>
                </div>
                <Button
                  className="h-11 gap-2 rounded-xl bg-[#2C4260] px-6 text-white hover:bg-[#243652]"
                  onClick={() => void handleGenerateQuestions()}
                  disabled={generatingQuestions || isGenerating}
                >
                  <Sparkles className={cn("h-4 w-4", generatingQuestions && "animate-pulse")} />
                  {generateQuestionsLabel}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-5">
              {challenge.questions.map((question, index) => (
                <Card
                  key={question.id}
                  className="rounded-[1.75rem] border-white/80 shadow-[0px_4px_0px_0px_#0000000D]"
                >
                  <CardContent className="space-y-4 p-5">
                    <div className="flex items-center justify-between gap-2 text-right">
                      <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-600">
                        {question.points} {t("stats.points")}
                      </span>
                      <div className="flex items-center gap-2">
                        {question.category ? (
                          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-500">
                            {question.category}
                          </span>
                        ) : null}
                        <span className="font-bold text-slate-500">{index + 1}</span>
                      </div>
                    </div>
                    <p className="text-right text-base font-bold text-slate-800">{question.text}</p>

                    <div className="grid gap-2 sm:grid-cols-2">
                      {question.options.map((option) => (
                        <div
                          key={option.id}
                          className={cn(
                            "flex items-center justify-between rounded-2xl border-2 px-4 py-3",
                            option.isCorrect
                              ? "border-[#C8AC59] bg-[#F8EFD5]"
                              : "border-slate-200 bg-slate-50",
                          )}
                        >
                          <span className="text-sm font-semibold text-slate-700">{option.text}</span>
                          {option.isCorrect ? (
                            <CheckCircle2 className="h-4 w-4 text-[#C8AC59]" />
                          ) : (
                            <span className="h-4 w-4 rounded-full border-2 border-slate-300" />
                          )}
                        </div>
                      ))}
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
                  label: t("settings.duration"),
                  value: `${challenge.durationMinutes} ${t("settings.minutes")}`,
                },
                {
                  label: t("settings.questionsCount"),
                  value: `${challenge.questionCount}`,
                },
                {
                  label: t("settings.generatedQuestions"),
                  value: `${challenge.generatedQuestionCount}`,
                },
                {
                  label: t("settings.totalPoints"),
                  value: `${totalPoints}`,
                },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-800">{value}</span>
                  <span className="text-sm text-slate-500">{label}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
