"use client";

import { useEffect, useMemo, useRef } from "react";
import { useQueries } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { progressQueryKeys } from "@/modules/student/application/constants/progressQueryKeys";
import {
  StudentPathProgressStatus,
  StudentStationProgressStatus,
} from "@/modules/student/domain/progress/progress.enums";
import { buildProgressTimelineNodes } from "@/modules/student/domain/progress/progress.utils";
import type {
  CoursePathProgressDto,
  MilestoneBoxDto,
  PathStationProgressDto,
} from "@/modules/student/domain/progress/progress.types";
import { getLearningPathStationsProgress } from "@/modules/student/infrastructure/api/progress.api";
import { ProgressPathBanner } from "./ProgressPathBanner";
import { ProgressPathTimeline } from "./ProgressPathTimeline";
import { ApiFailureAlert } from "@/shared/presentation/components/ui/ApiFailureAlert";

export function journeyPathSectionId(pathId: string) {
  return `journey-path-${pathId}`;
}

/** Matches `scroll-mt-28` so the path banner clears sticky chrome. */
const JOURNEY_PATH_SCROLL_OFFSET_PX = 112;

let cancelJourneyPathScroll: (() => void) | null = null;

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

type ScrollToJourneyPathOptions = {
  onDone?: () => void;
};

/** Programmatically scroll to a path section (used by path tabs). */
export function scrollToJourneyPath(
  pathId: string,
  options?: ScrollToJourneyPathOptions,
) {
  cancelJourneyPathScroll?.();
  cancelJourneyPathScroll = null;

  const el = document.getElementById(journeyPathSectionId(pathId));
  if (!el) {
    options?.onDone?.();
    return;
  }

  const targetY = Math.max(
    0,
    el.getBoundingClientRect().top + window.scrollY - JOURNEY_PATH_SCROLL_OFFSET_PX,
  );
  const startY = window.scrollY;
  const distance = targetY - startY;

  if (Math.abs(distance) < 2) {
    options?.onDone?.();
    return;
  }

  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReduced) {
    window.scrollTo(0, targetY);
    options?.onDone?.();
    return;
  }

  const durationMs = Math.min(850, Math.max(380, Math.abs(distance) * 0.42));
  const startedAt = performance.now();
  let rafId = 0;
  let settled = false;

  const finish = () => {
    if (settled) return;
    settled = true;
    cancelJourneyPathScroll = null;
    options?.onDone?.();
  };

  const step = (now: number) => {
    const progress = Math.min(1, (now - startedAt) / durationMs);
    window.scrollTo(0, startY + distance * easeInOutCubic(progress));
    if (progress < 1) {
      rafId = requestAnimationFrame(step);
      return;
    }
    finish();
  };

  // Cancel only stops the animation — do not fire onDone (a newer scroll owns the lock).
  cancelJourneyPathScroll = () => {
    cancelAnimationFrame(rafId);
    settled = true;
    cancelJourneyPathScroll = null;
  };

  rafId = requestAnimationFrame(step);
}

type JourneyPathsStackProps = {
  paths: CoursePathProgressDto[];
  /** Fallback titles from dropdown when progress list is thin. */
  pathLabels?: Array<{ id: string; label: string }>;
  activePathId: string | null;
  onActivePathChange?: (pathId: string) => void;
  onStationSelect: (station: PathStationProgressDto, pathId: string) => void;
  onChestOpen: (milestone: MilestoneBoxDto, pathId: string) => void;
  openingMilestoneOrder: number | null;
  openingPathId: string | null;
  openMilestoneError: string | null;
};

