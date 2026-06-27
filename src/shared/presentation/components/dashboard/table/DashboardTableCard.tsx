"use client";

import type React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/presentation/components/ui/card";
import { cn } from "@/shared/application/lib/cn";

interface DashboardTableCardProps {
  title: string;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function DashboardTableCard({
  title,
  actions,
  footer,
  children,
  className,
}: DashboardTableCardProps) {
  return (
    <Card
      className={cn(
        "overflow-hidden rounded-[2rem] border-white/80 bg-white",
        className,
      )}
      style={{
        boxShadow: "0px 8px 0px 0px #0000000D"
      }}
    >
      <CardHeader className="flex flex-col gap-4 border-b border-slate-100 p-6 md:flex-row md:items-center md:justify-between">
        <CardTitle className="text-right text-2xl font-bold text-slate-800">
          {title}
        </CardTitle>
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      </CardHeader>
      <CardContent className="p-0">{children}</CardContent>
      {footer ? <div className="border-t border-slate-100 p-6">{footer}</div> : null}
    </Card>
  );
}
