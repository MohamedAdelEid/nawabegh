"use client";

import { format, parseISO, startOfDay } from "date-fns";
import { CalendarDays } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/shared/application/lib/cn";
import { Button } from "@/shared/presentation/components/ui/button";
import { Calendar } from "@/shared/presentation/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/presentation/components/ui/popover";

interface ChallengeScheduleDateFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  minDate?: string;
  placeholder?: string;
}

export function ChallengeScheduleDateField({
  id,
  label,
  value,
  onChange,
  minDate,
  placeholder = "yyyy-mm-dd",
}: ChallengeScheduleDateFieldProps) {
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
      <label className="text-sm font-semibold text-slate-600" htmlFor={id}>
        {label}
      </label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            className={cn(
              "h-12 w-full justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 text-right text-sm font-normal text-slate-700 shadow-none hover:bg-slate-50",
              !value && "text-slate-400",
            )}
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
            disabled={
              minimumDate ? (date) => startOfDay(date) < minimumDate : undefined
            }
            fixedWeeks
            className="p-0 [--cell-size:--spacing(9)]"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
