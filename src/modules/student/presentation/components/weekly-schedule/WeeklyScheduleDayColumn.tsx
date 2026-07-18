"use client";

import type {
  WeeklyScheduleDayDto,
  WeeklyScheduleItemDto,
} from "@/modules/student/domain/weekly-schedule/weekly-schedule.types";
import {
  WeeklyScheduleClassCard,
  WeeklyScheduleEmptyDayCard,
} from "./WeeklyScheduleClassCard";
import { cn } from "@/shared/application/lib/cn";

type WeeklyScheduleDayColumnProps = {
  day: WeeklyScheduleDayDto;
  onItemAction: (item: WeeklyScheduleItemDto) => void;
  joiningStationId: string | null;
};

export function WeeklyScheduleDayColumn({
  day,
  onItemAction,
  joiningStationId,
}: WeeklyScheduleDayColumnProps) {
  const showEmptyPlaceholder = day.items.length === 0;

  return (
    <section className="flex min-w-[160px] flex-1 flex-col gap-4">
      <header
        className={cn(
          "rounded-t-xl py-2 text-center text-sm font-bold tracking-wide",
          day.isToday ? "bg-[#2b415e] text-white" : "bg-[#e2e8f0] text-[#2b415e]",
        )}
      >
        {day.dayNameAr}
      </header>

      <div className="flex flex-col gap-4">
        {showEmptyPlaceholder ? <WeeklyScheduleEmptyDayCard /> : null}
        {day.items.map((item) => (
          <WeeklyScheduleClassCard
            key={item.id}
            item={item}
            isJoining={joiningStationId === item.stationId}
            onAction={() => onItemAction(item)}
          />
        ))}
      </div>
    </section>
  );
}
