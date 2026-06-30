"use client";

import { useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { StudentPathProgressStatus } from "@/modules/student/domain/progress/progress.enums";
import { useProgressPath } from "@/modules/student/application/hooks/useProgressPath";
import { ProgressPathBanner } from "./ProgressPathBanner";
import { ProgressPathSkeleton } from "./ProgressPathSkeleton";
import { ProgressPathTabs } from "./ProgressPathTabs";
import { ProgressPathTimeline } from "./ProgressPathTimeline";
import { JOURNEY_ASSETS } from "./journey.assets";
import type { PathStationProgressDto } from "@/modules/student/domain/progress/progress.types";
import { ApiFailureAlert } from "@/shared/presentation/components/ui/ApiFailureAlert";
import { Button } from "@/shared/presentation/components/ui/button";
import { ROUTES } from "@/shared/infrastructure/config/routes";

export function ProgressPathDashboard() {
  const t = useTranslations("student.dashboard.progressPath");
  const router = useRouter();
  const searchParams = useSearchParams();

  const courseId = searchParams.get("courseId");
  const pathId = searchParams.get("pathId");

  const {
    dashboardQuery,
    courseProgressQuery,
    pathDropdownQuery,
    pathStationsQuery,
    activeCourseId,
    activePathId,
    activeCourse,
    activePathProgress,
    refreshAll,
    selectCourse,
    isInitializing,
  } = useProgressPath({ courseId, pathId });

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

  const pathTitle =
    pathStationsQuery.data?.learningPathTitle ||
    activePathProgress?.pathName ||
    t("banner.defaultPath");

  const pathIndex = useMemo(() => {
    if (!activePathId) return null;
    const allPaths = courseProgressQuery.data?.paths ?? [];
    const idx = allPaths.findIndex((p) => p.pathId === activePathId);
    return idx >= 0 ? idx + 1 : null;
  }, [activePathId, courseProgressQuery.data?.paths]);

  const handleCourseChange = (nextCourseId: string) => {
    if (nextCourseId === activeCourseId) return;
    selectCourse(nextCourseId);
    const params = new URLSearchParams();
    params.set("courseId", nextCourseId);
    router.push(`${ROUTES.USER.STUDENT.JOURNEY}?${params.toString()}`);
  };

  const handlePathChange = (nextPathId: string) => {
    const params = new URLSearchParams();
    if (activeCourseId) params.set("courseId", activeCourseId);
    params.set("pathId", nextPathId);
    router.push(`${ROUTES.USER.STUDENT.JOURNEY}?${params.toString()}`);
  };

  const isPathLocked =
    activePathProgress?.pathProgressStatus === StudentPathProgressStatus.Locked;

  const handleStationSelect = (station: PathStationProgressDto) => {
    if (isPathLocked) return;
    void station;
  };

  useEffect(() => {
    if (!activeCourseId || courseId) return;
    const params = new URLSearchParams();
    params.set("courseId", activeCourseId);
    if (activePathId) params.set("pathId", activePathId);
    router.replace(`${ROUTES.USER.STUDENT.JOURNEY}?${params.toString()}`);
  }, [activeCourseId, activePathId, courseId, router]);

  const isLoading =
    dashboardQuery.isLoading ||
    (Boolean(activeCourseId) && courseProgressQuery.isLoading) ||
    (Boolean(activePathId) && pathStationsQuery.isLoading && !pathStationsQuery.data);

  const errorMessage =
    (dashboardQuery.error instanceof Error ? dashboardQuery.error.message : null) ||
    (courseProgressQuery.error instanceof Error ? courseProgressQuery.error.message : null) ||
    (pathStationsQuery.error instanceof Error ? pathStationsQuery.error.message : null);

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

  return (
    <div className="space-y-0 pb-10">
      <PathHeader
        courseTitle={activeCourse?.title ?? t("page.title")}
        subtitle={t("page.subtitle")}
        studentName={dashboardQuery.data.studentName}
        enrolledBadge={t("page.enrolledBadge")}
      />

      <div className="relative z-10 space-y-3 px-0 pt-4">
        <ProgressPathTabs
          items={courseTabs}
          activeId={activeCourseId}
          onChange={handleCourseChange}
          variant="course"
          ariaLabel={t("tabs.courses")}
          isLoading={isInitializing}
        />

        {pathTabs.length > 0 ? (
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
        ) : null}
      </div>

      <div className="relative z-10 px-0 pt-4">
        {activePathId || activeCourse ? (
          <ProgressPathBanner
            pathTitle={pathTitle}
            pathIndex={pathIndex}
            progress={
              activePathProgress?.stationProgressPercent ??
              activeCourse?.progressPercentage ??
              0
            }
            subjectLabel={activeCourse?.subjectNameAr || activeCourse?.subjectNameEn}
          />
        ) : (
          <div className="mx-4 h-36 animate-pulse rounded-[25px] bg-[#e2e8f0] md:mx-6" />
        )}
      </div>

      {isPathLocked ? (
        <div className="relative z-10 px-4 pt-3 md:px-6">
          <div className="flex items-center gap-2.5 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 text-sm font-medium text-[#64748b]">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
              <Lock className="size-3.5 text-[#64748b]" aria-hidden />
            </span>
            <span>{t("locked.notice")}</span>
          </div>
        </div>
      ) : null}

      <div className="relative z-10 mt-2">
        {pathStationsQuery.isLoading && !pathStationsQuery.data ? (
          <ProgressPathTimelineSkeleton />
        ) : (
          <ProgressPathTimeline
            stations={pathStationsQuery.data?.stations ?? []}
            onStationSelect={handleStationSelect}
            locked={isPathLocked}
          />
        )}
      </div>
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
      <div className="flex items-center gap-3">
        <div className="text-start">
          <p className="text-sm font-bold text-[#1e293b]">{studentName}</p>
          <p className="text-[10px] font-bold uppercase tracking-[0.5px] text-[#c7af6d]">
            {enrolledBadge}
          </p>
        </div>
        <div className="flex size-10 items-center justify-center overflow-hidden rounded-full border-2 border-[rgba(199,175,109,0.3)] bg-[#e2e8f0] shadow-sm">
          <span className="text-base">👤</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-end">
          <h1 className="text-xl font-bold text-[#0f172a] md:text-[30px] md:leading-[36px]">
            {courseTitle}
          </h1>
          <p className="text-sm text-[#64748b] md:text-base">{subtitle}</p>
        </div>
        <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-[rgba(44,66,96,0.1)] md:size-[60px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={JOURNEY_ASSETS.stations.iconPath}
            alt=""
            className="size-5 object-contain md:size-6"
            aria-hidden
          />
        </div>
      </div>
    </header>
  );
}

function ProgressPathTimelineSkeleton() {
  return (
    <div className="relative mx-auto flex max-w-xl flex-col items-center gap-10 py-12">
      {Array.from({ length: 3 }).map((_, index) => (
        <motion.div
          key={index}
          className="size-[135px] rounded-full bg-[#e2e8f0]/80"
          style={{ alignSelf: index % 2 === 0 ? "flex-end" : "flex-start", marginInline: "18%" }}
          initial={{ opacity: 0.3 }}
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 1.4, repeat: Infinity, delay: index * 0.2 }}
        />
      ))}
    </div>
  );
}
