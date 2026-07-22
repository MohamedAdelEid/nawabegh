"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowDown,
  ArrowUp,
  CalendarDays,
  CheckCircle2,
  CircleDot,
  Flame,
  Heart,
  Medal,
  Send,
  Trophy,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import {
  useSchoolEventHonorBoard,
  useSchoolEventLive,
  useSchoolEventMatches,
  useSchoolEventMutations,
  useSchoolEventStandings,
} from "@/modules/school/application/hooks/useSchoolEvents";
import type {
  SchoolEventActivityIconType,
  SchoolEventMatchStatus,
} from "@/modules/school/domain/types/schoolEvents.types";
import { cn } from "@/shared/application/lib/cn";
import { formatDate, formatNumber } from "@/shared/application/lib/format";
import { notify } from "@/shared/application/lib/toast";
import { resolveFileUrl } from "@/shared/infrastructure/files/fileUrl";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { Button } from "@/shared/presentation/components/ui/button";
import { DateTimePicker } from "@/shared/presentation/components/ui/date-time-picker";
import { UserAvatarImageOrInitials } from "@/shared/presentation/components/user/UserAvatarImageOrInitials";
import { SchoolEventLiveSkeleton } from "./SchoolEventsSkeletons";
import { SchoolTeamAvatar } from "./SchoolTeamAvatar";

type LiveTab = "live" | "matches" | "honor";

const ACTIVITY_ICON_OPTIONS: Array<{
  value: SchoolEventActivityIconType;
  icon: typeof CheckCircle2;
  tone: string;
}> = [
  { value: "success", icon: CheckCircle2, tone: "text-emerald-600" },
  { value: "round", icon: CircleDot, tone: "text-sky-600" },
  { value: "trophy", icon: Trophy, tone: "text-amber-600" },
];

function localDateTimeToIso(value: string) {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString();
}

