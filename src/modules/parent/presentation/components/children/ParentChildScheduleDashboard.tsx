"use client";

import { CalendarDays, ChevronLeft, ChevronRight, Trophy } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useParentChildDetails } from "@/modules/parent/application/hooks/useParentChildDetails";
import { useParentChildSchedule } from "@/modules/parent/application/hooks/useParentChildSchedule";
import { StudentScheduleDisplayStatus } from "@/modules/student/domain/weekly-schedule/weekly-schedule.enums";
import type {
  WeeklyScheduleDayDto,
  WeeklyScheduleItemDto,
} from "@/modules/student/domain/weekly-schedule/weekly-schedule.types";
import { notify } from "@/shared/application/lib/toast";
import { Button } from "@/shared/presentation/components/ui/button";
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";
import { cn } from "@/shared/application/lib/cn";

type ViewMode = "month" | "week" | "day";

function SummaryCard({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <article className="relative overflow-hidden rounded-[16px] bg-white p-5 shadow-[0px_8px_0px_rgba(0,0,0,0.05)]">
      <div className={cn("absolute inset-x-0 top-0 h-1.5", accent)} />
      <p className="text-xs font-bold text-[#64748b]">{label}</p>
      <p className="mt-3 text-2xl font-bold text-[#2b415e]">{value}</p>
    </article>
  );
}

function ScheduleItemBadge({ status }: { status: StudentScheduleDisplayStatus }) {
  const t = useTranslations("parent.dashboard.childrenManagement.schedule");
  if (status === StudentScheduleDisplayStatus.LiveNow) {
    return (
      <span className="rounded-full bg-[#2b415e] px-2 py-0.5 text-[10px] font-bold uppercase text-[#dbe3f3]">
        {t("liveNow")}
      </span>
    );
  }
  return null;
}

function ScheduleItemCard({ item }: { item: WeeklyScheduleItemDto }) {
  const isLive = item.displayStatus === StudentScheduleDisplayStatus.LiveNow;
  const isExam = item.displayStatus === StudentScheduleDisplayStatus.Exam;
  const isEnded = item.displayStatus === StudentScheduleDisplayStatus.Ended;

  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-xl bg-white p-4 shadow-[0px_4px_0px_rgba(0,0,0,0.04)]",
        isLive && "border-2 border-[#dbe3f3]",
        isExam && "border-2 border-[rgba(199,175,109,0.4)]",
        isEnded && "opacity-70",
        !isLive && !isExam && "border-2 border-transparent",
      )}
    >
      {(isLive || isExam) && (
        <span
          className={cn("absolute inset-y-0 start-0 w-1", isLive ? "bg-[#2b415e]" : "bg-[#c7af6d]")}
          aria-hidden
        />
      )}
      <div className="mb-2 flex items-center justify-between gap-2">
        <ScheduleItemBadge status={item.displayStatus} />
        <span className="text-[11px] font-medium text-[#64748b]">{item.timeRangeLabel}</span>
      </div>
      <p className="truncate text-sm font-bold text-[#2b415e]">{item.title}</p>
      {item.instructorName ? (
        <p className="mt-0.5 truncate text-xs text-[#94a3b8]">{item.instructorName}</p>
      ) : null}
    </article>
  );
}

function EmptyDayCard() {
  const t = useTranslations("parent.dashboard.childrenManagement.schedule");
  return (
    <div className="flex min-h-[100px] items-center justify-center rounded-xl border-2 border-dashed border-[#e2e8f0] bg-[#f8f9fa] px-3 py-6 text-center text-xs font-bold text-[#94a3b8]">
      {t("emptyDay")}
    </div>
  );
}

function DayColumn({ day }: { day: WeeklyScheduleDayDto }) {
  return (
    <section className="flex min-w-[160px] flex-1 flex-col gap-3">
      <header
        className={cn(
          "rounded-t-xl py-2 text-center text-xs font-bold",
          day.isToday ? "bg-[#2b415e] text-white" : "bg-[#e2e8f0] text-[#2b415e]",
        )}
      >
        <p>{day.dayNameAr}</p>
        <p className="text-[10px] font-medium opacity-80">{day.date}</p>
      </header>
      <div className="flex flex-col gap-3">
        {day.items.length === 0 ? (
          <EmptyDayCard />
        ) : (
          day.items.map((item) => <ScheduleItemCard key={item.id} item={item} />)
        )}
      </div>
    </section>
  );
}

