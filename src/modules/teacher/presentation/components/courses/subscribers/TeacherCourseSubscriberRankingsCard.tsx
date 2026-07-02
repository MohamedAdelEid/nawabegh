"use client";

import Link from "next/link";
import { Trophy } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTeacherCourseSubscriberRankings } from "@/modules/teacher/application/hooks/useTeacherCourseSubscriberRankings";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { Button } from "@/shared/presentation/components/ui/button";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { UserAvatarImageOrInitials } from "@/shared/presentation/components/user";

export function TeacherCourseSubscriberRankingsCard({ courseId }: { courseId: string }) {
  const t = useTranslations("teacher.dashboard");
  const { data, isLoading } = useTeacherCourseSubscriberRankings(courseId, { limit: 5 });

  const rankings = data?.rankings ?? [];

  return (
    <Card className="h-fit rounded-[2rem] border-white/80 bg-white shadow-[var(--dashboard-shadow-soft)]">
      <CardContent className="space-y-4 p-6 text-right">
        <h2 className="text-lg font-bold text-slate-800">
          {t("courses.subscribers.rankings.title")}
        </h2>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-12 animate-pulse rounded-xl bg-slate-100" />
            ))}
          </div>
        ) : rankings.length === 0 ? (
          <p className="py-4 text-center text-sm text-slate-500">
            {t("courses.subscribers.rankings.empty")}
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {rankings.map((student) => (
              <div
                key={student.studentUserId}
                className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="flex min-w-0 flex-1 items-center  gap-3">
                  <UserAvatarImageOrInitials
                    trackKey={student.studentUserId}
                    name={student.fullName}
                    imageUrl={student.profileImageUrl}
                    size="sm"
                    circleClassName="bg-[#DCE6F5] text-[#2C4260]"
                  />
                  <p className="truncate font-medium text-slate-800">{student.fullName}</p>
                </div>
                <Trophy className="h-5 w-5 text-[#C9A227]" aria-hidden />
              </div>
            ))}
          </div>
        )}

        <Button
          className="h-11 w-full rounded-xl bg-[#2C4260] text-base font-semibold text-white hover:bg-[#243751]"
          asChild
        >
          <Link href={ROUTES.USER.TEACHER.COURSES.SUBSCRIBERS(courseId)}>
            {t("courses.subscribers.rankings.viewAll")}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
