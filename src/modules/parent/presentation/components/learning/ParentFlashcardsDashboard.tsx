"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Download, Layers, RotateCw } from "lucide-react";
import { useTranslations } from "next-intl";
import { useParentStationDetail } from "@/modules/parent/application/hooks/useParentLearning";
import { useDirection } from "@/shared/application/hooks/useDirection";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { resolveFileUrl } from "@/shared/infrastructure/files/fileUrl";
import { Button } from "@/shared/presentation/components/ui/button";
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";

export function ParentFlashcardsDashboard({
  studentUserId,
  stationId,
}: {
  studentUserId: string;
  stationId: string;
}) {
  const t = useTranslations("parent.dashboard.learning");
  const tCommon = useTranslations("parent.dashboard.common");
  const { isRtl } = useDirection();
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const stationQuery = useParentStationDetail(studentUserId, stationId);

  if (stationQuery.isLoading) {
    return (
      <div className="mx-auto flex w-full flex-col gap-8 pb-8">
        <Skeleton className="h-16 w-96" />
        <Skeleton className="h-80 rounded-[20px]" />
      </div>
    );
  }

  if (stationQuery.isError || !stationQuery.data) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-[20px] border border-red-100 bg-white p-6">
        <p className="text-sm text-red-600">{tCommon("error")}</p>
        <Button type="button" onClick={() => stationQuery.refetch()}>
          {tCommon("retry")}
        </Button>
      </div>
    );
  }

  const station = stationQuery.data;
  const cards = station.attachments ?? [];
  const total = cards.length;
  const current = cards[index] ?? null;
  const coverUrl = current ? resolveFileUrl(current.coverImageUrl ?? null) : null;
  const fileUrl = current ? resolveFileUrl(current.fileUrl ?? null) : null;
  const ChevronPrev = isRtl ? ChevronRight : ChevronLeft;
  const ChevronNext = isRtl ? ChevronLeft : ChevronRight;

  const goTo = (nextIndex: number) => {
    setFlipped(false);
    setIndex(Math.max(0, Math.min(total - 1, nextIndex)));
  };

  return (
    <div className="mx-auto flex w-full flex-col gap-8 pb-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <Button
          asChild
          variant="outline"
          className="order-2 h-11 w-fit rounded-xl border-[#e2e8f0] bg-[#f8f9fa] px-5 text-sm font-bold text-[#2b415e] sm:order-1"
        >
          <Link href={ROUTES.USER.PARENT.CHILD_STATION(studentUserId, stationId)}>
            {t("viewStation")}
          </Link>
        </Button>
        <div className="order-1 text-end sm:order-2">
          <p className="mb-1 text-sm text-[#94a3b8]">{t("breadcrumbStation")}</p>
          <h1 className="text-2xl font-bold text-[#2b415e] md:text-3xl">{t("flashcards")}</h1>
          <p className="mt-1 text-sm text-[#64748b]">{station.title}</p>
        </div>
      </div>

      {total === 0 || !current ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-white p-12 text-center shadow-[0px_8px_0px_rgba(0,0,0,0.04)]">
          <Layers className="size-8 text-[#94a3b8]" aria-hidden />
          <p className="text-[#64748b]">{t("flashcardsEmpty")}</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-5">
          <p className="text-sm font-bold text-[#64748b]">
            {t("flashcardsCounter", { current: index + 1, total })}
          </p>

          <button
            type="button"
            onClick={() => setFlipped((value) => !value)}
            className="group relative h-72 w-full max-w-md [perspective:1200px]"
            aria-label={t("flashcardsFlip")}
          >
            <div
              className="relative size-full rounded-[20px] shadow-[0px_8px_0px_rgba(0,0,0,0.06)] transition-transform duration-500 [transform-style:preserve-3d]"
              style={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-[20px] border border-[#eef2f6] bg-white p-6 [backface-visibility:hidden]">
                {coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={coverUrl}
                    alt={current.title}
                    className="max-h-40 rounded-xl object-contain"
                  />
                ) : (
                  <Layers className="size-12 text-[#1e88e5]" aria-hidden />
                )}
                <p className="line-clamp-2 text-center text-base font-bold text-[#2b415e]">
                  {current.title}
                </p>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#94a3b8]">
                  <RotateCw className="size-3.5" aria-hidden />
                  {t("flashcardsFlip")}
                </span>
              </div>

              <div
                className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-[20px] bg-[#2b415e] p-6 text-center text-white [backface-visibility:hidden]"
                style={{ transform: "rotateY(180deg)" }}
              >
                <p className="text-base font-bold">{current.title}</p>
                {current.fileSizeLabel ? (
                  <p className="text-xs text-white/70">{current.fileSizeLabel}</p>
                ) : null}
                {fileUrl ? (
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(event) => event.stopPropagation()}
                    className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-bold hover:bg-white/15"
                  >
                    <Download className="size-4" aria-hidden />
                    {t("download")}
                  </a>
                ) : null}
              </div>
            </div>
          </button>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={index <= 0}
              onClick={() => goTo(index - 1)}
              className="size-11 rounded-full border-[#e2e8f0] bg-white p-0"
            >
              <ChevronPrev className="size-4" aria-hidden />
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={index >= total - 1}
              onClick={() => goTo(index + 1)}
              className="size-11 rounded-full border-[#e2e8f0] bg-white p-0"
            >
              <ChevronNext className="size-4" aria-hidden />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
