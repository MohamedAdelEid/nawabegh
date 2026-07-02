"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  FlaskConical,
  Share2,
  X,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useFriendChallengeOverview } from "@/modules/admin/application/hooks/useFriendChallengeOverview";
import {
  difficultyTone,
  formatChallengeDateTime,
  formatDurationSeconds,
  formatResponseTimeMs,
} from "@/modules/admin/domain/utils/friendChallengesDisplay";
import type { FriendChallengeAnswerEntry } from "@/modules/admin/domain/types/friendChallenges.types";
import { DisabledFeatureButton } from "@/modules/admin/presentation/components/results-analytics/DisabledFeatureButton";
import { FriendChallengeDetailSkeleton } from "@/modules/admin/presentation/components/friend-challenges/FriendChallengeDetailSkeleton";
import { FriendChallengeParticipantCard } from "@/modules/admin/presentation/components/friend-challenges/FriendChallengeParticipantCard";
import { notify } from "@/shared/application/lib/toast";
import { cn } from "@/shared/application/lib/cn";
import {
  DashboardBadge,
  DashboardDataTable,
  type DashboardDataTableColumn,
  DashboardPageHeader,
  DashboardTableCard,
} from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { ROUTES } from "@/shared/infrastructure/config/routes";

const INITIAL_ANSWER_ROWS = 10;

export type FriendChallengeDetailDashboardProps = {
  challengeId: string;
};

