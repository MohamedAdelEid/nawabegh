"use client";

import { useLocale, useTranslations } from "next-intl";
import type { FriendChallengeOverviewPlayer } from "@/modules/admin/domain/types/friendChallenges.types";
import {
  formatPointsChange,
  playerAccuracyPercent,
} from "@/modules/admin/domain/utils/friendChallengesDisplay";
import { cn } from "@/shared/application/lib/cn";
import { DashboardBadge } from "@/shared/presentation/components/dashboard/DashboardBadge";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { UserAvatarImageOrInitials } from "@/shared/presentation/components/user";

export type FriendChallengeParticipantCardProps = {
  player: FriendChallengeOverviewPlayer;
  questionCount: number;
  isWinner?: boolean;
};

export function FriendChallengeParticipantCard({
  player,
  questionCount,
  isWinner = player.isWinner,
}: FriendChallengeParticipantCardProps) {
  const t = useTranslations("admin.dashboard.friendChallenges.detail.participant");
  const locale = useLocale();
  const accuracy = playerAccuracyPercent(player.correctAnswers, questionCount);
  const pointsPositive = player.pointsChange >= 0;

  return (
    <Card
      className={cn(
        "rounded-[2rem] border-white/80 bg-white shadow-[var(--dashboard-shadow-soft)]",
        isWinner && "ring-2 ring-emerald-200",
      )}
    >
      <CardContent className="space-y-5 p-6">
        {isWinner ? (
          <DashboardBadge tone="success" className="w-fit">
            {t("winner")}
          </DashboardBadge>
        ) : (
          <div className="h-6" />
        )}

        <div className="flex flex-col items-center gap-3 text-center">
          <div className="relative">
            <UserAvatarImageOrInitials
              trackKey={player.studentId}
              name={player.fullName}
              imageUrl={player.profileImageUrl}
              size="xl"
              circleClassName="bg-[#DCE6F5] text-[#2C4260] h-24 w-24 text-2xl"
            />
            <span className="absolute -bottom-1 -left-1 flex h-9 w-9 items-center justify-center rounded-full bg-[#2C4260] text-sm font-bold text-white">
              {String(player.totalScore).padStart(2, "0")}
            </span>
          </div>

          <div className="space-y-1">
            <p className="text-xl font-bold text-slate-800">{player.fullName}</p>
            <p className="text-sm text-slate-500">{player.schoolName}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-2xl bg-slate-50 p-3">
            <p className="text-xs text-slate-500">{t("score")}</p>
            <p className="text-2xl font-bold text-slate-800">
              {String(player.totalScore).padStart(2, "0")}
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-3">
            <p className="text-xs text-slate-500">{t("points")}</p>
            <p
              className={cn(
                "text-lg font-bold",
                pointsPositive ? "text-emerald-600" : "text-red-500",
              )}
            >
              {formatPointsChange(player.pointsChange, locale)}
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-3">
            <p className="text-xs text-slate-500">{t("accuracy")}</p>
            <p className="text-lg font-bold text-slate-800">{accuracy}%</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                isWinner ? "bg-emerald-500" : "bg-slate-300",
              )}
              style={{ width: `${accuracy}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
