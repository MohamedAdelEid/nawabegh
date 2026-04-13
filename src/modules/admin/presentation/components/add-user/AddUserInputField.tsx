"use client";

import type React from "react";
import { Input } from "@/shared/presentation/components/ui/input";
import { AddUserField } from "./AddUserField";

export function AddUserInputField({
  label,
  hint,
  className,
  icon: Icon,
  ...props
}: React.ComponentProps<typeof Input> & {
  label: string;
  hint?: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}) {
  return (
    <AddUserField label={label} hint={hint}>
      <div className="relative">
      <Input
        {...props}
        className={`h-14 rounded-2xl border-[var(--dashboard-border-soft)] bg-[var(--dashboard-surface-soft)] px-4 text-right placeholder:text-slate-400 focus-visible:ring-[var(--dashboard-gold)]/25 ${className ?? ""}`}
        />
      {Icon ? <div className="absolute top-1/2 left-4 -translate-y-1/2"><Icon className="h-5 w-5" aria-hidden /></div> : null}
      </div>
    </AddUserField>
  );
}
