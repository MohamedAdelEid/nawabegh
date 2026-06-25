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
import { mapLiveSessionToStation } from "@/modules/admin/domain/utils/liveSessionMappers";
import {
  getLiveSessionWorkspace,
  getLiveStationInfo,
} from "@/modules/admin/infrastructure/api/liveSessionsApi";
import { notify } from "@/shared/application/lib/toast";
import { cn } from "@/shared/application/lib/cn";
import { useScopedDashboardRoutes } from "@/shared/application/hooks/useScopedDashboardRoutes";
import { resolveFileUrl } from "@/shared/infrastructure/files/fileUrl";
import { JourneyEditorStationPageSkeleton } from "@/modules/admin/presentation/components/journey-editor";
import { DashboardPageHeader } from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";

interface Props {
  journeyId: string;
  stationId: string;
}

const STATION_SESSION_STORAGE_KEY_PREFIX = "admin.liveSession.station.";

function storeSessionId(stationId: string, sessionId: string) {
  window.localStorage.setItem(`${STATION_SESSION_STORAGE_KEY_PREFIX}${stationId}`, sessionId);
}

function clearStoredSessionId(stationId: string) {
  window.localStorage.removeItem(`${STATION_SESSION_STORAGE_KEY_PREFIX}${stationId}`);
}

