"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { FLASHCARDS_STATION_ASSETS } from "./flashcards-station.assets";
import type { FlashcardsStationHeaderContext } from "@/modules/student/domain/flashcards-station/flashcards-station.types";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { cn } from "@/shared/application/lib/cn";

type FlashcardsStationHeaderProps = {
  header: FlashcardsStationHeaderContext;
  courseId?: string | null;
  pathId?: string | null;
  className?: string;
};

export function FlashcardsStationHeader({
  header,
  courseId,
  pathId,
  className,
}: FlashcardsStationHeaderProps) {
  const t = useTranslations("student.dashboard.flashcardsStation");
  const router = useRouter();

  const progress = Math.min(100, Math.max(0, header.pathProgressPercent));

  const handleClose = () => {
    const params = new URLSearchParams();
    if (courseId) params.set("courseId", courseId);
    if (pathId) params.set("pathId", pathId);
    const qs = params.toString();
    router.push(
      qs ? `${ROUTES.USER.STUDENT.JOURNEY}?${qs}` : ROUTES.USER.STUDENT.JOURNEY,
    );
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-20 w-full border-b-2 border-[#e2e8f0] bg-white px-4 py-3 md:px-8",
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between gap-4">
        <div className="flex min-w-0 flex-1 items-center gap-3 md:gap-4">
          <button
            type="button"
            onClick={handleClose}
            aria-label={t("header.close")}
            className="inline-flex size-[28px] shrink-0 items-center justify-center rounded-full text-[#64748b] transition hover:bg-[#f1f5f9]"
          >
            <Image
              src={FLASHCARDS_STATION_ASSETS.close}
              alt=""
              width={18}
              height={18}
              className="size-[18px]"
              unoptimized
            />
          </button>

          <div className="h-4 min-w-0 flex-1 overflow-hidden rounded-full bg-[#e2e8f0] md:max-w-[420px]">
            <div
              className="relative h-full rounded-full bg-[#58cc02] transition-all duration-300"
              style={{ width: `${progress}%` }}
            >
              <span className="absolute inset-x-1 top-0 h-[6px] rounded-full bg-white/20" />
            </div>
          </div>

          <span className="shrink-0 text-sm font-bold text-[#64748b]">
            {Math.round(progress)}%
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-3 md:gap-6">
          <div className="hidden text-end sm:block">
            <p className="text-sm font-bold text-[#2b415e] md:text-lg">
              {header.stationTitle || t("header.fallbackTitle")}
            </p>
            <p className="text-xs text-[#94a3b8]">
              {header.learningPathTitle || t("header.journey")}
            </p>
          </div>

          <div className="relative size-[52px] md:size-[62px]">
            <div className="flex size-full items-center justify-center overflow-hidden rounded-full border-4 border-[rgba(199,175,109,0.3)] bg-white p-1">
              {header.avatarUrl ? (
                <Image
                  src={header.avatarUrl}
                  alt=""
                  width={84}
                  height={84}
                  className="size-full rounded-full object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex size-full items-center justify-center rounded-full bg-[#e2e8f0] text-sm font-bold text-[#64748b]">
                  LV
                </div>
              )}
            </div>
            <span className="absolute -bottom-1 -end-1 rounded-full border-2 border-white bg-[#ffc800] px-2 py-0.5 text-[10px] font-bold text-[#0f172a]">
              {t("header.level", { level: header.currentLevel })}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
