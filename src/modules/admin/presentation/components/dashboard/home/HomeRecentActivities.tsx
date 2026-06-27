"use client";

import { useFormatter, useNow, useTranslations } from "next-intl";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import type { AdminHomeRecentActivity } from "@/modules/admin/domain/types/adminHomeDashboard.types";

type HomeRecentActivitiesProps = {
  activities: AdminHomeRecentActivity[];
};

function RelativeTime({ occurredAt, now }: { occurredAt: string; now: Date }) {
  const format = useFormatter();
  const date = new Date(occurredAt);
  if (Number.isNaN(date.getTime())) return null;
  return <time dateTime={occurredAt}>{format.relativeTime(date, now)}</time>;
}

export function HomeRecentActivities({ activities }: HomeRecentActivitiesProps) {
  const t = useTranslations("admin.dashboard.home.recentActivities");
  const now = useNow();

  return (
    <Card className="h-full rounded-[2rem] border-white/80 bg-white shadow-[var(--dashboard-shadow-soft)]">
      <CardContent className="space-y-5 p-6 text-right">
        <h2 className="text-xl font-bold text-slate-800">{t("title")}</h2>

        {activities.length === 0 ? (
          <p className="text-sm text-slate-500">{t("empty")}</p>
        ) : (
          <ul className="space-y-4">
            {activities.map((activity, index) => (
              <li key={`${activity.type}-${activity.entityId}-${index}`} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-[#2C4260]" />
                  {index < activities.length - 1 ? (
                    <span className="mt-1 w-px flex-1 bg-slate-200" />
                  ) : null}
                </div>
                <div className="space-y-0.5">
                  <p className="text-sm text-slate-700">{activity.message}</p>
                  <p className="text-xs text-slate-400">
                    <RelativeTime occurredAt={activity.occurredAt} now={now} />
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
