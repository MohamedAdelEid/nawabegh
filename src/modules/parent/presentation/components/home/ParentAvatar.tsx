"use client";

import { UserRound } from "lucide-react";
import { resolveFileUrl } from "@/shared/infrastructure/files/fileUrl";
import { cn } from "@/shared/application/lib/cn";

export function ParentAvatar({
  url,
  name,
  className,
  roundedClassName = "rounded-[20px]",
}: {
  url: string | null | undefined;
  name: string;
  className?: string;
  roundedClassName?: string;
}) {
  const resolvedUrl = resolveFileUrl(url ?? null);

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden border border-slate-200 bg-slate-50",
        roundedClassName,
        className,
      )}
    >
      {resolvedUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={resolvedUrl} alt={name} className="size-full object-cover" />
      ) : (
        <UserRound className="size-1/3 text-slate-300" aria-hidden />
      )}
    </div>
  );
}
