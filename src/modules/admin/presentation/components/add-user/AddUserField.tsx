"use client";

import type React from "react";

export function AddUserField({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="relative space-y-2 text-right">
      <span className="block text-sm font-medium text-[#0F172A]">
        {label}
      </span>
      {children}
      {hint ? <span className="block text-xs text-slate-400">{hint}</span> : null}
    </label>
  );
}
