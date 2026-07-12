"use client";

import { CalendarDays, ClipboardList, Video } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  StudentScheduleActionType,
  StudentScheduleDisplayStatus,
} from "@/modules/student/domain/weekly-schedule/weekly-schedule.enums";
import type { WeeklyScheduleItemDto } from "@/modules/student/domain/weekly-schedule/weekly-schedule.types";
import { cn } from "@/shared/application/lib/cn";

type WeeklyScheduleClassCardProps = {
  item: WeeklyScheduleItemDto;
  onAction: () => void;
  isJoining?: boolean;
};

function ScheduleStatusBadge({ status }: { status: StudentScheduleDisplayStatus }) {
  const t = useTranslations("student.dashboard.weeklySchedule.badges");

  if (status === StudentScheduleDisplayStatus.LiveNow) {
    return (
      <span className="rounded-full bg-[#2b415e] px-2 py-0.5 text-[10px] font-bold uppercase text-[#dbe3f3]">
        {t("liveNow")}
      </span>
    );
  }

  if (status === StudentScheduleDisplayStatus.Exam) {
    return (
      <span className="rounded-full bg-[#c7af6d]/15 px-2 py-0.5 text-[10px] font-bold uppercase text-[#a38f5a]">
        {t("exam")}
      </span>
    );
  }

  if (status === StudentScheduleDisplayStatus.Upcoming) {
    return (
      <span className="rounded-full bg-[#f1f3f5] px-2 py-0.5 text-[10px] font-bold uppercase text-[#64748b]">
        {t("upcoming")}
      </span>
    );
  }

  if (status === StudentScheduleDisplayStatus.Ended) {
    return (
      <span className="rounded-full bg-[#f1f3f5] px-2 py-0.5 text-[10px] font-bold uppercase text-[#94a3b8]">
        {t("ended")}
      </span>
    );
  }

  return null;
}

function actionLabel(
  actionType: StudentScheduleActionType,
  t: ReturnType<typeof useTranslations<"student.dashboard.weeklySchedule.actions">>,
): string {
  switch (actionType) {
    case StudentScheduleActionType.EnterLive:
      return t("enterLive");
    case StudentScheduleActionType.StartExam:
      return t("startExam");
    case StudentScheduleActionType.ViewDetails:
      return t("viewDetails");
    case StudentScheduleActionType.Disabled:
    default:
      return t("notStartedYet");
  }
}

export function WeeklyScheduleClassCard({
  item,
  onAction,
  isJoining,
}: WeeklyScheduleClassCardProps) {
  const t = useTranslations("student.dashboard.weeklySchedule.actions");

  const isLive = item.displayStatus === StudentScheduleDisplayStatus.LiveNow;
  const isExam = item.displayStatus === StudentScheduleDisplayStatus.Exam;
  const isEnded = item.displayStatus === StudentScheduleDisplayStatus.Ended;
  const isDisabledAction = item.actionType === StudentScheduleActionType.Disabled;
  const isPrimaryAction =
    item.actionType === StudentScheduleActionType.EnterLive ||
    item.actionType === StudentScheduleActionType.StartExam;

  const label = actionLabel(item.actionType, t);

  return (
    <article
      className={cn(
        "relative flex min-h-[183px] flex-col overflow-hidden rounded-2xl bg-white p-5 shadow-[0px_8px_0px_0px_rgba(0,0,0,0.05)]",
        isLive && "border-2 border-[#dbe3f3]",
        isExam && "border-2 border-[rgba(199,175,109,0.4)]",
        isEnded && "opacity-70",
        !isLive && !isExam && "border-2 border-transparent",
      )}
    >
      {(isLive || isExam) && (
        <span
          className={cn(
            "absolute inset-y-0 start-0 w-1",
            isLive ? "bg-[#2b415e]" : "bg-[#c7af6d]",
          )}
          aria-hidden
        />
      )}

      <div className="mb-3 flex items-start justify-between gap-2">
        <ScheduleStatusBadge status={item.displayStatus} />
        <span className="text-xs font-medium text-[#64748b]">{item.timeRangeLabel}</span>
      </div>

      <h3 className="mb-1 text-start text-lg font-bold leading-7 text-[#2b415e]">{item.title}</h3>
      {item.instructorName ? (
        <p className="mb-4 text-start text-sm text-[#64748b]">{item.instructorName}</p>
      ) : (
        <div className="mb-4" />
      )}

      <div className="mt-auto">
        {isPrimaryAction && item.canEnter ? (
          <button
            type="button"
            disabled={isJoining}
            onClick={onAction}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold text-white transition-opacity disabled:opacity-60",
              isLive && "bg-[#2b415e] shadow-[0px_4px_0px_#1e2e42]",
              isExam && "bg-[#c7af6d] text-[#2b415e] shadow-[0px_4px_0px_#a38f5a]",
            )}
          >
            {isLive ? <Video className="size-3.5" aria-hidden /> : <ClipboardList className="size-3.5" aria-hidden />}
            {isJoining ? t("joining") : label}
          </button>
        ) : (
          <button
            type="button"
            disabled={isDisabledAction}
            onClick={onAction}
            className={cn(
              "flex w-full items-center justify-center rounded-xl border-2 border-[#e2e8f0] bg-[#f1f3f5] py-3 text-xs font-bold text-[#64748b]",
              !isDisabledAction && "transition-colors hover:bg-[#e8edf3]",
              isDisabledAction && "cursor-not-allowed opacity-80",
            )}
          >
            {label}
          </button>
        )}
      </div>
    </article>
  );
}

export function WeeklyScheduleEmptyDayCard() {
  const t = useTranslations("student.dashboard.weeklySchedule.emptyDay");

  return (
    <div className="flex min-h-[160px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[rgba(199,175,109,0.4)] bg-[rgba(244,236,216,0.3)] px-5 py-10">
      <CalendarDays className="mb-2 size-5 text-[#a38f5a]" aria-hidden />
      <p className="text-center text-xs font-bold text-[#a38f5a]">{t("message")}</p>
    </div>
  );
}
