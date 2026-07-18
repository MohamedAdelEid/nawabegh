"use client";

import { useMemo, useState } from "react";
import { format, startOfDay } from "date-fns";
import { CalendarDays, Clock } from "lucide-react";
import { cn } from "@/shared/application/lib/cn";
import { Button } from "@/shared/presentation/components/ui/button";
import { Calendar } from "@/shared/presentation/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/presentation/components/ui/popover";

type DateTimePickerProps = {
  value: string;
  onChange: (value: string) => void;
  locale: string;
  ariaLabel: string;
  placeholder: string;
  timeLabel: string;
  confirmLabel: string;
  minDate?: Date;
};

function toLocalValue(date: Date): string {
  return format(date, "yyyy-MM-dd'T'HH:mm");
}

export function DateTimePicker({
  value,
  onChange,
  locale,
  ariaLabel,
  placeholder,
  timeLabel,
  confirmLabel,
  minDate = new Date(),
}: DateTimePickerProps) {
  const [open, setOpen] = useState(false);

  const selectedDate = useMemo(() => {
    if (!value) return undefined;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
  }, [value]);

  const displayValue = selectedDate
    ? new Intl.DateTimeFormat(locale, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(selectedDate)
    : placeholder;

  const selectDate = (date: Date | undefined) => {
    if (!date) return;
    const defaultTime = new Date(Date.now() + 60 * 60 * 1000);
    const next = new Date(date);
    next.setHours(
      selectedDate?.getHours() ?? defaultTime.getHours(),
      selectedDate?.getMinutes() ?? 0,
      0,
      0,
    );
    onChange(toLocalValue(next));
  };

  const selectTime = (time: string) => {
    if (!selectedDate || !time) return;
    const [hoursPart, minutesPart] = time.split(":");
    const hours = Number(hoursPart);
    const minutes = Number(minutesPart);
    if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return;
    const next = new Date(selectedDate);
    next.setHours(hours, minutes, 0, 0);
    onChange(toLocalValue(next));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          aria-label={ariaLabel}
          className={cn(
            "h-14 w-full justify-between rounded-2xl border-slate-100 bg-slate-50 px-4 text-start font-normal text-slate-700 hover:translate-none hover:bg-slate-50",
            !selectedDate && "text-slate-400",
          )}
        >
          <span>{displayValue}</span>
          <CalendarDays className="h-5 w-5 text-[#2C4260]" aria-hidden />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[min(22rem,calc(100vw-2rem))] rounded-[1.5rem] border-slate-200 p-3 shadow-xl"
      >
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={selectDate}
          disabled={(date) => startOfDay(date) < startOfDay(minDate)}
          fixedWeeks
          className="mx-auto w-full p-0 [--cell-size:--spacing(9)]"
        />
        <div className="mt-3 flex items-end gap-3 border-t border-slate-100 pt-3">
          <label className="min-w-0 flex-1 space-y-1 text-start">
            <span className="text-xs font-medium text-slate-500">{timeLabel}</span>
            <span className="relative block">
              <input
                type="time"
                value={selectedDate ? format(selectedDate, "HH:mm") : ""}
                onChange={(event) => selectTime(event.target.value)}
                disabled={!selectedDate}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 pe-9 text-start text-sm outline-none focus:border-[#C7AF6E] focus:ring-2 focus:ring-[#C7AF6E]/20 disabled:opacity-50"
              />
              <Clock className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </span>
          </label>
          <Button
            type="button"
            disabled={!selectedDate}
            onClick={() => setOpen(false)}
            className="h-11 rounded-xl bg-[#2C4260] px-4 text-white hover:bg-[#243751]"
          >
            {confirmLabel}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
