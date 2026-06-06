"use client";

import { Construction } from "lucide-react";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { cn } from "@/shared/application/lib/cn";

interface DashboardNotImplementedStateProps {
  badge: string;
  title: string;
  description: string;
  className?: string;
}

export function DashboardNotImplementedState({
  badge,
  title,
  description,
  className,
}: DashboardNotImplementedStateProps) {
  return (
    <Card
      className={cn(
        "rounded-[2rem] border-white/80 bg-white shadow-[0_14px_36px_rgba(15,23,42,0.08)]",
        className,
      )}
    >
      <CardContent className="flex min-h-[18rem] flex-col items-center justify-center gap-4 p-10 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F8EFD5] text-[#8F6C0B]">
          <Construction className="h-8 w-8" aria-hidden />
        </div>

        <span className="rounded-full bg-[#F8EFD5] px-4 py-1 text-xs font-semibold text-[#8F6C0B]">
          {badge}
        </span>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-[#1E3A66]">{title}</h2>
          <p className="mx-auto max-w-lg text-sm leading-7 text-slate-500">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
