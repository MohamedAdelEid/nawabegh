"use client";

import { BookOpen, Clock, Pencil, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { journeyEditorData } from "@/modules/admin/domain/data/journeyEditorData";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { DashboardPageHeader } from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";

export function JourneyEditorDashboard() {
  const t = useTranslations("admin.dashboard");
  const router = useRouter();

  const journey = journeyEditorData;

  return (
    <div className="space-y-7">
      <DashboardPageHeader
        title={t("tabs.journeyEditor.title")}
        description={t("tabs.journeyEditor.description")}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card
          className="rounded-[1.75rem] border-white/80 shadow-[0px_8px_0px_0px_#0000000D] transition-shadow hover:shadow-lg"
        >
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF2FB] text-[#2C4260]">
                <BookOpen className="h-6 w-6" />
              </div>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
                {t("journeyEditor.dashboard.readyBadge", {
                  percent: journey.stats.pathReadinessPct,
                })}
              </span>
            </div>

            <div>
              <h3 className="text-right text-lg font-bold text-slate-800">
                {journey.title}
              </h3>
              <p className="mt-1 text-right text-sm text-slate-400">
                {journey.description}
              </p>
            </div>

            <div className="flex items-center justify-between text-sm text-slate-500">
              <div className="flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-[#C8AC59]" />
                <span className="font-semibold text-[#C8AC59]">
                  {journey.stats.totalPoints}
                </span>
                <span>{t("journeyEditor.dashboard.points")}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                <span>
                  {t("journeyEditor.dashboard.hours", {
                    count: journey.stats.learningHours,
                  })}
                </span>
              </div>
              <div>
                {t("journeyEditor.dashboard.paths", { count: journey.paths.length })}
              </div>
            </div>

            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-[#C8AC59] transition-all"
                style={{ width: `${journey.stats.pathReadinessPct}%` }}
              />
            </div>

            <Button className="h-11 w-full gap-2 rounded-lg bg-[#2C4260] text-white hover:bg-[#1E3050] cursor-pointer shadow-[0px_4px_0px_0px_#1E3050]"
              onClick={() =>
                router.push(ROUTES.ADMIN.JOURNEY_EDITOR.EDITOR(journey.id))
              }
              disabled={journey.stats.pathReadinessPct === 0}
            >
              <Pencil className="h-4 w-4" />
              {t("journeyEditor.dashboard.openEditor")}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
