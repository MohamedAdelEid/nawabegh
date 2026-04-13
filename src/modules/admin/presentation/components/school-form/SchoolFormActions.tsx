"use client";

import { Button } from "@/shared/presentation/components/ui/button";

interface SchoolFormActionsProps {
  cancelLabel: string;
  submitLabel: string;
  onCancel: () => void;
  onSubmit: () => void;
}

export function SchoolFormActions({
  cancelLabel,
  submitLabel,
  onCancel,
  onSubmit,
}: SchoolFormActionsProps) {
  return (
    <div className="flex flex-wrap items-center justify-start gap-3 md:justify-end">
      <Button
        type="button"
        variant="outline"
        className="dashboard-raised-button h-12 rounded-xl border-slate-200 px-6 text-slate-700"
        style={{
          boxShadow: "0px 4px 0px 0px rgba(203, 213, 225, 1)",
        }}
        onClick={onCancel}
      >
        {cancelLabel}
      </Button>
      <Button
        type="button"
        className="dashboard-raised-button h-12 rounded-xl bg-[#2C4260] px-6 text-white hover:bg-[#243751]"
        style={{
          boxShadow: "0px 4px 0px 0px rgba(26, 42, 58, 1)",
        }}
        onClick={onSubmit}
      >
        {submitLabel}
      </Button>
    </div>
  );
}
