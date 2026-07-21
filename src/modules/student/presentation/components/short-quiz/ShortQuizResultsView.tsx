"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Award,
  CheckCircle2,
  Clock3,
  RefreshCcw,
  Share2,
  Trophy,
  XCircle,
} from "lucide-react";
import { useShortQuizResult } from "@/modules/student/application/hooks/useShortQuizStation";
import {
  canRetryAttempt,
  countCorrectAnswers,
  formatElapsedTime,
} from "@/modules/student/domain/short-quiz/short-quiz.utils";
import { ApiFailureAlert } from "@/shared/presentation/components/ui/ApiFailureAlert";
import { Button } from "@/shared/presentation/components/ui/button";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { cn } from "@/shared/application/lib/cn";
import { ShortQuizSkeleton } from "./ShortQuizSkeleton";

type ShortQuizResultsViewProps = {
  stationId: string;
};

export function ShortQuizResultsView({ stationId }: ShortQuizResultsViewProps) {
  const t = useTranslations("student.dashboard.shortQuiz");
  const router = useRouter();
  const searchParams = useSearchParams();
  const qs = searchParams.toString();
  const withQuery = (path: string) => (qs ? `${path}?${qs}` : path);

  const { result, isLoading, error, refetch } = useShortQuizResult(stationId);

  const journeyHref = (() => {
    const params = new URLSearchParams();
    const courseId = searchParams.get("courseId");
    const pathId = searchParams.get("pathId");
    if (courseId) params.set("courseId", courseId);
    if (pathId) params.set("pathId", pathId);
    const query = params.toString();
    return query ? `${ROUTES.USER.STUDENT.JOURNEY}?${query}` : ROUTES.USER.STUDENT.JOURNEY;
  })();

  if (isLoading) return <ShortQuizSkeleton variant="results" />;

  if (error || !result) {
    return (
      <div className="mx-auto max-w-[700px] space-y-4 p-6">
        <ApiFailureAlert message={error || t("errors.loadResult")} fallbackMessage={t("errors.loadResult")} />
        <Button type="button" variant="outline" onClick={() => void refetch()}>
          {t("errors.retry")}
        </Button>
      </div>
    );
  }

  const attempt = result.attempt;
  const passed = attempt.passed === true;
  const score = attempt.scorePercent ?? 0;
  const correctCount = countCorrectAnswers(attempt);
  const points =
    result.pointsReward ||
    result.completion?.pathPointsEarned ||
    0;
  const canRetry = canRetryAttempt(attempt);

  const handleShare = async () => {
    const text = t("results.shareText", {
      title: attempt.quizTitle,
      score,
    });
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: attempt.quizTitle, text });
      } catch {
        // user cancelled
      }
      return;
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(text);
    }
  };

  return (
    <div className="min-h-full bg-[#f6f7f7] px-4 py-8">
      <div className="mx-auto max-w-[720px] space-y-6">
        <section
          className={cn(
            "overflow-hidden rounded-2xl p-8 text-center text-white shadow-xl",
            passed
              ? "bg-gradient-to-br from-[#2c4260] to-[#1e2e42]"
              : "bg-gradient-to-br from-[#7f1d1d] to-[#991b1b]",
          )}
        >
          <div className="mb-4 flex justify-center">
            {passed ? (
              <Trophy className="size-14 text-[#c7af6d]" />
            ) : (
              <XCircle className="size-14 text-white/90" />
            )}
          </div>
          <h1 className="mb-2 text-3xl font-bold">
            {passed ? t("results.passTitle") : t("results.failTitle")}
          </h1>
          <p className="text-white/80">
            {passed ? t("results.passSubtitle") : t("results.failSubtitle")}
          </p>

          <div className="relative mx-auto mt-8 flex size-40 items-center justify-center">
            <svg className="absolute inset-0 size-full -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="10" />
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke={passed ? "#c7af6d" : "#fca5a5"}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${(score / 100) * 326.7} 326.7`}
              />
            </svg>
            <div>
              <p className="text-4xl font-bold">{score}%</p>
              <p className="text-sm text-white/70">{t("results.finalScore")}</p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard
            icon={CheckCircle2}
            label={t("results.correct")}
            value={`${correctCount}/${attempt.totalQuestions}`}
          />
          <StatCard
            icon={Clock3}
            label={t("results.timeSpent")}
            value={formatElapsedTime(attempt.startedAt)}
          />
          <StatCard icon={Award} label={t("results.points")} value={`+${points}`} />
          <StatCard
            icon={Trophy}
            label={t("results.rank")}
            value={
              result.stationRank != null && result.stationRankTotal != null
                ? `${result.stationRank}/${result.stationRankTotal}`
                : "—"
            }
          />
        </section>

        <section className="flex flex-col gap-3">
          {passed ? (
            <>
              <Button
                asChild
                className="h-14 rounded-xl bg-[#2c4260] text-base font-bold text-white"
              >
                <Link href={withQuery(ROUTES.USER.STUDENT.SHORT_QUIZ_REVIEW(stationId))}>
                  {t("results.reviewAnswers")}
                </Link>
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-14 rounded-xl text-base font-bold"
                onClick={() => void handleShare()}
              >
                <Share2 className="size-4" />
                {t("results.share")}
              </Button>
            </>
          ) : (
            <>
              {canRetry ? (
                <Button
                  type="button"
                  className="h-14 rounded-xl bg-[#2c4260] text-base font-bold text-white"
                  onClick={() => {
                    try {
                      sessionStorage.removeItem(`nawabegh:short-quiz-result:${stationId}`);
                    } catch {
                      // ignore
                    }
                    router.push(withQuery(ROUTES.USER.STUDENT.SHORT_QUIZ_ATTEMPT(stationId)));
                  }}
                >
                  <RefreshCcw className="size-4" />
                  {t("results.retry")}
                </Button>
              ) : null}
              <Button
                asChild
                variant="outline"
                className="h-14 rounded-xl text-base font-bold"
              >
                <Link href={withQuery(ROUTES.USER.STUDENT.SHORT_QUIZ_REVIEW(stationId))}>
                  {t("results.reviewMistakes")}
                </Link>
              </Button>
            </>
          )}
          <Button asChild variant="ghost" className="h-12 rounded-xl text-base font-bold text-[#2c4260]">
            <Link href={journeyHref}>{t("actions.backToPath")}</Link>
          </Button>
        </section>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Award;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-[#e2e8f0] bg-white p-4 text-center shadow-sm">
      <Icon className="mx-auto mb-2 size-5 text-[#c7af6d]" />
      <p className="text-lg font-bold text-[#2c4260]">{value}</p>
      <p className="text-xs text-[#64748b]">{label}</p>
    </div>
  );
}