export function AdminJourneyLiveBroadcastViewPage({ journeyId, stationId }: Props) {
  const t = useTranslations("admin.dashboard.journeyEditor.liveBroadcastView");
  const tBc = useTranslations("admin.dashboard.journeyEditor.breadcrumbs");
  const router = useRouter();
  const routes = useScopedDashboardRoutes();

  const [station, setStation] = useState<LiveBroadcastStation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      setLoading(true);

      const stationInfoResult = await getLiveStationInfo(stationId);
      if (stationInfoResult.errorMessage && stationInfoResult.status !== "NotFound") {
        notify.error(stationInfoResult.errorMessage);
      }

      const sessionId = stationInfoResult.data?.liveSessionId ?? null;
      if (!sessionId) {
        clearStoredSessionId(stationId);
        router.replace(routes.journeyEditor.LIVE_BROADCAST_ADD(journeyId, stationId));
        return;
      }

      const result = await getLiveSessionWorkspace(sessionId);
      if (result.data) {
        storeSessionId(stationId, result.data.id);
        setStation(mapLiveSessionToStation(result.data));
        setLoading(false);
        return;
      }

      clearStoredSessionId(stationId);
      if (result.status === "NotFound") {
        router.replace(routes.journeyEditor.LIVE_BROADCAST_ADD(journeyId, stationId));
        return;
      }

      if (result.errorMessage) {
        notify.error(result.errorMessage);
      }
      setLoading(false);
    })();
  }, [journeyId, router, routes.journeyEditor, stationId]);

  if (loading) {
    return <JourneyEditorStationPageSkeleton showSidebar />;
  }

  if (!station) return null;

  const presenterInitial = station.presenter.trim().charAt(0) || "?";
  const joinUrl = station.broadcastLink.trim();
  const coverImageSrc = resolveFileUrl(station.thumbnailUrl);
  const presenterAvatarSrc = resolveFileUrl(station.presenterAvatarUrl);
  const statusKey = station.isLive
    ? "live"
    : station.status?.toLowerCase() === "scheduled"
      ? "scheduled"
      : "upcoming";
  const contextLine = [station.courseTitle, station.stationName, station.learningPathTitle]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="space-y-7">
      <DashboardPageHeader
        title={station.title}
        description={contextLine || t("description")}
        breadcrumbs={[
          { label: tBc("home"), href: routes.home },
          {
            label: tBc("journeyEditor"),
            href: routes.journeyEditor.EDITOR(journeyId),
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
                  <span
                    className={cn(
                      "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold",
                      station.isLive
                        ? "bg-rose-500"
                        : "bg-[#C8AC59]/90 text-[#2C4260]",
                    )}
                  >
                    {station.isLive ? (
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                    ) : null}
                    {t(`status.${statusKey}`)}
                  </span>
                  <Users className="h-4 w-4 text-white/60" />
                </div>
                {joinUrl ? (
                  <Button
                    asChild
                    className="w-full rounded-2xl bg-[#C8AC59] text-white hover:bg-[#B79A46] shadow-[0px_4px_0px_0px_#8F6C0B]"
                  >
                    <a href={joinUrl} target="_blank" rel="noopener noreferrer">
                      {t("actions.joinRoom")}
                    </a>
                  </Button>
                ) : (
                  <Button
                    disabled
                    className="w-full rounded-2xl bg-[#C8AC59]/60 text-white shadow-[0px_4px_0px_0px_#8F6C0B]"
                  >
                    {t("actions.joinRoom")}
                  </Button>
                )}
                <p className="mt-2 text-center text-xs text-white/60">
                  {joinUrl ? t("actions.joinRoomHint") : t("actions.joinRoomUnavailable")}
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
                  {presenterAvatarSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element -- resolved via FileUpload/download API
                    <img
                      src={presenterAvatarSrc}
                      alt={station.presenter}
                      className="h-12 w-12 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#2C4260] text-lg font-bold text-white">
                      {presenterInitial}
                    </div>
                  )}
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
                {station.attachments.map((att) => {
                  const attachmentUrl = resolveFileUrl(att.fileUrl);
                  const row = (
                    <>
                      <span className="text-xs text-slate-500">{att.sizeLabel}</span>
                      <div className="flex items-center gap-2 text-right">
                        <span className="text-sm font-semibold text-slate-700">{att.name}</span>
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100 text-rose-500">
                          <FileText className="h-4 w-4" />
                        </div>
                      </div>
                    </>
                  );

                  return attachmentUrl ? (
                    <a
                      key={att.id}
                      href={attachmentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 transition-colors hover:border-[#C8AC59]/40 hover:bg-amber-50/50"
                    >
                      {row}
                    </a>
                  ) : (
                    <div
                      key={att.id}
                      className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2"
                    >
                      {row}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ) : null}
        </aside>

        {/* Main content */}
        <main className="space-y-6">
          <div
            className={cn(
              "relative flex min-h-52 items-end overflow-hidden rounded-[1.75rem] p-6",
              coverImageSrc
                ? "bg-[#2C4260]"
                : "bg-gradient-to-br from-[#2C4260] to-[#1a2a3a]",
            )}
          >
            {coverImageSrc ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element -- resolved via FileUpload/download API */}
                <img
                  src={coverImageSrc}
                  alt={station.title}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a2a3a]/90 via-[#2C4260]/40 to-transparent" />
              </>
            ) : null}
            <div className="relative z-10">
              <div className="mb-2 flex items-center gap-2">
                <span
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold text-white",
                    station.isLive ? "bg-rose-500" : "bg-[#C8AC59] text-[#2C4260]",
                  )}
                >
                  {station.isLive ? (
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                  ) : null}
                  {t(`status.${statusKey}`)}
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
              <p className="text-sm leading-7 text-slate-600">
                {station.description.trim() || t("messages.noDescription")}
              </p>

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

          {station.objectives.length > 0 ? (
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
          ) : null}

          {station.preTasks.length > 0 ? (
          <Card className="rounded-[1.75rem] border-white/80 shadow-[0px_4px_0px_0px_#0000000D]">
            <CardContent className="space-y-4 p-5">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-bold text-slate-800">
                  <span className="h-1 w-4 rounded-full bg-[#C8AC59]" />
                  {t("sections.preTasks")}
                </h3>
                <span className="text-xs text-slate-400">
                  {station.preTasks.filter((t) => t.completed).length}/{station.preTasks.length}
                </span>
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
          ) : null}
        </main>
      </div>
    </div>
  );
}
