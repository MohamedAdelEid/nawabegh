"use client";

import { cn } from "@/shared/application/lib/cn";
import type { CourseManagementRow } from "@/modules/admin/domain/data/courseManagementData";
import { resolveFileUrl } from "@/shared/infrastructure/files/fileUrl";

const toneClasses: Record<CourseManagementRow["coverTone"], string> = {
  blue: "from-[#172A45] via-[#294A6C] to-[#1E3A66]",
  green: "from-emerald-950 via-emerald-800 to-slate-900",
  gold: "from-[#7C5C17] via-[#C9AC55] to-[#F7E7AF]",
  slate: "from-slate-200 via-slate-100 to-slate-300",
};

export function CourseCoverPreview({
  tone,
  label,
  imageUrl,
  className,
}: {
  tone: CourseManagementRow["coverTone"];
  label: string;
  imageUrl?: string | null;
  className?: string;
}) {
  const resolvedImageUrl = resolveFileUrl(imageUrl);

  if (resolvedImageUrl) {
    return (
      <div
        className={cn(
          "relative shrink-0 overflow-hidden rounded-2xl bg-slate-100",
          className,
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- resolved via FileUpload/download API */}
        <img src={resolvedImageUrl} alt="" className="h-full w-full object-cover" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/45 via-transparent to-transparent" />
        <span className="absolute bottom-2 right-2 rounded-lg bg-black/55 px-2 py-1 text-[0.6rem] font-bold tracking-[0.14em] text-white backdrop-blur-sm">
          {label}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br",
        toneClasses[tone],
        className,
      )}
    >
      <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_30%_30%,white_0,transparent_30%),radial-gradient(circle_at_70%_60%,white_0,transparent_24%)]" />
      <span className="relative rounded-lg bg-white/15 px-2 py-1 text-[0.6rem] font-bold tracking-[0.18em] text-white">
        {label}
      </span>
    </div>
  );
}
