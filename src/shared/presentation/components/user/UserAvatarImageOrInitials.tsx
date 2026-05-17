"use client";

import { useEffect, useState } from "react";
import { getUserDisplayInitials } from "@/shared/application/lib/userDisplayInitials";
import { cn } from "@/shared/application/lib/cn";

export type UserAvatarImageOrInitialsSize = "sm" | "md";

const sizeStyles: Record<UserAvatarImageOrInitialsSize, string> = {
  sm: "h-10 w-10 text-xs",
  md: "h-12 w-12 text-sm",
};

export type UserAvatarImageOrInitialsProps = {
  /** Stable id so a failed image retry resets when the row / URL changes */
  trackKey: string;
  name: string;
  imageUrl: string | null | undefined;
  size?: UserAvatarImageOrInitialsSize;
  /** Extra classes on the circle (e.g. background from role) */
  circleClassName?: string;
};

/**
 * Profile image with lazy load; on error or missing URL shows initials (same pattern as user-management table).
 */
export function UserAvatarImageOrInitials({
  trackKey,
  name,
  imageUrl,
  size = "sm",
  circleClassName,
}: UserAvatarImageOrInitialsProps) {
  const [broken, setBroken] = useState(false);
  const trimmedUrl = typeof imageUrl === "string" ? imageUrl.trim() : "";

  useEffect(() => {
    setBroken(false);
  }, [trackKey, trimmedUrl]);

  const showImg = trimmedUrl.length > 0 && !broken;
  const initials = getUserDisplayInitials(name);

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-full font-bold",
        sizeStyles[size],
        circleClassName,
      )}
    >
      {showImg ? (
        <img
          src={trimmedUrl}
          alt={name}
          className="h-full w-full object-cover"
          loading="lazy"
          onError={() => setBroken(true)}
        />
      ) : (
        initials
      )}
    </div>
  );
}
