"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Compass } from "lucide-react";
import type {
  MilestoneBoxDto,
  PathStationProgressDto,
} from "@/modules/student/domain/progress/progress.types";
import { getStudentStationHref } from "@/modules/student/domain/progress/getStudentStationHref";
import { useProgressPath } from "@/modules/student/application/hooks/useProgressPath";
import { StudentChatConversationView } from "@/modules/student/presentation/components/chat-groups/StudentChatConversationView";
import { ProgressPathSkeleton } from "./ProgressPathSkeleton";
import { ProgressPathTabs } from "./ProgressPathTabs";
import { JourneyAchievementModal } from "./JourneyAchievementModal";
import {
  JourneySurfaceTabs,
  type JourneySurfaceId,
} from "./JourneySurfaceTabs";
import { JourneyInteractiveBookPanel } from "./JourneyInteractiveBookPanel";
import { JourneyHelperFilesPanel } from "./JourneyHelperFilesPanel";
import {
  JourneyPathsStack,
  scrollToJourneyPath,
} from "./JourneyPathsStack";
import { JOURNEY_ASSETS } from "./journey.assets";
import { ApiFailureAlert } from "@/shared/presentation/components/ui/ApiFailureAlert";
import { Button } from "@/shared/presentation/components/ui/button";
import { ROUTES } from "@/shared/infrastructure/config/routes";

const SURFACE_IDS: JourneySurfaceId[] = [
  "journey",
  "interactiveBook",
  "helpFiles",
  "chat",
];

function parseSurface(value: string | null): JourneySurfaceId {
  if (value && (SURFACE_IDS as string[]).includes(value)) {
    return value as JourneySurfaceId;
  }
  return "journey";
}

