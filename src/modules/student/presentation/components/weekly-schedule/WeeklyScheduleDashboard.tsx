"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useFormatter, useTranslations } from "next-intl";
import { useWeeklySchedule } from "@/modules/student/application/hooks/useWeeklySchedule";
import {
  StudentScheduleActionType,
} from "@/modules/student/domain/weekly-schedule/weekly-schedule.enums";
import type { WeeklyScheduleItemDto } from "@/modules/student/domain/weekly-schedule/weekly-schedule.types";
import { WeeklyScheduleDayColumn } from "./WeeklyScheduleDayColumn";
import { WeeklyScheduleNextSessionCard } from "./WeeklyScheduleNextSessionCard";
import { WeeklyScheduleSkeleton } from "./WeeklyScheduleSkeleton";
import { WeeklyScheduleStatsCard } from "./WeeklyScheduleStatsCard";
import { ApiFailureAlert } from "@/shared/presentation/components/ui/ApiFailureAlert";
import { Button } from "@/shared/presentation/components/ui/button";
import { ROUTES } from "@/shared/infrastructure/config/routes";

export function WeeklyScheduleDashboard() {
  const t = useTranslations("student.dashboard.weeklySchedule");
  const formatter = useFormatter();
  const router = useRouter();

  const {
    scheduleQuery,
    weekStart,
    isCurrentWeek,
    goToPreviousWeek,
    goToNextWeek,
    goToCurrentWeek,
    refresh,
    isLoading,
    errorMessage,
  } = useWeeklySchedule();

  const data = scheduleQuery.data;

  const navigateToStation = (item: WeeklyScheduleItemDto) => {
    const search = new URLSearchParams({ courseId: item.courseId });
    if (item.learningPathId) search.set("pathId", item.learningPathId);
    if (item.stationId) search.set("stationId", item.stationId);
    router.push(`${ROUTES.USER.STUDENT.JOURNEY}?${search.toString()}`);
  };

  const handleItemAction = async (item: WeeklyScheduleItemDto) => {
    if (item.actionType === StudentScheduleActionType.ViewDetails) {
      navigateToStation(item);
      return;
    }

    if (item.actionType === StudentScheduleActionType.Disabled || !item.canEnter) {
      return;
    }

    if (item.actionType === StudentScheduleActionType.EnterLive) {
      const params = new URLSearchParams();
      if (item.courseId) params.set("courseId", item.courseId);
      if (item.learningPathId) params.set("pathId", item.learningPathId);
      const query = params.toString();
      router.push(
        query
          ? `${ROUTES.USER.STUDENT.LIVE_STATION(item.stationId)}?${query}`
          : ROUTES.USER.STUDENT.LIVE_STATION(item.stationId),
      );
      return;
    }

    navigateToStation(item);
  };

  const weekLabel = (() => {
    if (!data?.weekStart || !data?.weekEndExclusive) return "";
    try {
      const start = formatter.dateTime(new Date(`${data.weekStart}T12:00:00`), {
        month: "short",
        day: "numeric",
      });
      const endDate = new Date(`${data.weekEndExclusive}T12:00:00`);
      endDate.setDate(endDate.getDate() - 1);
      const end = formatter.dateTime(endDate, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      return t("weekRange", { start, end });
    } catch {
      return "";
    }
  })();

  if (isLoading && !data) {
    return <WeeklyScheduleSkeleton />;
  }

  if (errorMessage && !data) {
    return (
      <div className="space-y-4">
        <ApiFailureAlert message={errorMessage} fallbackMessage={t("errors.load")} />
        <Button type="button" variant="outline" onClick={() => void refresh()}>
          {t("errors.retry")}
        </Button>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-8 pb-10" dir="rtl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-start text-2xl font-bold text-[#2b415e]">{t("page.title")}</h1>
          {weekLabel ? <p className="text-start text-sm text-[#64748b]">{weekLabel}</p> : null}
        </div>

        <div className="flex items-center gap-2">
          {!isCurrentWeek ? (
            <Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={goToCurrentWeek}>
              {t("navigation.currentWeek")}
            </Button>
          ) : null}
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="rounded-xl"
            aria-label={t("navigation.nextWeek")}
            onClick={goToNextWeek}
          >
            <ChevronRight className="size-4" aria-hidden />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="rounded-xl"
            aria-label={t("navigation.previousWeek")}
            onClick={goToPreviousWeek}
          >
            <ChevronLeft className="size-4" aria-hidden />
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="grid min-w-[840px] grid-cols-5 gap-6">
          {data.days.map((day) => (
            <WeeklyScheduleDayColumn
              key={`${weekStart}-${day.date}`}
              day={day}
              joiningStationId={null}
              onItemAction={(item) => void handleItemAction(item)}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {data.nextSession ? (
          <div className="lg:col-span-1">
            <WeeklyScheduleNextSessionCard nextSession={data.nextSession} />
          </div>
        ) : null}
        <div className={data.nextSession ? "lg:col-span-2" : "lg:col-span-3"}>
          <WeeklyScheduleStatsCard stats={data.stats} />
        </div>
      </div>
    </div>
  );
}
