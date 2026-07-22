"use client";

import Link from "next/link";
import { CheckCircle2, ChevronLeft, ChevronRight, Circle, PlayCircle, Radio } from "lucide-react";
import { useTranslations } from "next-intl";
import { useParentCourseJourney } from "@/modules/parent/application/hooks/useParentLearning";
import { getLearningPathStatusTone } from "@/modules/parent/application/lib/parentChildren.utils";
import { clampPercent, formatPercent } from "@/modules/parent/application/lib/parentHome.utils";
import { ParentProgressRing } from "@/modules/parent/presentation/components/home/ParentProgressRing";
import type { ParentJourneyStation } from "@/modules/parent/domain/types/parentLearning.types";
import { useDirection } from "@/shared/application/hooks/useDirection";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { Button } from "@/shared/presentation/components/ui/button";
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";
import { cn } from "@/shared/application/lib/cn";

function StationRow({
  station,
  studentUserId,
}: {
  station: ParentJourneyStation;
  studentUserId: string;
}) {
  const t = useTranslations("parent.dashboard.learning");
  const { isRtl } = useDirection();
  const tone = getLearningPathStatusTone(station.status);
  const isCompleted = station.status === "completed";
  const ChevronIcon = isRtl ? ChevronLeft : ChevronRight;

  return (
    <Link
      href={ROUTES.USER.PARENT.CHILD_STATION(studentUserId, station.stationId)}
      className="flex items-center gap-3 rounded-xl border border-[#eef2f6] bg-white px-4 py-3.5 transition hover:border-[#dbe3f3] hover:shadow-[0px_4px_0px_rgba(0,0,0,0.04)]"
    >
      <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-full", tone.badge)}>
        {isCompleted ? (
          <CheckCircle2 className="size-4.5" aria-hidden />
        ) : (
          <Circle className="size-4.5" aria-hidden />
        )}
      </span>
      <div className="min-w-0 flex-1 text-start">
        <p className="truncate text-sm font-bold text-[#0f172a]">{station.name}</p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-[#94a3b8]">{station.stationType}</span>
          {station.hasRecording ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#e8f0ff] px-2 py-0.5 text-[10px] font-bold text-[#2b415e]">
              <PlayCircle className="size-3" aria-hidden />
              {t("journeyStationHasRecording")}
            </span>
          ) : null}
          {station.hasQuiz ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#f4ecd8] px-2 py-0.5 text-[10px] font-bold text-[#a38f5a]">
              <Radio className="size-3" aria-hidden />
              {t("journeyStationHasQuiz")}
            </span>
          ) : null}
        </div>
      </div>
      {station.progressPercent != null ? (
        <span className="shrink-0 text-xs font-bold text-[#2b415e]">
          {formatPercent(clampPercent(station.progressPercent))}
        </span>
      ) : null}
      <ChevronIcon className="size-4 shrink-0 text-[#94a3b8]" aria-hidden />
    </Link>
  );
}

export function ParentCourseJourneyDashboard({
  studentUserId,
  courseId,
}: {
  studentUserId: string;
  courseId: string;
}) {
  const t = useTranslations("parent.dashboard.learning");
  const tCommon = useTranslations("parent.dashboard.common");
  const journeyQuery = useParentCourseJourney(studentUserId, courseId);

  if (journeyQuery.isLoading) {
    return (
      <div className="mx-auto flex w-full flex-col gap-8 pb-8">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-24 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (journeyQuery.isError || !journeyQuery.data) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-[20px] border border-red-100 bg-white p-6">
        <p className="text-sm text-red-600">{tCommon("error")}</p>
        <Button type="button" onClick={() => journeyQuery.refetch()}>
          {tCommon("retry")}
        </Button>
      </div>
    );
  }

  const { courseTitle, progressPercent, paths } = journeyQuery.data;

  return (
    <div className="mx-auto flex w-full flex-col gap-8 pb-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <Button
          asChild
          variant="outline"
          className="order-2 h-11 rounded-xl border-[#e2e8f0] bg-[#f8f9fa] px-5 text-sm font-bold text-[#2b415e] sm:order-1"
        >
          <Link href={ROUTES.USER.PARENT.CHILD_COURSES(studentUserId)}>
            {t("backToCourses")}
          </Link>
        </Button>
        <div className="order-1 text-end sm:order-2">
          <p className="mb-1 text-sm text-[#94a3b8]">{t("breadcrumbJourney")}</p>
          <h1 className="text-2xl font-bold text-[#2b415e] md:text-3xl">{courseTitle}</h1>
          <p className="mt-1 text-sm text-[#64748b]">{t("journeyTitle")}</p>
        </div>
      </div>

      <article className="flex flex-col items-center gap-4 rounded-[20px] border border-[#eef2f6] bg-white p-6 shadow-[0px_8px_0px_rgba(0,0,0,0.04)] sm:flex-row sm:justify-between">
        <div className="text-center sm:text-start">
          <h2 className="text-sm font-bold text-[#2b415e]">{t("journeyOverallProgress")}</h2>
          <p className="mt-1 text-xs text-[#64748b]">{courseTitle}</p>
        </div>
        <ParentProgressRing value={progressPercent} size={112} color="#1e88e5">
          <p className="text-xl font-bold text-[#2b415e]">
            {formatPercent(clampPercent(progressPercent))}
          </p>
        </ParentProgressRing>
      </article>

      {paths.length === 0 ? (
        <p className="rounded-2xl bg-white p-10 text-center text-[#64748b] shadow-[0px_8px_0px_rgba(0,0,0,0.04)]">
          {t("journeyEmpty")}
        </p>
      ) : (
        <div className="space-y-8">
          {paths.map((path) => (
            <section key={path.learningPathId} className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-bold text-[#2b415e]">{path.title}</h2>
              </div>
              <div className="space-y-2.5">
                {path.stations.map((station) => (
                  <StationRow
                    key={station.stationId}
                    station={station}
                    studentUserId={studentUserId}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
