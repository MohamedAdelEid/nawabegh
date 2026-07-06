"use client";

import Image from "next/image";
import { cn } from "@/shared/application/lib/cn";
import type { FriendChallengeOpponent } from "@/modules/student/domain/friend-challenge/friend-challenge.types";

type FriendChallengeAvatarProps = {
  opponent: Pick<FriendChallengeOpponent, "fullName" | "profileImageUrl">;
  size?: "sm" | "md" | "lg";
  ringClassName?: string;
  badge?: string;
  badgeClassName?: string;
};

const sizeMap = {
  sm: "size-12",
  md: "size-24",
  lg: "size-32",
};

export function FriendChallengeAvatar({
  opponent,
  size = "md",
  ringClassName,
  badge,
  badgeClassName,
}: FriendChallengeAvatarProps) {
  const initials = opponent.fullName
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("");

  return (
    <div className="relative inline-flex">
      <div
        className={cn(
          "overflow-hidden rounded-full bg-gradient-to-b p-1 shadow-[0_8px_0_rgba(0,0,0,0.05)]",
          sizeMap[size],
          ringClassName ?? "from-[#2b415e] to-[#dbe3f3]",
        )}
      >
        <div className="relative size-full overflow-hidden rounded-full bg-white">
          {opponent.profileImageUrl ? (
            <Image
              src={opponent.profileImageUrl}
              alt={opponent.fullName}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <span className="flex size-full items-center justify-center text-lg font-bold text-[#2b415e]">
              {initials}
            </span>
          )}
        </div>
      </div>
      {badge ? (
        <span
          className={cn(
            "absolute -top-2 start-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold text-white shadow-md",
            badgeClassName ?? "bg-[#2b415e]",
          )}
        >
          {badge}
        </span>
      ) : null}
    </div>
  );
}
