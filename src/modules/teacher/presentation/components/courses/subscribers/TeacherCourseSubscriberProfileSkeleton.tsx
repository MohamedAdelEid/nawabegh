"use client";

import { Card, CardContent } from "@/shared/presentation/components/ui/card";

export function TeacherCourseSubscriberProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-40 animate-pulse rounded-[2rem] bg-slate-100" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 7 }).map((_, index) => (
          <Card key={index} className="rounded-[1.5rem] border-white/80 bg-white">
            <CardContent className="h-24 animate-pulse p-5" />
          </Card>
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <Card className="rounded-[2rem] border-white/80 bg-white">
          <CardContent className="h-80 animate-pulse p-6" />
        </Card>
        <Card className="rounded-[2rem] border-white/80 bg-white">
          <CardContent className="h-80 animate-pulse p-6" />
        </Card>
      </div>
    </div>
  );
}
