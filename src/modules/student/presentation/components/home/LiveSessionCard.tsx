"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Clock, Eye, Radio } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import type {
  ChallengeStation,
  LiveSessionStation,
} from "@/modules/student/domain/types/student-home.types";
import { formatCompactCount } from "@/modules/student/domain/home/student-home.utils";
import { cn } from "@/shared/application/lib/cn";
import { ROUTES } from "@/shared/infrastructure/config/routes";

type LiveSessionCardProps = {
  session: LiveSessionStation;
  className?: string;
};

export function LiveSessionCard({ session, className }: LiveSessionCardProps) {
  const t = useTranslations("student.dashboard.home.liveSessions");
  const locale = useLocale();
  const router = useRouter();
  const [joining, setJoining] = useState(false);

  const handleJoin = () => {
    if (!session.canJoin || joining) return;
    setJoining(true);
    router.push(ROUTES.USER.STUDENT.LIVE_STATION(session.stationId));
  };

  const meta =
    session.remainingMinutes > 0
      ? t("endsIn", { minutes: session.remainingMinutes })
      : t("watching", { count: formatCompactCount(session.viewerCount, locale) });

  return (
    <article
      className={cn(
        "flex items-center gap-6 rounded-2xl border-2 border-[#e2e8f0] bg-white p-[18px]",
        "shadow-[0px_8px_0px_rgba(0,0,0,0.05)]",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <h3 className="line-clamp-2 text-start text-lg font-bold text-[#2b415e]">{session.title}</h3>
        <p className="text-start text-sm text-[#64748b]">
          {session.instructorName} • {session.subjectNameAr}
        </p>
        <div className="mt-2 flex items-center justify-between gap-3">
          <span
            className={cn(
              "inline-flex items-center gap-1 text-xs font-medium",
              session.remainingMinutes > 0 ? "text-[#ff4b4b]" : "text-[#64748b]",
            )}
          >
            {session.remainingMinutes > 0 ? (
              <Clock className="size-3 shrink-0" aria-hidden />
            ) : (
              <Eye className="size-3 shrink-0" aria-hidden />
            )}
            {meta}
          </span>
          <button
            type="button"
            onClick={handleJoin}
            disabled={!session.canJoin || joining}
            className="rounded-lg bg-[#2b415e] px-4 py-2 text-sm font-bold text-white shadow-[0px_4px_0px_rgba(0,0,0,0.1)] transition-opacity disabled:opacity-50"
          >
            {joining ? t("joining") : t("joinNow")}
          </button>
        </div>
      </div>

      <div className="relative h-28 w-40 shrink-0 overflow-hidden rounded-xl">
        {session.coverImageUrl ? (
          <Image
            src={session.coverImageUrl}
            alt=""
            fill
            unoptimized
            className="object-cover"
          />
        ) : (
          <div className="h-full w-full bg-[#dbe3f3]" />
        )}
        <span className="absolute end-2 top-2 inline-flex items-center gap-1 rounded-full bg-[#ff4b4b] px-2 py-0.5 text-[10px] font-bold text-white">
          <span className="size-1.5 rounded-full bg-white" aria-hidden />
          {t("liveBadge")}
        </span>
      </div>
    </article>
  );
}

type ChallengeCardProps = {
  challenge: ChallengeStation;
  className?: string;
};

export function ChallengeCard({ challenge, className }: ChallengeCardProps) {
  const t = useTranslations("student.dashboard.home.liveSessions");
  const router = useRouter();
  const [entering, setEntering] = useState(false);

  const handleEnter = () => {
    if (!challenge.canEnter || entering) return;
    setEntering(true);
    router.push(ROUTES.USER.STUDENT.CHALLENGE_STATION(challenge.stationId));
  };

  return (
    <article
      className={cn(
        "flex items-center gap-6 rounded-2xl border-2 border-[#e2e8f0] bg-white p-[18px]",
        "shadow-[0px_8px_0px_rgba(0,0,0,0.05)]",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <h3 className="line-clamp-2 text-start text-lg font-bold text-[#2b415e]">{challenge.title}</h3>
        <p className="text-start text-sm text-[#64748b]">
          {challenge.instructorName} • {challenge.subjectNameAr}
        </p>
        <div className="mt-2 flex items-center justify-between gap-3">
          {challenge.remainingMinutes > 0 ? (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-[#ff4b4b]">
              <Clock className="size-3 shrink-0" aria-hidden />
              {t("endsIn", { minutes: challenge.remainingMinutes })}
            </span>
          ) : (
            <span aria-hidden />
          )}
          <button
            type="button"
            onClick={() => void handleEnter()}
            disabled={!challenge.canEnter || entering}
            className="rounded-lg bg-[#2b415e] px-4 py-2 text-sm font-bold text-white shadow-[0px_4px_0px_rgba(0,0,0,0.1)] transition-opacity disabled:opacity-50"
          >
            {entering ? t("entering") : t("enterChallenge")}
          </button>
        </div>
      </div>

      <div className="relative h-28 w-40 shrink-0 overflow-hidden rounded-xl">
        {challenge.coverImageUrl ? (
          <Image
            src={challenge.coverImageUrl}
            alt=""
            fill
            unoptimized
            className="object-cover"
          />
        ) : (
          <div className="h-full w-full bg-[#dbe3f3]" />
        )}
        <span className="absolute end-2 top-2 inline-flex items-center gap-1 rounded-full bg-[#c7af6d] px-2 py-0.5 text-[10px] font-bold text-[#141c27]">
          <Radio className="size-2.5" aria-hidden />
          {t("challengeBadge")}
        </span>
      </div>
    </article>
  );
}