export function ProgressPathDashboard() {
  const t = useTranslations("student.dashboard.progressPath");
  const router = useRouter();
  const searchParams = useSearchParams();
  const scrollingToPathRef = useRef(false);
  /** Skip the pathId effect scroll when a tab click already scrolled. */
  const skipPathIdScrollEffectRef = useRef(false);
  const pathScrollGenerationRef = useRef(0);

  const courseId = searchParams.get("courseId");
  const pathId = searchParams.get("pathId");
  const isDemo = searchParams.get("demo") === "1";
  const celebrate = searchParams.get("celebrate");
  const activeSurface = parseSurface(searchParams.get("tab"));

  const withDemo = (params: URLSearchParams) => {
    if (isDemo) params.set("demo", "1");
    return params;
  };

  const requireAccount = () => {
    if (typeof window === "undefined") return;
    window.parent?.postMessage(
      { type: "nawabegh:require-account" },
      window.location.origin,
    );
  };

  const {
    dashboardQuery,
    courseProgressQuery,
    pathDropdownQuery,
    activeCourseId,
    activePathId,
    activeCourse,
    refreshAll,
    isInitializing,
    openMilestone,
    isOpeningMilestone,
    openingMilestoneOrder,
    openingPathId,
    openMilestoneError,
    completionNotice,
    clearCompletionNotice,
    showDemoCompletion,
  } = useProgressPath({ courseId, pathId });

  useEffect(() => {
    if (celebrate === "1" || celebrate === "station") {
      showDemoCompletion("station");
    } else if (celebrate === "path") {
      showDemoCompletion("path");
    }
  }, [celebrate, showDemoCompletion]);

  const courseTabs = useMemo(
    () =>
      (dashboardQuery.data?.courses ?? []).map((course) => ({
        id: course.courseId,
        label: course.title,
      })),
    [dashboardQuery.data?.courses],
  );

  const pathTabs = useMemo(() => {
    const dropdown = pathDropdownQuery.data ?? [];
    if (dropdown.length > 0) {
      return dropdown.map((path) => ({ id: path.id, label: path.name }));
    }
    return (courseProgressQuery.data?.paths ?? []).map((path) => ({
      id: path.pathId,
      label: path.pathName,
    }));
  }, [pathDropdownQuery.data, courseProgressQuery.data?.paths]);

  const pushJourneyParams = useCallback(
    (
      next: {
        courseId?: string | null;
        pathId?: string | null;
        tab?: JourneySurfaceId;
      },
      mode: "push" | "replace" = "push",
    ) => {
      const params = new URLSearchParams();
      const nextCourseId =
        next.courseId !== undefined ? next.courseId : activeCourseId;
      const nextPathId = next.pathId !== undefined ? next.pathId : activePathId;
      const nextTab = next.tab ?? activeSurface;

      if (nextCourseId) params.set("courseId", nextCourseId);
      if (nextPathId) params.set("pathId", nextPathId);
      if (nextTab && nextTab !== "journey") params.set("tab", nextTab);

      const href = `${ROUTES.USER.STUDENT.JOURNEY}?${withDemo(params).toString()}`;
      if (mode === "replace") router.replace(href);
      else router.push(href);
    },
    [activeCourseId, activePathId, activeSurface, isDemo, router],
  );

  const handleSurfaceChange = (nextSurface: JourneySurfaceId) => {
    pushJourneyParams({ tab: nextSurface });
  };

  const handleCourseChange = (nextCourseId: string) => {
    if (nextCourseId === activeCourseId) return;
    pushJourneyParams({
      courseId: nextCourseId,
      pathId: null,
      tab: activeSurface,
    });
  };

  const handlePathChange = (nextPathId: string) => {
    const generation = ++pathScrollGenerationRef.current;
    scrollingToPathRef.current = true;
    skipPathIdScrollEffectRef.current = true;

    if (nextPathId !== activePathId) {
      // replace avoids a full navigation churn mid-scroll
      pushJourneyParams({ pathId: nextPathId, tab: "journey" }, "replace");
    }

    requestAnimationFrame(() => {
      scrollToJourneyPath(nextPathId, {
        onDone: () => {
          if (pathScrollGenerationRef.current === generation) {
            scrollingToPathRef.current = false;
          }
        },
      });
    });
  };

  const handleActivePathFromScroll = useCallback(
    (nextPathId: string) => {
      if (scrollingToPathRef.current) return;
      if (!nextPathId || nextPathId === activePathId) return;
      pushJourneyParams({ pathId: nextPathId, tab: "journey" }, "replace");
    },
    [activePathId, pushJourneyParams],
  );

  useEffect(() => {
    if (activeSurface !== "journey" || !pathId) return;
    if (skipPathIdScrollEffectRef.current) {
      skipPathIdScrollEffectRef.current = false;
      return;
    }

    const generation = ++pathScrollGenerationRef.current;
    scrollingToPathRef.current = true;
    const timer = window.setTimeout(() => {
      scrollToJourneyPath(pathId, {
        onDone: () => {
          if (pathScrollGenerationRef.current === generation) {
            scrollingToPathRef.current = false;
          }
        },
      });
    }, 80);

    return () => {
      window.clearTimeout(timer);
      if (pathScrollGenerationRef.current === generation) {
        scrollingToPathRef.current = false;
      }
    };
  }, [activeSurface, pathId, activeCourseId]);

  const handleStationSelect = (
    station: PathStationProgressDto,
    stationPathId: string,
  ) => {
    if (isDemo) {
      requireAccount();
      return;
    }

    const href = getStudentStationHref({
      stationId: station.stationId,
      stationType: station.stationType,
      courseId: activeCourseId,
      pathId: stationPathId,
    });
    if (href) router.push(href);
  };

  const handleChestOpen = async (
    milestone: MilestoneBoxDto,
    stationPathId: string,
  ) => {
    if (isDemo) {
      requireAccount();
      return;
    }
    try {
      await openMilestone({
        learningPathId: stationPathId,
        milestoneOrder: milestone.order,
        pointsReward: milestone.pointsReward,
      });
    } catch {
      // Error surfaced via openMilestoneError
    }
  };

  const selectNextPath = () => {
    clearCompletionNotice();
    if (!activePathId || pathTabs.length === 0) return;
    const idx = pathTabs.findIndex((tab) => tab.id === activePathId);
    const next = pathTabs[idx + 1] ?? pathTabs[0];
    if (next && next.id !== activePathId) {
      handlePathChange(next.id);
    }
  };

  const isLoading =
    dashboardQuery.isLoading ||
    (Boolean(activeCourseId) &&
      activeSurface === "journey" &&
      courseProgressQuery.isLoading);

  const errorMessage =
    (dashboardQuery.error instanceof Error ? dashboardQuery.error.message : null) ||
    (courseProgressQuery.error instanceof Error
      ? courseProgressQuery.error.message
      : null);

  if (isLoading && !dashboardQuery.data) {
    return <ProgressPathSkeleton />;
  }

  if (errorMessage && !dashboardQuery.data?.courses.length) {
    return (
      <div className="space-y-4 p-4">
        <ApiFailureAlert message={errorMessage} fallbackMessage={t("errors.load")} />
        <Button type="button" variant="outline" onClick={() => void refreshAll()}>
          {t("errors.retry")}
        </Button>
      </div>
    );
  }

  if (!dashboardQuery.data?.courses.length) {
    return (
      <div className="rounded-xl border border-dashed border-[#cbd5e1] bg-[#f8fafc] p-8 text-center">
        <p className="mb-4 text-[#64748b]">{t("empty.noCourses")}</p>
        <Button asChild>
          <a href={ROUTES.USER.STUDENT.COURSES}>{t("empty.exploreCourses")}</a>
        </Button>
      </div>
    );
  }

  const surfaceLabels: Record<JourneySurfaceId, string> = {
    journey: t("surfaces.journey"),
    interactiveBook: t("surfaces.interactiveBook.label"),
    helpFiles: t("surfaces.helpFiles.label"),
    chat: t("surfaces.chat"),
  };

  return (
    <div className="relative space-y-0 pb-10">
      <div
        className="pointer-events-none absolute inset-0 -z-0 bg-[#f6f8fb]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 -z-0 opacity-[0.05]"
        style={{
          backgroundImage: `url('${JOURNEY_ASSETS.background}')`,
          backgroundRepeat: "repeat",
          backgroundSize: "640px auto",
        }}
        aria-hidden
      />

      <PathHeader
        courseTitle={activeCourse?.title ?? t("page.title")}
        subtitle={t("page.subtitle")}
        studentName={dashboardQuery.data.studentName}
        enrolledBadge={t("page.enrolledBadge")}
      />

      <div className="relative z-10 space-y-3 px-0 pt-4">
        <JourneySurfaceTabs
          activeId={activeSurface}
          onChange={handleSurfaceChange}
          labels={surfaceLabels}
          ariaLabel={t("surfaces.aria")}
        />

        <ProgressPathTabs
          items={courseTabs}
          activeId={activeCourseId}
          onChange={handleCourseChange}
          variant="course"
          ariaLabel={t("tabs.courses")}
          isLoading={isInitializing}
          trailingAction={
            <Link
              href={ROUTES.USER.STUDENT.COURSES}
              className="inline-flex h-14 shrink-0 items-center gap-2 rounded-xl border border-dashed border-[#c7af6d] bg-[#fffbeb] px-4 text-sm font-semibold text-[#92400e] transition-colors hover:bg-[#fef3c7]"
            >
              <Compass className="size-4 shrink-0" aria-hidden />
              <span className="whitespace-nowrap">{t("tabs.exploreMore")}</span>
            </Link>
          }
        />

        {activeSurface === "journey" ? (
          pathTabs.length > 0 ? (
            <ProgressPathTabs
              items={pathTabs}
              activeId={activePathId}
              onChange={handlePathChange}
              variant="path"
              ariaLabel={t("tabs.paths")}
              isLoading={courseProgressQuery.isLoading || pathDropdownQuery.isLoading}
            />
          ) : courseProgressQuery.isLoading ? (
            <div className="mx-4 h-14 animate-pulse rounded-xl bg-[#e2e8f0] md:mx-6" />
          ) : null
        ) : null}
      </div>

      {activeSurface === "journey" ? (
        <JourneyPathsStack
          paths={courseProgressQuery.data?.paths ?? []}
          pathLabels={pathTabs}
          activePathId={activePathId}
          onActivePathChange={handleActivePathFromScroll}
          onStationSelect={handleStationSelect}
          onChestOpen={(milestone, stationPathId) => {
            void handleChestOpen(milestone, stationPathId);
          }}
          openingMilestoneOrder={isOpeningMilestone ? openingMilestoneOrder : null}
          openingPathId={isOpeningMilestone ? openingPathId : null}
          openMilestoneError={openMilestoneError}
        />
      ) : null}

      {activeSurface === "interactiveBook" && activeCourseId ? (
        <div className="relative z-10">
          <JourneyInteractiveBookPanel
            courseId={activeCourseId}
            courseTitle={activeCourse?.title}
          />
        </div>
      ) : null}

      {activeSurface === "helpFiles" && activeCourseId ? (
        <div className="relative z-10">
          <JourneyHelperFilesPanel
            courseId={activeCourseId}
            paths={courseProgressQuery.data?.paths ?? []}
          />
        </div>
      ) : null}

      {activeSurface === "chat" && activeCourseId ? (
        <div className="relative z-10 px-2 py-4 md:px-4">
          <div className="overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white shadow-sm">
            <StudentChatConversationView courseId={activeCourseId} embedded />
          </div>
        </div>
      ) : null}

      <JourneyAchievementModal
        open={Boolean(completionNotice)}
        notice={completionNotice}
        onOpenChange={(open) => {
          if (!open) clearCompletionNotice();
        }}
        onPrimary={selectNextPath}
        onSecondary={() => {
          clearCompletionNotice();
          router.push(ROUTES.USER.STUDENT.COURSES);
        }}
      />
    </div>
  );
}

