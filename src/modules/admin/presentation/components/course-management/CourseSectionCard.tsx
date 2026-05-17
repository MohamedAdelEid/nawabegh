"use client";

import type React from "react";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { cn } from "@/shared/application/lib/cn";

export function CourseSectionCard({
  title,
  icon: Icon,
  children,
  className,
}: {
  title: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card
      className={cn(
        "rounded-[1.75rem] border-white/80 bg-white shadow-[0px_8px_0px_0px_#0000000D]",
        className,
      )}
    >
      <CardContent className="space-y-5 p-6 text-right">
        <div className="flex items-center gap-2">
          {Icon ? <Icon className="h-5 w-5 text-[#2C4260]" aria-hidden /> : null}
          <h2 className="text-xl font-bold text-slate-800">{title}</h2>
        </div>
        {children}
      </CardContent>
    </Card>
  );
}
