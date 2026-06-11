import Image from "next/image";
import { Award } from "lucide-react";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import type { StudentUserDetail } from "@/modules/admin/infrastructure/api/userManagementApi";

export type StudentEarnedBadgesCardProps = {
  title: string;
  emptyLabel: string;
  earnedAtLabel: string;
  requiredPointsLabel: string;
  badges: StudentUserDetail["earnedAchievementBadges"];
};

export function StudentEarnedBadgesCard({
  title,
  emptyLabel,
  earnedAtLabel,
  requiredPointsLabel,
  badges,
}: StudentEarnedBadgesCardProps) {
  return (
    <Card
      className="rounded-[2rem] border-white/80 bg-white"
      style={{ boxShadow: "0px 8px 0px 0px #0000000D" }}
    >
      <CardContent className="space-y-4 p-6">
        <h2 className="border-b border-[#EEF4FD] pb-3 text-right text-xl font-bold text-[#2B415E]">
          {title}
        </h2>

        {badges.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {badges.map((badge) => (
              <div
                key={badge.badgeId}
                className="flex items-start gap-3 rounded-[1.5rem] border border-slate-100 bg-[#F8FAFC] p-4 text-right"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white">
                  {badge.iconUrl ? (
                    <Image
                      src={badge.iconUrl}
                      alt=""
                      width={48}
                      height={48}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Award className="h-6 w-6 text-[#C7AF6D]" aria-hidden />
                  )}
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="font-semibold text-slate-800">{badge.name || emptyLabel}</p>
                  {badge.description ? (
                    <p className="text-sm text-slate-500">{badge.description}</p>
                  ) : null}
                  {badge.requiredPoints !== null ? (
                    <p className="text-xs text-slate-400">
                      {requiredPointsLabel}: {badge.requiredPoints}
                    </p>
                  ) : null}
                  {badge.earnedAt ? (
                    <p className="text-xs text-slate-400">
                      {earnedAtLabel}: {new Date(badge.earnedAt).toLocaleDateString()}
                    </p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-[1.5rem] border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">
            {emptyLabel}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
