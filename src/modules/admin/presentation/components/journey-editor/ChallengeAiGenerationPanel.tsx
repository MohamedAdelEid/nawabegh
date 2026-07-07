"use client";

import { Sparkles } from "lucide-react";
import { formatElapsedSeconds } from "@/shared/application/hooks/useElapsedSeconds";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";

interface ChallengeAiGenerationPanelProps {
  elapsedSeconds: number;
  title: string;
  description: string;
}

export function ChallengeAiGenerationPanel({
  elapsedSeconds,
  title,
  description,
}: ChallengeAiGenerationPanelProps) {
  return (
    <Card className="rounded-[1.75rem] border-[#2C4260]/20 bg-[#EEF2FB] shadow-none">
      <CardContent className="flex items-center justify-between gap-4 p-5">
        <div className="flex items-center gap-3 text-right">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#2C4260] text-white">
            <Sparkles className="h-5 w-5 animate-pulse" />
          </span>
          <div>
            <p className="font-bold text-slate-800">{title}</p>
            <p className="text-sm text-slate-500">{description}</p>
          </div>
        </div>
        <span className="shrink-0 rounded-2xl bg-white px-4 py-2 font-mono text-lg font-bold text-[#2C4260] tabular-nums">
          {formatElapsedSeconds(elapsedSeconds)}
        </span>
      </CardContent>
    </Card>
  );
}

export function getChallengeGenerateLabel(
  generating: boolean,
  elapsedSeconds: number,
  idleLabel: string,
  getGeneratingLabel: (elapsed: string) => string,
) {
  if (!generating) return idleLabel;
  return getGeneratingLabel(formatElapsedSeconds(elapsedSeconds));
}
