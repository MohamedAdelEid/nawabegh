"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import type React from "react";
import { Button } from "@/shared/presentation/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/presentation/components/ui/popover";
import { AddUserField } from "./AddUserField";
import { Calendar } from "@/shared/presentation/components/ui/calendar";

interface AddUserDateFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

export function AddUserDateField({
  label,
  value,
  onChange,
  placeholder,
  icon: Icon,
}: AddUserDateFieldProps) {
  const selectedDate = useMemo(() => {
    if (!value) return undefined;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
  }, [value]);

  return (
    <AddUserField label={label}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="h-14 w-full justify-between rounded-2xl border-[var(--dashboard-border-soft)] bg-[var(--dashboard-surface-soft)] px-4 text-right font-normal text-slate-700 hover:translate-none hover:bg-[var(--dashboard-surface-soft)]"
          >
            <span>{selectedDate ? format(selectedDate, "yyyy-MM-dd") : (placeholder ?? "yyyy-mm-dd")}</span>
            {Icon ? <Icon className="h-5 w-5 shrink-0" aria-hidden /> : null}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          className=" w-[22rem] rounded-[1.75rem] border border-white/10 p-3 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.82)]"
        >
          <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => {
            if (!date) return;
            onChange(format(date, "yyyy-MM-dd"));
          }}
          fixedWeeks
          className="w-full mx-auto p-0 [--cell-size:--spacing(9.5)] !border-none"
        />
        </PopoverContent>
      </Popover>
    </AddUserField>
  );
}