export function FriendChallengeDetailDashboard({ challengeId }: FriendChallengeDetailDashboardProps) {
  const t = useTranslations("admin.dashboard.friendChallenges");
  const locale = useLocale();
  const { overview, isLoading, errorMessage } = useFriendChallengeOverview(challengeId);
  const [showAllAnswers, setShowAllAnswers] = useState(false);

  useEffect(() => {
    if (errorMessage) notify.error(errorMessage);
  }, [errorMessage]);

  const visibleAnswers = useMemo(() => {
    if (!overview) return [];
    if (showAllAnswers) return overview.answerLog;
    return overview.answerLog.slice(0, INITIAL_ANSWER_ROWS);
  }, [overview, showAllAnswers]);

  const answerColumns = useMemo<
    Array<DashboardDataTableColumn<FriendChallengeAnswerEntry>>
  >(() => {
    if (!overview) return [];

    const inviterName = overview.inviter.fullName.split(" ")[0] ?? overview.inviter.fullName;
    const inviteeName = overview.invitee.fullName.split(" ")[0] ?? overview.invitee.fullName;

    return [
      {
        id: "order",
        header: "#",
        renderCell: (row) => String(row.order).padStart(2, "0"),
      },
      {
        id: "question",
        header: t("detail.answerLog.question"),
        renderCell: (row) => (
          <p className="max-w-[20rem] text-sm text-slate-700">{row.questionText}</p>
        ),
      },
      {
        id: "inviter",
        header: inviterName,
        renderCell: (row) => (
          <AnswerCell
            text={row.inviterAnswer.selectedAnswerText}
            isCorrect={row.inviterAnswer.isCorrect}
          />
        ),
      },
      {
        id: "invitee",
        header: inviteeName,
        renderCell: (row) => (
          <AnswerCell
            text={row.inviteeAnswer.selectedAnswerText}
            isCorrect={row.inviteeAnswer.isCorrect}
          />
        ),
      },
      {
        id: "correct",
        header: t("detail.answerLog.correctAnswer"),
        renderCell: (row) => (
          <DashboardBadge tone="primary" className="font-mono">
            {row.correctAnswerText}
          </DashboardBadge>
        ),
      },
      {
        id: "time",
        header: t("detail.answerLog.timeSpent"),
        cellClassName: "text-slate-500",
        renderCell: (row) => {
          const avgMs =
            (row.inviterAnswer.responseTimeMs + row.inviteeAnswer.responseTimeMs) / 2;
          return formatResponseTimeMs(avgMs, locale);
        },
      },
    ];
  }, [locale, overview, t]);

  if (isLoading && !overview) {
    return <FriendChallengeDetailSkeleton />;
  }

  if (!overview) {
    return (
      <div className="rounded-[2rem] border border-dashed border-slate-200 bg-white p-10 text-center text-slate-500 shadow-[var(--dashboard-shadow-soft)]">
        {t("detail.loadError")}
      </div>
    );
  }

  const hasMoreAnswers = overview.answerLog.length > INITIAL_ANSWER_ROWS;

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        title={t("detail.page.title")}
        description={t("detail.page.description")}
        breadcrumbs={[
          { label: t("breadcrumbs.home"), href: ROUTES.ADMIN.HOME },
          { label: t("breadcrumbs.challenges"), href: ROUTES.ADMIN.FRIEND_CHALLENGES.LIST },
          { label: overview.title },
        ]}
        action={
          <DisabledFeatureButton
            label={t("detail.page.shareReport")}
            tooltip={t("comingSoon")}
            icon={Share2}
            variant="outline"
            className="rounded-2xl"
          />
        }
      />

      <Card className="rounded-[2rem] border-white/80 bg-white shadow-[var(--dashboard-shadow-soft)]">
        <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
              <FlaskConical className="h-7 w-7" aria-hidden />
            </div>
            <div className="space-y-2 text-right">
              <h2 className="text-2xl font-bold text-[#1E3A66]">{overview.topic || overview.title}</h2>
              <div className="flex flex-wrap gap-2">
                <DashboardBadge tone="primary">{overview.subjectName}</DashboardBadge>
                <DashboardBadge tone={difficultyTone(overview.difficulty)}>
                  {t("detail.difficultyLevel", {
                    level: t(`difficulty.${overview.difficulty}`),
                  })}
                </DashboardBadge>
              </div>
            </div>
          </div>
          <div className="space-y-1 text-right text-sm text-slate-500">
            <p>{formatChallengeDateTime(overview.challengeDate, overview.startTime, locale)}</p>
            <p>
              {t("detail.duration", {
                value: formatDurationSeconds(overview.actualDurationSeconds),
              })}
            </p>
          </div>
        </CardContent>
      </Card>

      <section className="grid items-center gap-6 lg:grid-cols-[1fr_auto_1fr]">
        <FriendChallengeParticipantCard
          player={overview.inviter}
          questionCount={overview.questionCount}
        />
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#2C4260] text-lg font-bold text-white shadow-lg">
          VS
        </div>
        <FriendChallengeParticipantCard
          player={overview.invitee}
          questionCount={overview.questionCount}
        />
      </section>

      <DashboardTableCard
        title={t("detail.answerLog.title")}
        actions={
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              {t("detail.answerLog.correct")}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              {t("detail.answerLog.incorrect")}
            </span>
          </div>
        }
      >
        <DashboardDataTable
          columns={answerColumns}
          rows={visibleAnswers}
          getRowKey={(row) => row.questionId || String(row.order)}
          emptyMessage={t("detail.answerLog.empty")}
        />
        {hasMoreAnswers ? (
          <div className="flex justify-center border-t border-slate-100 p-4">
            <Button
              type="button"
              variant="ghost"
              className="gap-2 rounded-xl text-[#2C4260]"
              onClick={() => setShowAllAnswers((prev) => !prev)}
            >
              {showAllAnswers
                ? t("detail.answerLog.showLess")
                : t("detail.answerLog.showAll", { count: overview.questionCount })}
              <ChevronDown
                className={cn("h-4 w-4 transition-transform", showAllAnswers && "rotate-180")}
                aria-hidden
              />
            </Button>
          </div>
        ) : null}
      </DashboardTableCard>
    </div>
  );
}

function AnswerCell({ text, isCorrect }: { text: string; isCorrect: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-sm font-medium",
        isCorrect ? "text-emerald-700" : "text-red-600",
      )}
    >
      {isCorrect ? (
        <Check className="h-4 w-4" aria-hidden />
      ) : (
        <X className="h-4 w-4" aria-hidden />
      )}
      {text}
    </span>
  );
}
