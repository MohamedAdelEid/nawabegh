"use client";

import { useTranslations } from "next-intl";
import type { FriendChallengeListItem } from "@/modules/student/domain/friend-challenge/friend-challenge.types";
import { FriendChallengeAvatar } from "./FriendChallengeAvatar";
import { FriendChallengeCountdownPill } from "./FriendChallengeCountdownPill";
import { cn } from "@/shared/application/lib/cn";

type FriendChallengePlayerCardProps = {
  name: string;
  profileImageUrl: string | null;
  subtitle?: string;
  level?: number | null;
  rank?: number | null;
  points?: number | null;
  badge: string;
  variant: "self" | "opponent";
};

export function FriendChallengePlayerCard({
  name,
  profileImageUrl,
  subtitle,
  level,
  rank,
  points,
  badge,
  variant,
}: FriendChallengePlayerCardProps) {
  const t = useTranslations("student.friendChallenge.upcoming");
  const isOpponent = variant === "opponent";

  return (
    <article
      className={cn(
        "relative flex w-full max-w-xs flex-col items-center rounded-[20px] border-2 bg-white p-8 shadow-[0_8px_0_rgba(0,0,0,0.05)]",
        isOpponent ? "border-[rgba(255,75,75,0.1)]" : "border-[rgba(43,65,94,0.05)]",
      )}
    >
      <span
        className={cn(
          "absolute -top-3 rounded-full px-4 py-1 text-xs font-bold text-white shadow-md",
          isOpponent ? "bg-[#ff4b4b]" : "bg-[#2b415e]",
        )}
      >
        {badge}
      </span>

      <FriendChallengeAvatar
        opponent={{ fullName: name, profileImageUrl }}
        size="lg"
        ringClassName={isOpponent ? "from-[#ff4b4b] to-[#ffe4e4]" : "from-[#2b415e] to-[#dbe3f3]"}
      />

      <h3 className="mt-6 text-2xl font-bold text-[#2b415e]">{name}</h3>

      <div className="mt-2 flex items-center gap-2 text-sm text-[#64748b]">
        {subtitle ? <span>{subtitle}</span> : null}
        {level != null ? (
          <>
            {subtitle ? <span className="size-1 rounded-full bg-[#cbd5e1]" /> : null}
            <span
              className={cn(
                "rounded-full px-3 py-0.5 text-xs font-semibold",
                isOpponent ? "bg-[rgba(255,75,75,0.1)] text-[#ff4b4b]" : "bg-[rgba(43,65,94,0.1)] text-[#2b415e]",
              )}
            >
              {t("level", { level })}
            </span>
          </>
        ) : null}
      </div>

      <div className="mt-6 grid w-full grid-cols-2 gap-4">
        <div className="rounded-xl bg-[#f6f7f7] p-3 text-center">
          <p className="text-[10px] font-bold uppercase text-[#94a3b8]">{t("points")}</p>
          <p className="text-lg font-extrabold text-[#2b415e]">{points ?? "—"}</p>
        </div>
        <div className="rounded-xl bg-[#f6f7f7] p-3 text-center">
          <p className="text-[10px] font-bold uppercase text-[#94a3b8]">{t("rank")}</p>
          <p className="text-lg font-extrabold text-[#2b415e]">
            {rank != null ? `#${rank}` : "—"}
          </p>
        </div>
      </div>
    </article>
  );
}

export function FriendChallengeListCard({
  item,
  onAccept,
  onDecline,
  onCancel,
  onEnter,
  onView,
  isLoading,
}: {
  item: FriendChallengeListItem;
  onAccept?: () => void;
  onDecline?: () => void;
  onCancel?: () => void;
  onEnter?: () => void;
  onView?: () => void;
  isLoading?: boolean;
}) {
  const t = useTranslations("student.friendChallenge.card");
  const countdownSeconds =
    item.remainingSecondsUntilStart > 0
      ? item.remainingSecondsUntilStart
      : item.remainingSecondsUntilEnd;

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <FriendChallengeAvatar opponent={item.opponent} size="sm" />
          <div className="text-start">
            <h3 className="font-bold text-[#2b415e]">{item.opponent.fullName}</h3>
            <p className="text-sm text-[#64748b]">
              {item.subjectName} • {item.title}
            </p>
          </div>
        </div>
        <span className="rounded-full bg-[#dbe3f3] px-3 py-1 text-xs font-semibold text-[#2b415e]">
          {item.subjectName}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm text-[#64748b]">
        <span>{t("questions", { count: item.questionCount })}</span>
        <span>•</span>
        <span>{t("wager", { points: item.wagerPoints })}</span>
        {item.opponent.level != null ? (
          <>
            <span>•</span>
            <span>{t("level", { level: item.opponent.level })}</span>
          </>
        ) : null}
      </div>

      {countdownSeconds > 0 ? (
        <FriendChallengeCountdownPill seconds={countdownSeconds} label={t("remaining")} />
      ) : null}

      <div className="flex flex-wrap gap-2">
        {item.canAccept && onAccept ? (
          <button
            type="button"
            disabled={isLoading}
            onClick={onAccept}
            className="rounded-xl bg-[#c7af6d] px-4 py-2 text-sm font-bold text-white"
          >
            {t("accept")}
          </button>
        ) : null}
        {item.canDecline && onDecline ? (
          <button
            type="button"
            disabled={isLoading}
            onClick={onDecline}
            className="rounded-xl border border-[#ff4b4b] px-4 py-2 text-sm font-bold text-[#ff4b4b]"
          >
            {t("decline")}
          </button>
        ) : null}
        {item.canCancel && onCancel ? (
          <button
            type="button"
            disabled={isLoading}
            onClick={onCancel}
            className="rounded-xl bg-[#ff4b4b] px-4 py-2 text-sm font-bold text-white"
          >
            {t("cancel")}
          </button>
        ) : null}
        {item.canEnter && onEnter ? (
          <button
            type="button"
            disabled={isLoading}
            onClick={onEnter}
            className="rounded-xl bg-[#2b415e] px-4 py-2 text-sm font-bold text-white shadow-[0_4px_0_#1e2e42]"
          >
            {t("enter")}
          </button>
        ) : null}
        {!item.canEnter && item.status === "Accepted" && onView ? (
          <button
            type="button"
            onClick={onView}
            className="rounded-xl border border-[#e2e8f0] px-4 py-2 text-sm font-bold text-[#64748b]"
          >
            {t("enterDisabled")}
          </button>
        ) : null}
        {onView ? (
          <button
            type="button"
            onClick={onView}
            className="rounded-xl border border-[#dbe3f3] px-4 py-2 text-sm font-bold text-[#2b415e]"
          >
            {t("viewDetails")}
          </button>
        ) : null}
      </div>
    </article>
  );
}