function formatTimer(seconds: number, fallback: string) {
  if (fallback) return fallback;
  const safe = Math.max(0, seconds);
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function FeedIcon({ type }: { type: string | null }) {
  const normalized = (type ?? "").toLowerCase();
  if (normalized.includes("trophy")) {
    return <Trophy className="size-4 text-amber-600" />;
  }
  if (normalized.includes("round")) {
    return <CircleDot className="size-4 text-sky-600" />;
  }
  if (normalized.includes("success") || normalized.includes("check")) {
    return <CheckCircle2 className="size-4 text-emerald-600" />;
  }
  return <Send className="size-4 text-sky-600" />;
}

export function SchoolEventLiveView({ eventId }: { eventId: string }) {
  const t = useTranslations("school.dashboard.events.live");
  const common = useTranslations("school.dashboard.events.common");
  const locale = useLocale();
  const [tab, setTab] = useState<LiveTab>("live");
  const [message, setMessage] = useState("");
  const [iconType, setIconType] = useState<SchoolEventActivityIconType>("success");
  const [activityTeamId, setActivityTeamId] = useState("");
  const [homeScoreDraft, setHomeScoreDraft] = useState("");
  const [awayScoreDraft, setAwayScoreDraft] = useState("");
  const [setsHomeDraft, setSetsHomeDraft] = useState("");
  const [setsAwayDraft, setSetsAwayDraft] = useState("");
  const [timerDraft, setTimerDraft] = useState("");
  const [matchRound, setMatchRound] = useState("1");
  const [matchHomeTeamId, setMatchHomeTeamId] = useState("");
  const [matchAwayTeamId, setMatchAwayTeamId] = useState("");
  const [matchScheduledAt, setMatchScheduledAt] = useState("");
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptionA, setPollOptionA] = useState("");
  const [pollOptionB, setPollOptionB] = useState("");
  const [scoreSeededFor, setScoreSeededFor] = useState<string | null>(null);

  const liveQuery = useSchoolEventLive(eventId);
  const matchesQuery = useSchoolEventMatches(eventId);
  const standingsQuery = useSchoolEventStandings(eventId);
  const honorQuery = useSchoolEventHonorBoard(eventId);
  const mutations = useSchoolEventMutations();

  const data = liveQuery.data;
  const createTeamHref = `${ROUTES.USER.SCHOOL.EVENTS.TEAMS_CREATE}?eventId=${encodeURIComponent(eventId)}`;

  const teams = useMemo(() => {
    const map = new Map<number, { teamId: number; teamName: string }>();
    for (const entry of data?.standings ?? []) {
      map.set(entry.teamId, { teamId: entry.teamId, teamName: entry.teamName });
    }
    for (const entry of standingsQuery.data ?? []) {
      map.set(entry.teamId, { teamId: entry.teamId, teamName: entry.teamName });
    }
    return Array.from(map.values());
  }, [data?.standings, standingsQuery.data]);

  const tabs = useMemo(
    () =>
      [
        { id: "live" as const, label: t("tabs.live") },
        { id: "matches" as const, label: t("tabs.matches") },
        { id: "honor" as const, label: t("tabs.honor") },
      ] as const,
    [t],
  );

  const iconLabels = useMemo(
    () =>
      ({
        success: t("feed.icons.success"),
        round: t("feed.icons.round"),
        trophy: t("feed.icons.trophy"),
      }) satisfies Record<SchoolEventActivityIconType, string>,
    [t],
  );

  const score = data?.score ?? null;

  useEffect(() => {
    if (!score) return;
    const scoreKey = `${score.matchId ?? "none"}-${score.homePoints}-${score.awayPoints}`;
    if (scoreSeededFor === scoreKey) return;
    setScoreSeededFor(scoreKey);
    setHomeScoreDraft(String(score.homePoints));
    setAwayScoreDraft(String(score.awayPoints));
    setSetsHomeDraft(String(score.setsWonHome));
    setSetsAwayDraft(String(score.setsWonAway));
    setTimerDraft(score.timerSeconds > 0 ? String(score.timerSeconds) : "");
  }, [score, scoreSeededFor]);

  const postUpdate = async () => {
    const trimmed = message.trim();
    if (!trimmed) return;
    try {
      await mutations.postActivity.mutateAsync({
        id: eventId,
        payload: {
          message: trimmed,
          iconType,
          teamId: activityTeamId ? Number(activityTeamId) : null,
        },
      });
      setMessage("");
      notify.success(t("messages.posted"));
    } catch (error) {
      notify.error(error instanceof Error ? error.message : common("actionError"));
    }
  };

  const vote = async (pollId: string | number, optionId: string | number) => {
    try {
      await mutations.votePoll.mutateAsync({ eventId, pollId, optionId });
      notify.success(t("messages.voted"));
    } catch (error) {
      notify.error(error instanceof Error ? error.message : common("actionError"));
    }
  };

  const patchScore = async (
    matchId: number | string,
    status?: SchoolEventMatchStatus,
  ) => {
    const homeScore = Number(homeScoreDraft);
    const awayScore = Number(awayScoreDraft);
    if (!Number.isFinite(homeScore) || !Number.isFinite(awayScore)) {
      notify.error(t("score.invalid"));
      return;
    }
    try {
      await mutations.patchMatchScore.mutateAsync({
        eventId,
        matchId,
        payload: {
          homeScore,
          awayScore,
          setsWonHome: setsHomeDraft ? Number(setsHomeDraft) : undefined,
          setsWonAway: setsAwayDraft ? Number(setsAwayDraft) : undefined,
          remainingSeconds: timerDraft ? Number(timerDraft) : undefined,
          status,
        },
      });
      notify.success(t("messages.scoreUpdated"));
    } catch (error) {
      notify.error(error instanceof Error ? error.message : common("actionError"));
    }
  };

  const startMatchLive = async (matchId: number) => {
    try {
      await mutations.patchMatchScore.mutateAsync({
        eventId,
        matchId,
        payload: {
          homeScore: 0,
          awayScore: 0,
          status: "live",
        },
      });
      setTab("live");
      notify.success(t("messages.matchLive"));
    } catch (error) {
      notify.error(error instanceof Error ? error.message : common("actionError"));
    }
  };

  const createMatch = async () => {
    const round = Number(matchRound);
    const homeTeamId = Number(matchHomeTeamId);
    const awayTeamId = Number(matchAwayTeamId);
    const scheduledAt = localDateTimeToIso(matchScheduledAt);
    if (
      !Number.isFinite(round) ||
      round < 1 ||
      !homeTeamId ||
      !awayTeamId ||
      homeTeamId === awayTeamId ||
      !scheduledAt
    ) {
      notify.error(t("matches.invalid"));
      return;
    }
    try {
      await mutations.createMatch.mutateAsync({
        eventId,
        payload: { round, homeTeamId, awayTeamId, scheduledAt },
      });
      setMatchRound(String(round + 1));
      setMatchHomeTeamId("");
      setMatchAwayTeamId("");
      setMatchScheduledAt("");
      notify.success(t("messages.matchCreated"));
    } catch (error) {
      notify.error(error instanceof Error ? error.message : common("actionError"));
    }
  };

  const createPoll = async () => {
    const question = pollQuestion.trim();
    const options = [pollOptionA.trim(), pollOptionB.trim()].filter(Boolean);
    if (!question || options.length < 2) {
      notify.error(t("poll.invalid"));
      return;
    }
    try {
      await mutations.createPoll.mutateAsync({
        eventId,
        payload: { question, options },
      });
      setPollQuestion("");
      setPollOptionA("");
      setPollOptionB("");
      notify.success(t("messages.pollCreated"));
    } catch (error) {
      notify.error(error instanceof Error ? error.message : common("actionError"));
    }
  };

  if (liveQuery.isLoading) return <SchoolEventLiveSkeleton />;

  if (liveQuery.isError || !data) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
        <p>{common("loadError")}</p>
        <Button className="mt-4" variant="outline" onClick={() => void liveQuery.refetch()}>
          {common("retry")}
        </Button>
      </div>
    );
  }

  const poll = data.poll;
  const activeMatchId = score?.matchId;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1e3a5f] md:text-3xl">{t("title")}</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">{t("subtitle")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" className="rounded-xl">
            <Link href={createTeamHref}>{t("actions.createTeam")}</Link>
          </Button>
          <Button asChild className="rounded-xl bg-[#1e3a5f] text-white hover:bg-[#163049]">
            <Link href={ROUTES.USER.SCHOOL.EVENTS.RANKINGS}>{t("actions.rankings")}</Link>
          </Button>
        </div>
      </div>

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[1.75rem] border border-slate-200 bg-gradient-to-l from-slate-100 to-sky-50 p-5 md:p-7"
      >
        <div className="mb-4 flex flex-wrap gap-2">
          {data.hero.isLive ? (
            <span className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white">
              {data.hero.statusLabel || t("tabs.live")}
            </span>
          ) : null}
          {data.hero.seriesLabel ? (
            <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
              {data.hero.seriesLabel}
            </span>
          ) : null}
        </div>
        <h2 className="text-2xl font-bold text-[#1e3a5f] md:text-3xl">{data.hero.title}</h2>
        {data.hero.description ? (
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
            {data.hero.description}
          </p>
        ) : null}
      </motion.section>

      <div role="tablist" className="flex flex-wrap gap-1 border-b border-slate-200">
        {tabs.map((item) => {
          const selected = item.id === tab;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setTab(item.id)}
              className={cn(
                "relative min-h-11 px-4 py-2 text-sm font-semibold transition-colors",
                selected ? "text-[#1e3a5f]" : "text-slate-500 hover:text-slate-700",
              )}
            >
              {item.label}
              {selected ? (
                <motion.span
                  layoutId="school-event-live-tab"
                  className="absolute inset-x-2 -bottom-px h-1 rounded-full bg-[#1e3a5f]"
                />
              ) : null}
            </button>
          );
        })}
      </div>

      {tab === "live" ? (
        <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-5">
            {score ? (
              <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-[1.5rem] border border-slate-200 bg-white p-5"
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h3 className="font-bold text-[#1e3a5f]">{t("score.title")}</h3>
                  <span className="rounded-full bg-rose-50 px-3 py-1 text-sm font-bold text-rose-600">
                    {formatTimer(score.timerSeconds, score.timerLabel)}
                  </span>
                </div>
                {score.roundLabel ? (
                  <p className="mb-4 text-center text-xs font-semibold text-slate-500">
                    {score.roundLabel}
                  </p>
                ) : null}
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                  <div className="min-w-0 text-center">
                    <SchoolTeamAvatar
                      name={score.homeTeamName}
                      logoUrl={score.homeTeamLogoUrl}
                      size="md"
                    />
                    <p className="mt-2 line-clamp-2 break-words text-sm font-bold text-slate-800 sm:text-base">
                      {score.homeTeamName}
                    </p>
                    <p className="text-sm text-slate-500">
                      {formatNumber(score.homePoints, locale)}
                    </p>
                  </div>
                  <div className="text-3xl font-black text-[#1e3a5f]">
                    {score.scoreLabel}
                  </div>
                  <div className="min-w-0 text-center">
                    <SchoolTeamAvatar
                      name={score.awayTeamName}
                      logoUrl={score.awayTeamLogoUrl}
                      size="md"
                    />
                    <p className="mt-2 line-clamp-2 break-words text-sm font-bold text-slate-800 sm:text-base">
                      {score.awayTeamName}
                    </p>
                    <p className="text-sm text-slate-500">
                      {formatNumber(score.awayPoints, locale)}
                    </p>
                  </div>
                </div>
                {(score.likesCount > 0 || score.fireCount > 0 || score.medalsCount > 0) ? (
                  <div className="mt-5 flex flex-wrap justify-center gap-4 text-sm text-slate-600">
                    <span className="inline-flex items-center gap-1">
                      <Heart className="size-4 text-rose-500" />
                      {formatNumber(score.likesCount, locale)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Flame className="size-4 text-orange-500" />
                      {formatNumber(score.fireCount, locale)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Medal className="size-4 text-amber-500" />
                      {formatNumber(score.medalsCount, locale)}
                    </span>
                  </div>
                ) : null}

                {activeMatchId != null ? (
                  <div className="mt-5 space-y-3 border-t border-slate-100 pt-4">
                    <p className="text-sm font-semibold text-[#1e3a5f]">{t("score.manage")}</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="space-y-1 text-xs text-slate-500">
                        {t("score.homeScore")}
                        <input
                          type="number"
                          value={homeScoreDraft}
                          onChange={(event) => setHomeScoreDraft(event.target.value)}
                          className="min-h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none ring-[#1e3a5f]/20 focus:ring-2"
                        />
                      </label>
                      <label className="space-y-1 text-xs text-slate-500">
                        {t("score.awayScore")}
                        <input
                          type="number"
                          value={awayScoreDraft}
                          onChange={(event) => setAwayScoreDraft(event.target.value)}
                          className="min-h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none ring-[#1e3a5f]/20 focus:ring-2"
                        />
                      </label>
                      <label className="space-y-1 text-xs text-slate-500">
                        {t("score.setsHome")}
                        <input
                          type="number"
                          value={setsHomeDraft}
                          onChange={(event) => setSetsHomeDraft(event.target.value)}
                          className="min-h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none ring-[#1e3a5f]/20 focus:ring-2"
                        />
                      </label>
                      <label className="space-y-1 text-xs text-slate-500">
                        {t("score.setsAway")}
                        <input
                          type="number"
                          value={setsAwayDraft}
                          onChange={(event) => setSetsAwayDraft(event.target.value)}
                          className="min-h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none ring-[#1e3a5f]/20 focus:ring-2"
                        />
                      </label>
                      <label className="space-y-1 text-xs text-slate-500 sm:col-span-2">
                        {t("score.remainingSeconds")}
                        <input
                          type="number"
                          value={timerDraft}
                          onChange={(event) => setTimerDraft(event.target.value)}
                          className="min-h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none ring-[#1e3a5f]/20 focus:ring-2"
                        />
                      </label>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        className="rounded-xl bg-[#1e3a5f] text-white hover:translate-y-0 hover:bg-[#163049]"
                        disabled={mutations.patchMatchScore.isPending}
                        onClick={() => void patchScore(activeMatchId, "live")}
                      >
                        {t("score.updateLive")}
                      </Button>
                      <Button
                        variant="outline"
                        className="rounded-xl"
                        disabled={mutations.patchMatchScore.isPending}
                        onClick={() => void patchScore(activeMatchId, "completed")}
                      >
                        {t("score.complete")}
                      </Button>
                    </div>
                  </div>
                ) : null}
              </motion.section>
            ) : (
              <section className="rounded-[1.5rem] border border-dashed border-slate-200 bg-white p-5">
                <h3 className="font-bold text-[#1e3a5f]">{t("score.title")}</h3>
                <p className="mt-2 text-sm text-slate-500">{t("score.empty")}</p>
                <p className="mt-1 text-xs text-slate-400">{t("score.emptyHint")}</p>
              </section>
            )}

            <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
              <h3 className="mb-4 font-bold text-[#1e3a5f]">{t("feed.title")}</h3>
              <div className="space-y-4">
                {data.feed.length === 0 ? (
                  <p className="text-sm text-slate-500">{t("feed.empty")}</p>
                ) : (
                  data.feed.map((item) => (
                    <div key={String(item.id)} className="flex gap-3">
                      <div className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-sky-50">
                        <FeedIcon type={item.icon} />
                      </div>
                      <div className="min-w-0 flex-1 rounded-2xl bg-slate-50 px-4 py-3">
                        <p className="text-xs text-slate-400">
                          {item.relativeTimeLabel ||
                            (item.createdAt ? formatDate(item.createdAt, locale) : "")}
                        </p>
                        <p className="mt-1 text-sm text-slate-700">{item.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="mt-4 space-y-3">
                <div className="flex flex-wrap gap-2">
                  {ACTIVITY_ICON_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    const selected = iconType === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setIconType(option.value)}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                          selected
                            ? "border-[#1e3a5f] bg-[#1e3a5f] text-white"
                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300",
                        )}
                        aria-label={iconLabels[option.value]}
                      >
                        <Icon className={cn("size-3.5", selected ? "text-white" : option.tone)} />
                        {iconLabels[option.value]}
                      </button>
                    );
                  })}
                </div>
                {teams.length > 0 ? (
                  <select
                    value={activityTeamId}
                    onChange={(event) => setActivityTeamId(event.target.value)}
                    className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none ring-[#1e3a5f]/20 focus:ring-2"
                  >
                    <option value="">{t("feed.teamOptional")}</option>
                    {teams.map((team) => (
                      <option key={team.teamId} value={team.teamId}>
                        {team.teamName}
                      </option>
                    ))}
                  </select>
                ) : null}
                <div className="flex gap-2">
                  <input
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder={t("feed.placeholder")}
                    className="min-h-11 flex-1 rounded-xl border border-slate-200 px-4 text-sm outline-none ring-[#1e3a5f]/20 focus:ring-2"
                    onKeyDown={(event) => {
                      if (event.key === "Enter") void postUpdate();
                    }}
                  />
                  <Button
                    className="min-h-11 rounded-xl bg-[#1e3a5f] text-white hover:translate-y-0 hover:bg-[#163049]"
                    onClick={() => void postUpdate()}
                    disabled={mutations.postActivity.isPending}
                  >
                    <Send className="size-4" />
                    {t("feed.send")}
                  </Button>
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-5">
            {poll ? (
              <section className="rounded-[1.5rem] bg-[#15233b] p-5 text-white">
                <h3 className="font-bold">{t("poll.title")}</h3>
                <p className="mt-2 text-sm text-slate-200">{poll.question}</p>
                <div className="mt-4 space-y-3">
                  {poll.options.map((option) => (
                    <button
                      key={String(option.id)}
                      type="button"
                      onClick={() => void vote(poll.id, option.id)}
                      className="block w-full rounded-xl bg-white/5 p-3 text-start transition hover:bg-white/10"
                    >
                      <div className="mb-2 flex items-center justify-between gap-2 text-sm">
                        <span>{option.label}</span>
                        <span>{formatNumber(option.percent, locale)}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-[#c4a574]"
                          style={{ width: `${Math.min(100, Math.max(0, option.percent))}%` }}
                        />
                      </div>
                    </button>
                  ))}
                </div>
                <p className="mt-4 text-xs text-slate-300">
                  {t("poll.votes", { count: formatNumber(poll.totalVotes, locale) })}
                </p>
              </section>
            ) : (
              <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
                <h3 className="font-bold text-[#1e3a5f]">{t("poll.createTitle")}</h3>
                <p className="mt-1 text-sm text-slate-500">{t("poll.createHint")}</p>
                <div className="mt-4 space-y-3">
                  <input
                    value={pollQuestion}
                    onChange={(event) => setPollQuestion(event.target.value)}
                    placeholder={t("poll.questionPlaceholder")}
                    className="min-h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none ring-[#1e3a5f]/20 focus:ring-2"
                  />
                  <input
                    value={pollOptionA}
                    onChange={(event) => setPollOptionA(event.target.value)}
                    placeholder={t("poll.optionPlaceholder", { index: 1 })}
                    className="min-h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none ring-[#1e3a5f]/20 focus:ring-2"
                  />
                  <input
                    value={pollOptionB}
                    onChange={(event) => setPollOptionB(event.target.value)}
                    placeholder={t("poll.optionPlaceholder", { index: 2 })}
                    className="min-h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none ring-[#1e3a5f]/20 focus:ring-2"
                  />
                  <Button
                    className="rounded-xl bg-[#1e3a5f] text-white hover:translate-y-0 hover:bg-[#163049]"
                    disabled={mutations.createPoll.isPending}
                    onClick={() => void createPoll()}
                  >
                    {t("poll.create")}
                  </Button>
                </div>
              </section>
            )}

            <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
              <h3 className="mb-4 font-bold text-[#1e3a5f]">{t("standings.title")}</h3>
              {data.standings.length === 0 ? (
                <p className="text-sm text-slate-500">{t("standings.empty")}</p>
              ) : (
                <div className="space-y-3">
                  {data.standings.map((entry) => (
                    <div
                      key={`${entry.teamId}-${entry.rank}`}
                      className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2"
                    >
                      <span className="w-6 text-sm font-bold text-slate-500">{entry.rank}</span>
                      <SchoolTeamAvatar
                        name={entry.teamName}
                        logoUrl={entry.logoUrl}
                        size="sm"
                        className="mx-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-slate-800">{entry.teamName}</p>
                        <p className="truncate text-xs text-slate-500">{entry.schoolName}</p>
                      </div>
                      <div className="text-end">
                        <p className="font-bold text-[#1e3a5f]">
                          {formatNumber(entry.points, locale)}
                        </p>
                        {entry.rankChange != null && entry.rankChange !== 0 ? (
                          <span
                            className={cn(
                              "inline-flex items-center text-xs",
                              entry.rankChange > 0 ? "text-emerald-600" : "text-rose-600",
                            )}
                          >
                            {entry.rankChange > 0 ? (
                              <ArrowUp className="size-3" />
                            ) : (
                              <ArrowDown className="size-3" />
                            )}
                            {Math.abs(entry.rankChange)}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Link
                href={ROUTES.USER.SCHOOL.EVENTS.RANKINGS}
                className="mt-4 inline-flex text-sm font-semibold text-[#1e3a5f] hover:underline"
              >
                {t("standings.viewAll")}
              </Link>
            </section>

            {data.nextMatch ? (
              <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
                <div className="mb-3 flex items-center gap-2 text-[#1e3a5f]">
                  <CalendarDays className="size-4" />
                  <h3 className="font-bold">{t("nextMatch.title")}</h3>
                </div>
                <p className="text-sm text-slate-500">
                  {data.nextMatch.timeLabel ||
                    (data.nextMatch.startsAt
                      ? formatDate(data.nextMatch.startsAt, locale)
                      : "")}
                </p>
                <p className="mt-2 font-bold text-slate-800">
                  {data.nextMatch.homeTeamName} VS {data.nextMatch.awayTeamName}
                </p>
              </section>
            ) : null}
          </div>
        </div>
      ) : null}

      {tab === "matches" ? (
        <div className="space-y-5">
          <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
            <h3 className="font-bold text-[#1e3a5f]">{t("matches.createTitle")}</h3>
            <p className="mt-1 text-sm text-slate-500">{t("matches.createHint")}</p>
            {teams.length < 2 ? (
              <p className="mt-4 text-sm text-amber-700">{t("matches.needTeams")}</p>
            ) : (
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <label className="space-y-1 text-xs text-slate-500">
                  {t("matches.round")}
                  <input
                    type="number"
                    min={1}
                    value={matchRound}
                    onChange={(event) => setMatchRound(event.target.value)}
                    className="min-h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none ring-[#1e3a5f]/20 focus:ring-2"
                  />
                </label>
                <div className="space-y-1 text-xs text-slate-500">
                  {t("matches.scheduledAt")}
                  <DateTimePicker
                    value={matchScheduledAt}
                    onChange={setMatchScheduledAt}
                    locale={locale}
                    ariaLabel={t("matches.scheduledAt")}
                    placeholder={t("matches.scheduledAt")}
                    timeLabel={t("matches.time")}
                    confirmLabel={t("matches.confirmDate")}
                  />
                </div>
                <label className="space-y-1 text-xs text-slate-500">
                  {t("matches.homeTeam")}
                  <select
                    value={matchHomeTeamId}
                    onChange={(event) => setMatchHomeTeamId(event.target.value)}
                    className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none ring-[#1e3a5f]/20 focus:ring-2"
                  >
                    <option value="">{t("matches.selectTeam")}</option>
                    {teams.map((team) => (
                      <option key={team.teamId} value={team.teamId}>
                        {team.teamName}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1 text-xs text-slate-500">
                  {t("matches.awayTeam")}
                  <select
                    value={matchAwayTeamId}
                    onChange={(event) => setMatchAwayTeamId(event.target.value)}
                    className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none ring-[#1e3a5f]/20 focus:ring-2"
                  >
                    <option value="">{t("matches.selectTeam")}</option>
                    {teams.map((team) => (
                      <option key={team.teamId} value={team.teamId}>
                        {team.teamName}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="md:col-span-2">
                  <Button
                    className="rounded-xl bg-[#1e3a5f] text-white hover:translate-y-0 hover:bg-[#163049]"
                    disabled={mutations.createMatch.isPending}
                    onClick={() => void createMatch()}
                  >
                    {t("matches.create")}
                  </Button>
                </div>
              </div>
            )}
          </section>

          <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
            {matchesQuery.isLoading ? (
              <p className="text-sm text-slate-500">{common("loading")}</p>
            ) : (matchesQuery.data?.length ?? 0) === 0 ? (
              <p className="text-sm text-slate-500">{t("matches.empty")}</p>
            ) : (
              <div className="space-y-3">
                {matchesQuery.data?.map((match) => (
                  <div
                    key={match.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
                  >
                    <div>
                      <p className="text-xs text-slate-500">
                        {[
                          match.roundLabel ||
                            (match.round ? t("matches.roundLabel", { round: match.round }) : ""),
                          match.statusLabel || match.status,
                        ]
                          .filter(Boolean)
                          .join(" • ")}
                      </p>
                      <p className="mt-1 font-semibold text-slate-800">
                        {match.homeTeamName} {t("matches.vs")} {match.awayTeamName}
                      </p>
                      {match.startsAt ? (
                        <p className="mt-1 text-xs text-slate-500">
                          {formatDate(match.startsAt, locale)}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-xl font-bold text-[#1e3a5f]">
                        {match.homeScore ?? "-"} : {match.awayScore ?? "-"}
                      </p>
                      {match.status !== "live" && match.status !== "completed" ? (
                        <Button
                          size="sm"
                          className="rounded-xl bg-emerald-600 text-white hover:translate-y-0 hover:bg-emerald-700"
                          disabled={mutations.patchMatchScore.isPending}
                          onClick={() => void startMatchLive(match.id)}
                        >
                          {t("matches.goLive")}
                        </Button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      ) : null}

      {tab === "honor" ? (
        <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
          {honorQuery.isLoading ? (
            <p className="text-sm text-slate-500">{common("loading")}</p>
          ) : (honorQuery.data?.length ?? 0) === 0 ? (
            <p className="text-sm text-slate-500">{t("honor.empty")}</p>
          ) : (
            <div className="space-y-3">
              {honorQuery.data?.map((entry) => (
                <div
                  key={`${entry.rank}-${entry.fullName}`}
                  className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3"
                >
                  <div className="flex size-9 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                    {entry.rank <= 3 ? <Trophy className="size-4" /> : entry.rank}
                  </div>
                  <UserAvatarImageOrInitials
                    trackKey={`honor-${entry.rank}-${entry.fullName}`}
                    name={entry.fullName}
                    imageUrl={resolveFileUrl(entry.avatarUrl)}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-800">{entry.fullName}</p>
                    <p className="text-xs text-slate-500">
                      {[
                        entry.roleLabel ||
                          (entry.isCaptain ? t("honor.captain") : ""),
                        entry.teamName,
                        entry.gradeLabel,
                      ]
                        .filter(Boolean)
                        .join(" • ")}
                    </p>
                  </div>
                  <p className="font-bold text-[#1e3a5f]">
                    {entry.pointsLabel ||
                      `${formatNumber(entry.points, locale)} ${t("honor.points")}`}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      ) : null}
    </div>
  );
}