function PathHeader({
  courseTitle,
  subtitle,
  studentName,
  enrolledBadge,
}: {
  courseTitle: string;
  subtitle: string;
  studentName: string;
  enrolledBadge: string;
}) {
  return (
    <header className="relative z-10 flex flex-col gap-4 border-b border-[rgba(44,66,96,0.1)] bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div className="flex items-center gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-[rgba(44,66,96,0.1)] md:size-[60px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={JOURNEY_ASSETS.headerBook}
            alt=""
            className="size-5 object-contain md:size-6"
            aria-hidden
          />
        </div>
        <div className="text-start">
          <h1 className="text-xl font-bold text-[#0f172a] md:text-[30px] md:leading-[36px]">
            {courseTitle}
          </h1>
          <p className="text-sm text-[#64748b] md:text-base">{subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center overflow-hidden rounded-full border-2 border-[rgba(199,175,109,0.3)] bg-[#e2e8f0] shadow-sm">
          <span className="text-base">👤</span>
        </div>
        <div className="text-start">
          <p className="text-sm font-bold text-[#1e293b]">{studentName}</p>
          <p className="text-[10px] font-bold uppercase tracking-[0.5px] text-[#c7af6d]">
            {enrolledBadge}
          </p>
        </div>
      </div>
    </header>
  );
}