export function ParentChildScheduleDashboard({ studentUserId }: { studentUserId: string }) {
  const t = useTranslations("parent.dashboard.childrenManagement.schedule");
  const tCommon = useTranslations("parent.dashboard.common");
  const [viewMode, setViewMode] = useState<ViewMode>("week");

  const detailsQuery = useParentChildDetails(studentUserId);
  const scheduleQuery = useParentChildSchedule(studentUserId);

  const data = scheduleQuery.data;
  const details = detailsQuery.data;

  const upcomingItems = useMemo(() => {
    if (!data) return [];
    const todayIndex = data.days.findIndex((day) => day.isToday);
    const today = todayIndex >= 0 ? data.days[todayIndex] : null;
    const tomorrow = todayIndex >= 0 ? data.days[todayIndex + 1] : null;
    const items: WeeklyScheduleItemDto[] = [];
    const todayItem = today?.items[0];
    const tomorrowItem = tomorrow?.items[0];
    if (todayItem) items.push(todayItem);
    if (tomorrowItem) items.push(tomorrowItem);
    return items.slice(0, 3);
  }, [data]);

  const isLoading = detailsQuery.isLoading || scheduleQuery.isLoading;
  const isError = detailsQuery.isError || scheduleQuery.isError;

  if (isLoading) {
    return (
      <div className="flex w-full flex-col gap-8">
        <Skeleton className="h-16 w-96" />
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-28 rounded-[16px]" />
          ))}
        </div>
        <Skeleton className="h-[28rem] rounded-[20px]" />
      </div>
    );
  }

  if (isError || !data || !details) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-[20px] border border-red-100 bg-white p-6">
        <p className="text-sm text-red-600">{tCommon("error")}</p>
        <Button
          type="button"
          onClick={() => {
            void detailsQuery.refetch();
            void scheduleQuery.refetch();
          }}
          disabled={detailsQuery.isFetching || scheduleQuery.isFetching}
        >
          {tCommon("retry")}
        </Button>
      </div>
    );
  }

  const topBadgeTitle = details.achievements?.[0]?.titleAr || details.achievements?.[0]?.titleEn;

  const viewOptions: Array<{ key: ViewMode; label: string }> = [
    { key: "month", label: t("month") },
    { key: "week", label: t("week") },
    { key: "day", label: t("day") },
  ];

  return (
    <div className="mx-auto flex w-full flex-col gap-8 pb-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1 text-start">
          <p className="text-xs text-[#64748b]">{t("breadcrumb")}</p>
          <h1 className="text-2xl font-bold text-[#2b415e]">{t("title")}</h1>
          <p className="text-sm text-[#64748b]">{t("subtitle")}</p>
        </div>

        <div className="inline-flex gap-2 self-start rounded-xl border border-[#e2e8f0] bg-white p-1.5 shadow-sm">
          {viewOptions.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => {
                setViewMode(option.key);
                if (option.key !== "week") notify.info(t("viewComingSoon"));
              }}
              className={cn(
                "rounded-lg px-4 py-2 text-xs font-bold transition",
                viewMode === option.key
                  ? "bg-[#2b415e] text-white"
                  : "text-[#64748b] hover:bg-slate-50",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          label={t("completedStations")}
          value={String(details.completedStationsCount ?? 0)}
          accent="bg-[#58cc02]"
        />
        <SummaryCard
          label={t("examsCount")}
          value={String(details.examStats?.totalAttempts ?? 0)}
          accent="bg-[#2b415e]"
        />
        <SummaryCard label={t("topBadge")} value={topBadgeTitle || "—"} accent="bg-[#c7af6d]" />
      </div>

      <article className="rounded-[20px] bg-white p-6 shadow-[0px_8px_0px_rgba(0,0,0,0.05)]">
        <div className="mb-4 flex items-center gap-2">
          <Trophy className="size-4 text-[#c7af6d]" aria-hidden />
          <h2 className="text-sm font-bold text-[#2b415e]">{t("upcomingEvents")}</h2>
        </div>
        {upcomingItems.length === 0 && !data.nextSession ? (
          <p className="text-sm text-[#64748b]">{t("noUpcomingEvents")}</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-3">
            {data.nextSession ? (
              <article className="flex flex-col justify-between gap-2 rounded-xl bg-[#2b415e] p-4 text-start shadow-[0px_4px_0px_#1e2e42]">
                <p className="text-[11px] text-white/70">{t("liveNow")}</p>
                <p className="text-sm font-bold text-white">
                  {data.nextSession.courseTitle || data.nextSession.title}
                </p>
              </article>
            ) : null}
            {upcomingItems.map((item) => (
              <ScheduleItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </article>

      <article className="rounded-[20px] bg-white p-6 shadow-[0px_8px_0px_rgba(0,0,0,0.05)]">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CalendarDays className="size-4 text-[#2b415e]" aria-hidden />
            <h2 className="text-sm font-bold text-[#2b415e]">{t("week")}</h2>
          </div>
          <div className="flex items-center gap-2">
            {!scheduleQuery.isCurrentWeek ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-xl"
                onClick={scheduleQuery.goToCurrentWeek}
              >
                {t("thisWeek")}
              </Button>
            ) : null}
            <Button
              type="button"
              size="icon"
              variant="outline"
              className="rounded-xl"
              aria-label={t("nextWeek")}
              onClick={scheduleQuery.goToNextWeek}
            >
              <ChevronRight className="size-4" aria-hidden />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="outline"
              className="rounded-xl"
              aria-label={t("previousWeek")}
              onClick={scheduleQuery.goToPreviousWeek}
            >
              <ChevronLeft className="size-4" aria-hidden />
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto pb-2">
          <div className="grid min-w-[840px] grid-cols-5 gap-4">
            {data.days.map((day) => (
              <DayColumn key={`${scheduleQuery.weekStart}-${day.date}`} day={day} />
            ))}
          </div>
        </div>
      </article>
    </div>
  );
}
