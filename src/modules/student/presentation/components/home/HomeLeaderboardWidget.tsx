"use client";

import Image from "next/image";
import { Trophy } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { LeaderboardWidgetDto } from "@/modules/student/domain/types/student-home.types";
import { UserAvatarImageOrInitials } from "@/shared/presentation/components/user/UserAvatarImageOrInitials";

type HomeLeaderboardWidgetProps = {
  data?: LeaderboardWidgetDto;
  isLoading?: boolean;
};

const PODIUM_ORDER = [2, 1, 3] as const;

const PODIUM_RING: Record<number, string> = {
  1: "border-[#c7af6d]",
  2: "border-[#cbd5e1]",
  3: "border-[#cd7f32]",
};

const PODIUM_BADGE: Record<number, string> = {
  1: "bg-[#c7af6d] text-[#141c27] size-6",
  2: "bg-[#cbd5e1] text-[#1e293b] size-5",
  3: "bg-[#cd7f32] text-white size-5",
};

const PODIUM_SIZE: Record<number, string> = {
  1: "size-20",
  2: "size-14",
  3: "size-14",
};

function PodiumAvatar({
  rank,
  name,
  points,
  imageUrl,
  locale,
}: {
  rank: number;
  name: string;
  points: number;
  imageUrl: string | null;
  locale: string;
}) {
  const formatter = new Intl.NumberFormat(locale.startsWith("ar") ? "ar" : "en");
  const isFirst = rank === 1;

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <div
          className={`overflow-hidden rounded-full border-4 ${PODIUM_RING[rank]} ${PODIUM_SIZE[rank]}`}
        >
          {imageUrl ? (
            <Image src={imageUrl} alt="" width={80} height={80} unoptimized className="h-full w-full object-cover" />
          ) : (
            <UserAvatarImageOrInitials
              trackKey={`podium-${rank}-${name}`}
              name={name}
              imageUrl={null}
              size={isFirst ? "xl" : "large"}
            />
          )}
        </div>
        <span
          className={`absolute -bottom-2 start-1/2 flex -translate-x-1/2 items-center justify-center rounded-full font-extrabold ${PODIUM_BADGE[rank]}`}
        >
          {rank}
        </span>
      </div>
      <p className={`mt-4 text-center font-bold text-[#2b415e] ${isFirst ? "text-sm" : "text-xs"}`}>
        {name.split(" ")[0]}
      </p>
      <p className="text-center text-[10px] text-[#64748b] md:text-xs">
        {formatter.format(points)} XP
      </p>
    </div>
  );
}

export function HomeLeaderboardWidget({ data, isLoading }: HomeLeaderboardWidgetProps) {
  const t = useTranslations("student.dashboard.home.leaderboard");
  const locale = useLocale();

  if (isLoading) {
    return (
      <div className="h-full min-h-[320px] animate-pulse rounded-3xl border-2 border-[#e2e8f0] bg-white" />
    );
  }

  const byRank = new Map((data?.topThree ?? []).map((entry) => [entry.rank, entry]));

  return (
    <section className="flex h-full flex-col gap-4 rounded-3xl border-2 border-[#e2e8f0] bg-white p-6 shadow-[0px_8px_0px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-start gap-2">
        <h2 className="text-xl font-bold text-[#2b415e]">{t("title")}</h2>
        <Trophy className="size-5 text-[#c7af6d]" aria-hidden />
      </div>

      <div className="border-b border-[#f1f5f9] pb-4">
        <div className="flex items-end justify-center gap-6 pt-2">
          {PODIUM_ORDER.map((rank) => {
            const entry = byRank.get(rank);
            if (!entry) {
              return <div key={rank} className="w-16" />;
            }
            return (
              <div key={rank} className={rank === 1 ? "-mt-2" : "mt-4"}>
                <PodiumAvatar
                  rank={rank}
                  name={entry.fullName}
                  points={entry.currentPoints}
                  imageUrl={entry.profileImageUrl}
                  locale={locale}
                />
              </div>
            );
          })}
        </div>
      </div>

      {data?.currentUser ? (
        <div className="flex items-center justify-between gap-3 rounded-xl p-3">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-[#94a3b8]">{data.currentUser.rank}</span>
            <UserAvatarImageOrInitials
              trackKey={data.currentUser.userId}
              name={data.currentUser.fullName}
              imageUrl={data.currentUser.profileImageUrl}
              size="sm"
              shape="square"
            />
            <div className="text-start">
              <p className="text-sm font-semibold text-[#2b415e]">{data.currentUser.fullName}</p>
              <p className="text-xs text-[#64748b]">
                {t("youRank", { rank: data.currentUser.rank })}
              </p>
            </div>
          </div>
          <span className="rounded-full bg-[#dbe3f3] px-2 py-0.5 text-xs font-bold text-[#2b415e]">
            {new Intl.NumberFormat(locale.startsWith("ar") ? "ar" : "en").format(
              data.currentUser.currentPoints,
            )}
          </span>
        </div>
      ) : null}
    </section>
  );
}
