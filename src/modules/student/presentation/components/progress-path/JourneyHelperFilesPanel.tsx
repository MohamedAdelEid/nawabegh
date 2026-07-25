"use client";

import Link from "next/link";
import { useQueries } from "@tanstack/react-query";
import { FolderOpen } from "lucide-react";
import { useTranslations } from "next-intl";
import { progressQueryKeys } from "@/modules/student/application/constants/progressQueryKeys";
import { getStudentStationHref } from "@/modules/student/domain/progress/getStudentStationHref";
import type { CoursePathProgressDto } from "@/modules/student/domain/progress/progress.types";
import { getLearningPathStationsProgress } from "@/modules/student/infrastructure/api/progress.api";
import { StationType } from "@/shared/domain/enums/learning-path.enums";
import { ApiFailureAlert } from "@/shared/presentation/components/ui/ApiFailureAlert";
import { Button } from "@/shared/presentation/components/ui/button";
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";

type JourneyHelperFilesPanelProps = {
  courseId: string;
  paths: CoursePathProgressDto[];
};

export function JourneyHelperFilesPanel({
  courseId,
  paths,
}: JourneyHelperFilesPanelProps) {
  const t = useTranslations("student.dashboard.progressPath.surfaces.helpFiles");

  const stationQueries = useQueries({
    queries: paths.map((path) => ({
      queryKey: progressQueryKeys.pathStations(path.pathId),
      queryFn: () => getLearningPathStationsProgress(path.pathId),
      enabled: Boolean(path.pathId),
      staleTime: 30_000,
    })),
  });

  const isLoading = stationQueries.some((query) => query.isLoading);
  const hasError = stationQueries.some((query) => query.isError);

  const helperStations: Array<{
    stationId: string;
    stationName: string;
    pathId: string;
    pathName: string;
    href: string | null;
  }> = [];

  paths.forEach((path, index) => {
    const stations = stationQueries[index]?.data?.stations ?? [];
    for (const station of stations) {
      if (station.stationType !== StationType.HelperResource) continue;
      helperStations.push({
        stationId: station.stationId,
        stationName: station.stationName,
        pathId: path.pathId,
        pathName: path.pathName,
        href: getStudentStationHref({
          stationId: station.stationId,
          stationType: station.stationType,
          courseId,
          pathId: path.pathId,
        }),
      });
    }
  });

  if (isLoading) {
    return (
      <div className="grid gap-3 px-4 py-6 sm:grid-cols-2 md:px-6 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-28 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (hasError && helperStations.length === 0) {
    return (
      <div className="space-y-4 px-4 py-6 md:px-6">
        <ApiFailureAlert fallbackMessage={t("error")} />
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            stationQueries.forEach((query) => void query.refetch());
          }}
        >
          {t("retry")}
        </Button>
      </div>
    );
  }

  if (helperStations.length === 0) {
    return (
      <div className="px-4 py-10 md:px-6">
        <div className="rounded-xl border border-dashed border-[#cbd5e1] bg-[#f8fafc] p-8 text-center text-[#64748b]">
          {t("empty")}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-4 py-6 md:px-6">
      <div className="text-start">
        <h2 className="text-xl font-bold text-[#0f172a]">{t("title")}</h2>
        <p className="text-sm text-[#64748b]">{t("subtitle")}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {helperStations.map((station) => {
          const content = (
            <article className="flex h-full items-start gap-3 rounded-2xl border border-[#e2e8f0] bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[rgba(44,66,96,0.1)] text-[#2b415e]">
                <FolderOpen className="size-5" aria-hidden />
              </div>
              <div className="min-w-0 text-start">
                <h3 className="truncate font-bold text-[#0f172a]">{station.stationName}</h3>
                <p className="mt-1 text-xs text-[#64748b]">{station.pathName}</p>
              </div>
            </article>
          );

          if (!station.href) return <div key={station.stationId}>{content}</div>;

          return (
            <Link key={station.stationId} href={station.href} className="block">
              {content}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