export function JourneyPathsStack({
  paths,
  pathLabels = [],
  activePathId,
  onActivePathChange,
  onStationSelect,
  onChestOpen,
  openingMilestoneOrder,
  openingPathId,
  openMilestoneError,
}: JourneyPathsStackProps) {
  const t = useTranslations("student.dashboard.progressPath");
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());

  const orderedPaths = useMemo(() => {
    if (paths.length > 0) return paths;

    return pathLabels.map(
      (item): CoursePathProgressDto => ({
        pathId: item.id,
        pathName: item.label,
        pathProgressStatus: StudentPathProgressStatus.Locked,
        completedStations: 0,
        totalStations: 0,
        requiredStations: 0,
        stationProgressPercent: 0,
      }),
    );
  }, [paths, pathLabels]);

  const stationQueries = useQueries({
    queries: orderedPaths.map((path) => ({
      queryKey: progressQueryKeys.pathStations(path.pathId),
      queryFn: () => getLearningPathStationsProgress(path.pathId),
      enabled: Boolean(path.pathId),
      staleTime: 15_000,
    })),
  });

  const queriesReadyKey = stationQueries.map((query) => query.fetchStatus).join("|");

  useEffect(() => {
    if (!onActivePathChange || orderedPaths.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const top = visible[0];
        if (!top?.target.id) return;
        const pathId = top.target.id.replace(/^journey-path-/, "");
        if (pathId) onActivePathChange(pathId);
      },
      {
        root: null,
        rootMargin: "-20% 0px -55% 0px",
        threshold: [0.15, 0.35, 0.55],
      },
    );

    for (const path of orderedPaths) {
      const el = sectionRefs.current.get(path.pathId);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [orderedPaths, onActivePathChange, queriesReadyKey]);

  if (orderedPaths.length === 0) {
    return (
      <div className="px-4 py-10 text-center text-sm text-[#64748b] md:px-6">
        {t("empty.noPaths")}
      </div>
    );
  }

  return (
    <div className="relative z-10 space-y-10 pb-8 pt-4">
      {orderedPaths.map((path, index) => {
        const query = stationQueries[index];
        const stations = query?.data?.stations ?? [];
        const milestones = query?.data?.milestoneBoxes ?? [];
        const title =
          query?.data?.learningPathTitle ||
          path.pathName ||
          pathLabels.find((item) => item.id === path.pathId)?.label ||
          t("banner.defaultPath");
        const pathIndex = index + 1;
        const timelineNodes = buildProgressTimelineNodes(stations, milestones);
        const isOpeningHere =
          openingPathId === path.pathId ? openingMilestoneOrder : null;

        return (
          <section
            key={path.pathId}
            id={journeyPathSectionId(path.pathId)}
            ref={(el) => {
              if (el) sectionRefs.current.set(path.pathId, el);
              else sectionRefs.current.delete(path.pathId);
            }}
            className="scroll-mt-28"
            aria-label={title}
            data-active={activePathId === path.pathId ? "true" : undefined}
          >
            <ProgressPathBanner
              pathTitle={title}
              pathIndex={pathIndex}
              progress={path.stationProgressPercent ?? 0}
            />

            {openMilestoneError && openingPathId === path.pathId ? (
              <div className="px-4 pt-3 md:px-6">
                <ApiFailureAlert
                  message={openMilestoneError}
                  fallbackMessage={t("errors.milestone")}
                />
              </div>
            ) : null}

            <div className="mt-2">
              {query?.isLoading && !query.data ? (
                <PathTimelineSkeleton />
              ) : query?.isError && stations.length === 0 ? (
                <div className="px-4 py-6 md:px-6">
                  <ApiFailureAlert fallbackMessage={t("errors.load")} />
                </div>
              ) : (
                <ProgressPathTimeline
                  nodes={timelineNodes}
                  stations={stations}
                  openingMilestoneOrder={isOpeningHere}
                  onStationSelect={(station) => {
                    if (station.status === StudentStationProgressStatus.Locked) return;
                    onStationSelect(station, path.pathId);
                  }}
                  onChestOpen={(milestone) => {
                    onChestOpen(milestone, path.pathId);
                  }}
                />
              )}
            </div>

            {index < orderedPaths.length - 1 ? (
              <div className="mx-auto mt-8 flex max-w-md items-center gap-3 px-6" aria-hidden>
                <div className="h-px flex-1 bg-gradient-to-l from-[#c7af6d]/60 to-transparent" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c7af6d]">
                  {t("banner.nextPath")}
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-[#c7af6d]/60 to-transparent" />
              </div>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}

function PathTimelineSkeleton() {
  return (
    <div className="relative mx-auto flex max-w-xl flex-col items-center gap-10 py-12">
      {Array.from({ length: 3 }).map((_, index) => (
        <motion.div
          key={index}
          className="size-[135px] rounded-full bg-[#e2e8f0]/80"
          style={{
            alignSelf: index % 2 === 0 ? "flex-start" : "flex-end",
            marginInline: "18%",
          }}
          initial={{ opacity: 0.3 }}
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 1.4, repeat: Infinity, delay: index * 0.2 }}
        />
      ))}
    </div>
  );
}
