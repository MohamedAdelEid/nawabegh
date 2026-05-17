"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/shared/application/lib/cn";
import { IconTone, iconToneClassNameMap, iconToneTextClassNameMap } from "@/shared/domain/types/common.types";

interface QuestionBankPreviewInfoItemProps {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: IconTone;
}

export function QuestionBankPreviewInfoItem({
  label,
  value,
  icon: Icon,
  tone = "primary",
}: QuestionBankPreviewInfoItemProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 p-4">
      <div className="text-right">
        <p className="mb-1 text-sm font-medium text-slate-500">{label}</p>
        <p
          className={cn(
            "text-xl font-extrabold",
            iconToneTextClassNameMap[tone],
          )}
        >
          {value}
        </p>
      </div>
      <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl", iconToneClassNameMap[tone])}>
        <Icon className="h-5 w-5" aria-hidden />
      </div>
    </div>
  );
}
