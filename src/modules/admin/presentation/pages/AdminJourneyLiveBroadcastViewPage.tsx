"use client";

import {
  CalendarDays,
  CheckCircle2,
  Clock,
  FileText,
  Radio,
  Users,
  Video,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import type { LiveBroadcastStation } from "@/modules/admin/domain/data/journeyEditorData";
import { getLiveBroadcastStation } from "@/modules/admin/infrastructure/api/journeyEditorApi";
import { cn } from "@/shared/application/lib/cn";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { DashboardPageHeader } from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";

interface Props {
  journeyId: string;
  stationId: string;
}

export function AdminJourneyLiveBroadcastViewPage({ journeyId, stationId }: Props) {
  const t = useTranslations("admin.dashboard.journeyEditor.liveBroadcastView");
  const tBc = useTranslations("admin.dashboard.journeyEditor.breadcrumbs");
  const router = useRouter();

  const [station, setStation] = useState<LiveBroadcastStation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      const result = await getLiveBroadcastStation(stationId);
      if (result.data) setStation(result.data);
      setLoading(false);
    })();
  }, [stationId]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-[#C8AC59]" />
      </div>
    );
  }

  if (!station) return null;

  return (
    <div className="space-y-7">
      <DashboardPageHeader
        title={t("title")}
        description={t("description")}
        breadcrumbs={[
          { label: tBc("home"), href: ROUTES.ADMIN.HOME },
          {
            label: tBc("journeyEditor"),
            href: ROUTES.ADMIN.JOURNEY_EDITOR.EDITOR(journeyId),
          },
          { label: tBc("liveBroadcastView") },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
        {/* Left sidebar */}
        <aside className="space-y-4">
          <Card className="overflow-hidden rounded-[1.75rem] border-white/80 shadow-[0px_8px_0px_0px_#0000000D]">
            <CardContent className="p-0">
              {/* Join room header */}
              <div className="bg-[#2C4260] p-5 text-white">
                <div className="mb-3 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 rounded-full bg-rose-500 px-2.5 py-1 text-xs font-bold">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                    {t("live")}
                  </span>
                  <Users className="h-4 w-4 text-white/60" />
                </div>
                <Button className="w-full rounded-2xl bg-[#C8AC59] text-white hover:bg-[#B79A46] shadow-[0px_4px_0px_0px_#8F6C0B]">
                  {t("actions.joinRoom")}
                </Button>
                <p className="mt-2 text-center text-xs text-white/60">
                  {t("actions.registerNote")}
                </p>
              </div>

              {/* Countdown */}
              <div className="border-t border-slate-100 p-4">
                <div className="flex justify-center gap-4 text-center">
                  {[
                    { value: station.countdown.hours, label: t("countdown.hours") },
                    { value: station.countdown.minutes, label: t("countdown.minutes") },
                    { value: station.countdown.seconds, label: t("countdown.seconds") },
                  ].map(({ value, label }, i) => (
                    <div key={label} className="flex items-center gap-1">
                      {i > 0 ? <span className="text-xl font-bold text-slate-300">:</span> : null}
                      <div>
                        <p className="text-2xl font-bold text-[#2C4260]">
                          {String(value).padStart(2, "0")}
                        </p>
                        <p className="text-xs text-slate-400">{label}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-center text-xs text-slate-400">
                  {t("liveNow")}
                </p>
              </div>

              {/* Presenter */}
              <div className="border-t border-slate-100 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#2C4260] text-white font-bold text-lg">
                    {station.presenter[0]}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-800">{station.presenter}</p>
                    {station.presenterTitle ? (
                      <p className="text-xs text-[#C8AC59]">{station.presenterTitle}</p>
                    ) : null}
                  </div>
                </div>
                <button
                  type="button"
                  className="mt-3 text-xs font-semibold text-[#2C4260] hover:underline"
                >
                  {t("showProfile")} ←
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Session details */}
          <Card className="rounded-[1.75rem] border-white/80 shadow-[0px_4px_0px_0px_#0000000D]">
            <CardContent className="space-y-3 p-4">
              <h3 className="flex items-center gap-2 text-sm font-bold text-slate-700">
                <Clock className="h-4 w-4" />
                {t("sections.details")}
              </h3>
              {[
                { icon: <CalendarDays className="h-4 w-4" />, label: t("details.date"), value: station.date },
                { icon: <Clock className="h-4 w-4" />, label: t("details.time"), value: station.time },
                { icon: <Video className="h-4 w-4" />, label: t("details.duration"), value: `${station.durationMin} ${t("details.minutes")}` },
              ].map(({ icon, label, value }) => (
                <div key={label} className="flex items-center justify-between gap-2 text-sm">
                  <span className="font-semibold text-slate-700">{value}</span>
                  <span className="flex items-center gap-1 text-slate-400">
                    {label}
                    {icon}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Attachments */}
          {station.attachments.length > 0 ? (
            <Card className="rounded-[1.75rem] border-white/80 shadow-[0px_4px_0px_0px_#0000000D]">
              <CardContent className="space-y-2 p-4">
                <h3 className="text-sm font-bold text-slate-700">{t("sections.attachments")}</h3>
                {station.attachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2"
                  >
                    <span className="text-xs text-slate-500">{att.sizeLabel}</span>
                    <div className="flex items-center gap-2 text-right">
                      <span className="text-sm font-semibold text-slate-700">{att.name}</span>
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100 text-rose-500">
                        <FileText className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : null}
        </aside>

        {/* Main content */}
        <main className="space-y-6">
          {/* Hero thumbnail */}
          <div className="flex min-h-52 items-end rounded-[1.75rem] bg-gradient-to-br from-[#2C4260] to-[#1a2a3a] p-6">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="flex items-center gap-1.5 rounded-full bg-rose-500 px-2.5 py-1 text-xs font-bold text-white">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                  {t("live")}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-white">{station.title}</h2>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-white/70">
                <Users className="h-3.5 w-3.5" />
                {t("registered", { count: station.registeredCount })}
              </p>
            </div>
          </div>

          {/* Overview */}
          <Card className="rounded-[1.75rem] border-white/80 shadow-[0px_4px_0px_0px_#0000000D]">
            <CardContent className="space-y-4 p-5">
              <h3 className="flex items-center gap-2 font-bold text-slate-800">
                <span className="h-1 w-4 rounded-full bg-[#C8AC59]" />
                {t("sections.overview")}
              </h3>
              <p className="text-sm leading-7 text-slate-600">{station.description}</p>

              {station.presenterTitle ? (
                <div className="flex items-center gap-2 rounded-2xl bg-slate-50 p-3 text-sm">
                  <Radio className="h-4 w-4 text-[#C8AC59]" />
                  <span className="text-slate-600">
                    <span className="font-semibold">{t("sections.presenter")}:</span>{" "}
                    {station.presenterTitle}
                  </span>
                </div>
              ) : null}
            </CardContent>
          </Card>

          {/* Objectives */}
          <Card className="rounded-[1.75rem] border-white/80 shadow-[0px_4px_0px_0px_#0000000D]">
            <CardContent className="space-y-4 p-5">
              <h3 className="flex items-center gap-2 font-bold text-slate-800">
                <span className="h-1 w-4 rounded-full bg-[#C8AC59]" />
                {t("sections.objectives")}
              </h3>
              <div className="space-y-3">
                {station.objectives.map((obj, i) => (
                  <div key={obj.id} className="flex items-start gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#2C4260] text-xs font-bold text-white">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <p className="pt-0.5 text-sm font-semibold text-slate-700">{obj.text}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pre-tasks */}
          <Card className="rounded-[1.75rem] border-white/80 shadow-[0px_4px_0px_0px_#0000000D]">
            <CardContent className="space-y-4 p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  {station.preTasks.filter((t) => t.completed).length}/{station.preTasks.length}
                </span>
                <h3 className="flex items-center gap-2 font-bold text-slate-800">
                  <span className="h-1 w-4 rounded-full bg-[#C8AC59]" />
                  {t("sections.preTasks")}
                </h3>
              </div>
              <div className="space-y-3">
                {station.preTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-start gap-3 rounded-2xl border border-slate-100 p-3"
                  >
                    <div
                      className={cn(
                        "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs",
                        task.completed
                          ? "border-emerald-400 bg-emerald-50 text-emerald-500"
                          : "border-slate-300 text-slate-300",
                      )}
                    >
                      {task.completed ? <CheckCircle2 className="h-3 w-3" /> : null}
                    </div>
                    <div className="flex-1 text-right">
                      <p className="text-sm font-semibold text-slate-700">{task.label}</p>
                      {task.subtitle ? (
                        <p className="mt-0.5 text-xs text-slate-400">{task.subtitle}</p>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
