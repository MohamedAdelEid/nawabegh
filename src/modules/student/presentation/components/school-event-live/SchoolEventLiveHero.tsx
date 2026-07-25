"use client";

import Image from "next/image";
import { resolveFileUrl } from "@/shared/infrastructure/files/fileUrl";

type SchoolEventLiveHeroProps = {
  title: string;
  description: string;
  seriesLabel?: string | null;
  liveStatusLabel: string;
  isLive: boolean;
  bannerImageUrl?: string | null;
};

export function SchoolEventLiveHero({
  title,
  description,
  seriesLabel,
  liveStatusLabel,
  isLive,
  bannerImageUrl,
}: SchoolEventLiveHeroProps) {
  const banner = resolveFileUrl(bannerImageUrl);

  return (
    <section className="relative min-h-[280px] overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-900 shadow-sm">
      {banner ? (
        <Image
          src={banner}
          alt={title}
          fill
          className="object-cover"
          sizes="100vw"
          unoptimized
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#1e3a5f] to-[#163049]" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/90 via-[#0f172a]/45 to-transparent" />

      <div className="relative flex min-h-[280px] flex-col items-start justify-end gap-2 p-6 text-start md:p-8">
        <div className="flex flex-wrap items-center gap-2">
          {isLive ? (
            <span className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white">
              {liveStatusLabel}
            </span>
          ) : null}
          {seriesLabel ? (
            <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
              {seriesLabel}
            </span>
          ) : null}
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">{title}</h2>
        {description ? (
          <p className="max-w-2xl text-base leading-7 text-white/80 md:text-lg">
            {description}
          </p>
        ) : null}
      </div>
    </section>
  );
}
