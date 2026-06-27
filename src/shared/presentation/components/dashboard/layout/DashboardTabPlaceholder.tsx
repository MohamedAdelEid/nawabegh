"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/presentation/components/ui/card";

interface DashboardTabPlaceholderProps {
  title: string;
  description: string;
}

export function DashboardTabPlaceholder({
  title,
  description,
}: DashboardTabPlaceholderProps) {
  return (
    <Card className="rounded-[2rem] border-white/80 bg-white shadow-[0_14px_36px_rgba(15,23,42,0.08)]">
      <CardHeader className="text-right">
        <CardTitle className="text-2xl font-bold text-slate-800">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-right text-sm leading-7 text-slate-500">{description}</p>
      </CardContent>
    </Card>
  );
}
