"use client";

import Image from "next/image";
import { Users } from "lucide-react";
import { cn } from "@/shared/application/lib/cn";
import { resolveFileUrl } from "@/shared/infrastructure/files/fileUrl";

type SchoolTeamAvatarProps = {
  name: string;
  logoUrl?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClass = {
  sm: "size-10 text-xs",
  md: "size-14 text-sm",
  lg: "size-16 text-base",
} as const;

/**
 * Team logo with a neutral icon fallback (not person-style single-letter initials).
 */
export function SchoolTeamAvatar({
  name,
  logoUrl,
  size = "md",
  className,
}: SchoolTeamAvatarProps) {
  const src = resolveFileUrl(logoUrl);

  return (
    <div
      className={cn(
        "relative mx-auto flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#e8eef7] text-[#1e3a5f]",
        sizeClass[size],
        className,
      )}
      title={name}
      aria-label={name}
    >
      {src ? (
        <Image src={src} alt={name} fill className="object-cover" unoptimized />
      ) : (
        <Users className="size-[45%]" aria-hidden />
      )}
    </div>
  );
}
