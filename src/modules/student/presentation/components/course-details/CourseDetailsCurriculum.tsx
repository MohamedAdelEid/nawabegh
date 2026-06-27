"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, ChevronDown, Lock } from "lucide-react";
import { useTranslations } from "next-intl";
import { StationProgressStatus } from "@/shared/domain/enums/learning-path.enums";
import type { CourseDetailsLearningPathDto } from "@/shared/domain/types/course.types";
import type { CourseDetailsModel } from "@/shared/domain/types/course.types";
import {
  getStationTypeMeta,
  isStationSubscribersOnly,
} from "@/shared/domain/utils/station-type.mapper";
import { cn } from "@/shared/application/lib/cn";
import { DashboardSectionHeader } from "@/shared/presentation/components/dashboard";

type CourseDetailsCurriculumProps = {
  course: CourseDetailsModel;
};

function LearningPathAccordion({
  path,
  index,
  defaultOpen,
}: {
  path: CourseDetailsLearningPathDto;
  index: number;
  defaultOpen: boolean;
}) {
  const t = useTranslations("student.dashboard.courseDetails");
  const [open, setOpen] = useState(defaultOpen);
  const isCompleted =
    path.completedStations >= path.stationsCount && path.stationsCount > 0;
  const isNotStarted = path.completedStations === 0 && path.progressPercent === 0;

  return (
    <article
      className={cn(
        "overflow-hidden rounded-xl border bg-white shadow-[0px_4px_0px_0px_rgba(0,0,0,0.03)]",
        path.isLocked ? "border-[#e2e8f0] opacity-80" : "border-[#e2e8f0]",
      )}
    >
      <button
        type="button"
        onClick={() => !path.isLocked && setOpen((v) => !v)}
        disabled={path.isLocked}
        className="flex w-full items-center justify-between gap-4 p-5 text-right transition-colors hover:bg-[#f8fafc] disabled:cursor-not-allowed"
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold",
              isCompleted
                ? "bg-emerald-50 text-emerald-600"
                : isNotStarted
                  ? "bg-[#f1f5f9] text-[#64748b]"
                  : "bg-[#2b415e] text-white",
            )}
          >
            {isCompleted ? (
              <CheckCircle2 className="size-4" aria-hidden />
            ) : (
              String(index + 1).padStart(2, "0")
            )}
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-base font-bold text-[#2b415e]">{path.title}</h3>
            <p className="text-xs text-[#64748b]">
              {isCompleted
                ? t("curriculum.completed", {
                    completed: path.completedStations,
                    total: path.stationsCount,
                  })
                : isNotStarted
                  ? t("curriculum.notStarted", { count: path.stationsCount })
                  : t("curriculum.inProgress", { value: path.progressPercent })}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {path.isLocked ? <Lock className="size-4 text-[#94a3b8]" aria-hidden /> : null}
          <ChevronDown
            className={cn("size-5 text-[#64748b] transition-transform", open && "rotate-180")}
            aria-hidden
          />
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && !path.isLocked ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden border-t border-[#e2e8f0]"
          >
            <ul className="divide-y divide-[#f1f5f9]">
              {path.stations.map((station) => {
                const meta = getStationTypeMeta(station.stationType);
                const StationIcon = meta.icon;
                const isStationCompleted =
                  station.progressStatus === StationProgressStatus.Completed;
                const subscribersOnly = isStationSubscribersOnly(station.accessPolicy);

                return (
                  <li
                    key={station.id}
                    className={cn(
                      "flex items-center justify-between gap-3 px-5 py-4",
                      station.isLocked && "opacity-60",
                    )}
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <span
                        className={cn(
                          "flex size-9 shrink-0 items-center justify-center rounded-lg",
                          meta.bgClass,
                          meta.colorClass,
                        )}
                      >
                        {station.isLocked ? (
                          <Lock className="size-4" aria-hidden />
                        ) : (
                          <StationIcon className="size-4" aria-hidden />
                        )}
                      </span>
                      <div className="min-w-0 text-right">
                        <p className="truncate text-sm font-medium text-[#2b415e]">{station.name}</p>
                        <p className="text-xs text-[#64748b]">
                          {t(`stationTypes.${meta.labelKey}`)}
                          {subscribersOnly ? ` • ${t("curriculum.subscribersOnly")}` : ""}
                        </p>
                      </div>
                    </div>
                    {isStationCompleted ? (
                      <span className="shrink-0 text-xs font-medium text-emerald-600">
                        {t("curriculum.watched")}
                      </span>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </article>
  );
}

export function CourseDetailsCurriculum({ course }: CourseDetailsCurriculumProps) {
  const t = useTranslations("student.dashboard.courseDetails");
  const totalStations = course.learningPaths.reduce(
    (sum, path) => sum + path.stationsCount,
    0,
  );

  return (
    <motion.section
      id="course-curriculum"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <DashboardSectionHeader title={t("sections.curriculum")} />
        {course.learningPaths.length > 0 ? (
          <p className="text-sm text-[#64748b]">
            {t("sections.curriculumMeta", {
              paths: course.learningPaths.length,
              stations: totalStations,
            })}
          </p>
        ) : null}
      </div>

      {course.learningPaths.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[#cbd5e1] bg-[#f8fafc] p-6 text-sm text-[#64748b]">
          {t("curriculum.empty")}
        </p>
      ) : (
        <div className="space-y-4">
          {course.learningPaths.map((path, index) => (
            <LearningPathAccordion
              key={path.id}
              path={path}
              index={index}
              defaultOpen={index === 0 && !path.isLocked}
            />
          ))}
        </div>
      )}
    </motion.section>
  );
}
