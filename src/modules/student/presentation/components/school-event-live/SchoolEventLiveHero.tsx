"use client";

type SchoolEventLiveHeroProps = {
  title: string;
  description: string;
  seriesLabel: string;
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
  return (
    <section className="relative min-h-[300px] overflow-hidden rounded-2xl border-4 border-white shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1),0px_8px_10px_-6px_rgba(0,0,0,0.1)]">
      {bannerImageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={bannerImageUrl}
          alt=""
          className="absolute inset-0 size-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-[#2b415e]" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(43,65,94,0.85)] via-[rgba(43,65,94,0.35)] to-transparent" />

      <div className="relative flex min-h-[300px] flex-col items-start justify-end gap-2 p-8 text-start">
        <div className="flex flex-wrap items-center gap-3">
          {isLive ? (
            <span className="rounded-full bg-[#58cc02] px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
              {liveStatusLabel}
            </span>
          ) : null}
          <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-[6px]">
            {seriesLabel}
          </span>
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">{title}</h2>
        <p className="max-w-xl text-base leading-7 text-white/80 md:text-lg">{description}</p>
      </div>
    </section>
  );
}
