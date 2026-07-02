"use client";

import { Card, CardContent } from "@/shared/presentation/components/ui/card";

export function TeacherCourseSubscribersDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-28 animate-pulse rounded-[2rem] bg-slate-100" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="rounded-[1.75rem] border-white/80 bg-white">
            <CardContent className="h-32 animate-pulse p-6" />
          </Card>
        ))}
      </div>
      <div className="h-16 animate-pulse rounded-[1.5rem] bg-slate-100" />
      <Card className="rounded-[2rem] border-white/80 bg-white">
        <CardContent className="h-80 animate-pulse p-6" />
      </Card>
    </div>
  );
}
