"use client";

import { Trophy } from "lucide-react";
import type { TeacherLevelProgress } from "@/modules/teacher/domain/types/teacher.types";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";

export function TeacherLevelCard({
  level,
  title,
  qualityLabel,
  xpLabel,
}: {
  level: TeacherLevelProgress;
  title: string;
  qualityLabel: string;
  xpLabel: string;
}) {
  const progressPercent = Math.round((level.currentXp / level.maxXp) * 100);

  return (
    <Card className="rounded-[1.75rem] border-transparent bg-[#2C4260] text-white shadow-[var(--dashboard-shadow-soft)]">
      <CardContent className="space-y-5 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1 text-right">
            <p className="text-2xl font-bold">{title}</p>
            <p className="text-sm text-white/70">{qualityLabel}</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#C9A227]/20">
            <Trophy className="h-6 w-6 text-[#C9A227]" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-2 overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-[#C9A227] transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-left text-xs text-white/80">{xpLabel}</p>
        </div>
      </CardContent>
    </Card>
  );
}
