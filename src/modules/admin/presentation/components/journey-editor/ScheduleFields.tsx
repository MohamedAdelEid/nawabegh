"use client";

import { format, parse, parseISO, startOfDay } from "date-fns";
import { CalendarDays, Clock } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/shared/application/lib/cn";
import { Button } from "@/shared/presentation/components/ui/button";
import { Calendar } from "@/shared/presentation/components/ui/calendar";
import { Label } from "@/shared/presentation/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/presentation/components/ui/popover";

interface ScheduleDatePickerProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  minDate?: string;
  placeholder?: string;
}

const TRIGGER_CLASSES =
  "h-14 w-full justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 text-right text-base font-normal text-slate-700 shadow-none hover:bg-slate-50 focus-visible:border-[#C7AF6E] focus-visible:ring-2 focus-visible:ring-[#C7AF6E]/20";

export function ScheduleDatePicker({
  id,
  label,
  value,
  onChange,
  minDate,
  placeholder = "yyyy-mm-dd",
}: ScheduleDatePickerProps) {
  const [open, setOpen] = useState(false);

  const selectedDate = useMemo(() => {
    if (!value) return undefined;
    const parsed = parseISO(value);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
  }, [value]);

  const minimumDate = useMemo(() => {
    if (!minDate) return undefined;
    const parsed = parseISO(minDate);
    return Number.isNaN(parsed.getTime()) ? undefined : startOfDay(parsed);
  }, [minDate]);

  return (
    <div className="space-y-2 text-right">
      <Label htmlFor={id} className="text-[#64748B]">
        {label}
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            className={cn(TRIGGER_CLASSES, !value && "text-slate-400")}
          >
            <span>{selectedDate ? format(selectedDate, "yyyy-MM-dd") : placeholder}</span>
            <CalendarDays className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          className="w-auto rounded-[1.25rem] border border-slate-200 p-2 shadow-lg"
        >
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              if (!date) return;
              onChange(format(date, "yyyy-MM-dd"));
              setOpen(false);
            }}
            disabled={minimumDate ? (date) => startOfDay(date) < minimumDate : undefined}
            fixedWeeks
            className="p-0 [--cell-size:--spacing(9)]"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

interface ScheduleTimePickerProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minuteStep?: number;
}

const HOURS = Array.from({ length: 24 }, (_, hour) => hour);

export function ScheduleTimePicker({
  id,
  label,
  value,
  onChange,
  placeholder = "--:--",
  minuteStep = 5,
}: ScheduleTimePickerProps) {
  const [open, setOpen] = useState(false);

  const minutes = useMemo(
    () => Array.from({ length: Math.ceil(60 / minuteStep) }, (_, index) => index * minuteStep),
    [minuteStep],
  );

  const [selectedHour, selectedMinute] = useMemo(() => {
    if (!value) return [undefined, undefined] as const;
    const [hourPart, minutePart] = value.split(":");
    const hour = Number(hourPart);
    const minute = Number(minutePart);
    return [
      Number.isNaN(hour) ? undefined : hour,
      Number.isNaN(minute) ? undefined : minute,
    ] as const;
  }, [value]);

  const displayValue = useMemo(() => {
    if (!value) return placeholder;
    const parsed = parse(value, "HH:mm", new Date());
    return Number.isNaN(parsed.getTime()) ? value : format(parsed, "hh:mm a");
  }, [placeholder, value]);

  const commit = (hour: number, minute: number) => {
    const next = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
    onChange(next);
  };

  const handleHourSelect = (hour: number) => {
    commit(hour, selectedMinute ?? 0);
  };

  const handleMinuteSelect = (minute: number) => {
    commit(selectedHour ?? 0, minute);
  };

  return (
    <div className="space-y-2 text-right">
      <Label htmlFor={id} className="text-[#64748B]">
        {label}
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            className={cn(TRIGGER_CLASSES, !value && "text-slate-400")}
          >
            <span>{displayValue}</span>
            <Clock className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          className="w-auto rounded-[1.25rem] border border-slate-200 p-0 shadow-lg"
        >
          <div className="grid grid-cols-2 divide-x divide-slate-100">
            <TimeColumn
              items={HOURS}
              selected={selectedHour}
              onSelect={handleHourSelect}
              format={(hour) => String(hour).padStart(2, "0")}
            />
            <TimeColumn
              items={minutes}
              selected={selectedMinute}
              onSelect={handleMinuteSelect}
              format={(minute) => String(minute).padStart(2, "0")}
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

interface TimeColumnProps {
  items: number[];
  selected: number | undefined;
  onSelect: (value: number) => void;
  format: (value: number) => string;
}

function TimeColumn({ items, selected, onSelect, format: formatItem }: TimeColumnProps) {
  return (
    <div className="max-h-56 w-20 overflow-y-auto p-1.5">
      <div className="space-y-1">
        {items.map((item) => {
          const isSelected = item === selected;
          return (
            <button
              key={item}
              type="button"
              onClick={() => onSelect(item)}
              className={cn(
                "flex h-9 w-full items-center justify-center rounded-xl text-sm font-semibold transition-colors",
                isSelected
                  ? "bg-[#2C4260] text-white"
                  : "text-slate-600 hover:bg-slate-100",
              )}
            >
              {formatItem(item)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
