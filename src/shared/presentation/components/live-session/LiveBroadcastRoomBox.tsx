"use client";

import { Loader2, Radio, Video, VideoOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import {
  endLiveSession,
  getLiveHostToken,
  type LiveHostToken,
} from "@/modules/admin/infrastructure/api/liveSessionsApi";
import { notify } from "@/shared/application/lib/toast";
import { cn } from "@/shared/application/lib/cn";
import { LiveSessionRuntimeMode } from "@/shared/domain/enums/cms.enums";
import { resolveFileUrl } from "@/shared/infrastructure/files/fileUrl";
import { Button } from "@/shared/presentation/components/ui/button";
import { LiveKitHostRoom } from "@/shared/presentation/components/live-session/LiveKitHostRoom";

export interface LiveBroadcastRoomBoxProps {
  stationId: string;
  sessionId: string;
  title: string;
  runtimeMode: number;
  recordingUrl: string | null;
  canStartBroadcast: boolean;
  scheduledAt: string;
  registeredCount: number;
  coverImageUrl?: string;
  onSessionEnded?: () => void;
}

type Countdown = { hours: number; minutes: number; seconds: number };

function computeCountdown(scheduledAt: string): Countdown {
  const target = new Date(scheduledAt).getTime();
  const diffMs = Number.isNaN(target) ? 0 : Math.max(0, target - Date.now());
  const totalSeconds = Math.floor(diffMs / 1000);

  return {
    hours: Math.floor(totalSeconds / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

/** Ticks the countdown down every second, recomputing from the target so it stays accurate. */
function useLiveCountdown(scheduledAt: string, active: boolean): Countdown {
  const [countdown, setCountdown] = useState(() => computeCountdown(scheduledAt));

  useEffect(() => {
    if (!active) return;

    setCountdown(computeCountdown(scheduledAt));
    const intervalId = window.setInterval(() => {
      setCountdown(computeCountdown(scheduledAt));
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [scheduledAt, active]);

  return countdown;
}

export function LiveBroadcastRoomBox({
  stationId,
  sessionId,
  title,
  runtimeMode,
  recordingUrl,
  canStartBroadcast,
  scheduledAt,
  registeredCount,
  coverImageUrl,
  onSessionEnded,
}: LiveBroadcastRoomBoxProps) {
  const t = useTranslations("liveBroadcastRoom");
  const [connecting, setConnecting] = useState(false);
  const [ending, setEnding] = useState(false);
  const [hostCredentials, setHostCredentials] = useState<LiveHostToken | null>(null);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const countdown = useLiveCountdown(
    scheduledAt,
    runtimeMode === LiveSessionRuntimeMode.Upcoming,
  );

  // Once the scheduled time arrives, treat an "Upcoming" session as Live so the
  // host immediately gets the broadcast controls without needing a refresh.
  const scheduleArrived =
    countdown.hours === 0 && countdown.minutes === 0 && countdown.seconds === 0;
  const effectiveRuntimeMode =
    runtimeMode === LiveSessionRuntimeMode.Upcoming && scheduleArrived
      ? LiveSessionRuntimeMode.Live
      : runtimeMode;

  const resolvedRecordingUrl = resolveFileUrl(recordingUrl ?? undefined);
  const resolvedCoverImage = resolveFileUrl(coverImageUrl) ?? undefined;
  const canHost =
    effectiveRuntimeMode === LiveSessionRuntimeMode.Live || canStartBroadcast;

  const handleStartBroadcast = useCallback(async () => {
    setConnecting(true);
    const result = await getLiveHostToken(stationId);
    setConnecting(false);

    if (!result.data) {
      notify.error(result.errorMessage ?? t("errors.hostToken"));
      return;
    }

    setHostCredentials(result.data);
    setIsBroadcasting(true);
  }, [stationId, t]);

  const handleEndSession = useCallback(async () => {
    setEnding(true);
    const result = await endLiveSession(sessionId);
    setEnding(false);

    if (result.errorMessage) {
      notify.error(result.errorMessage);
      return;
    }

    setIsBroadcasting(false);
    setHostCredentials(null);
    notify.success(t("sessionEnded"));
    onSessionEnded?.();
  }, [onSessionEnded, sessionId, t]);

  const handleDisconnected = useCallback(() => {
    setIsBroadcasting(false);
    setHostCredentials(null);
  }, []);

  if (isBroadcasting && hostCredentials) {
    return (
      <div className="overflow-hidden rounded-[1.75rem] border border-white/80 bg-[#0f172a] shadow-[0px_8px_0px_0px_#0000000D]">
        <LiveKitHostRoom
          token={hostCredentials.token}
          wsUrl={hostCredentials.wsUrl}
          ending={ending}
          onEndSession={handleEndSession}
          onDisconnected={handleDisconnected}
        />
      </div>
    );
  }

  if (effectiveRuntimeMode === LiveSessionRuntimeMode.Recorded && resolvedRecordingUrl) {
    return (
      <div className="overflow-hidden rounded-[1.75rem] border border-white/80 bg-[#0f172a] shadow-[0px_8px_0px_0px_#0000000D]">
        <div className="relative aspect-video w-full bg-black">
          <video
            className="h-full w-full"
            controls
            playsInline
            preload="metadata"
            src={resolvedRecordingUrl}
            title={title}
          />
        </div>
      </div>
    );
  }

  if (effectiveRuntimeMode === LiveSessionRuntimeMode.EndedWithoutRecording) {
    return (
      <PlaceholderBox
        coverImageSrc={resolvedCoverImage}
        title={title}
        registeredCount={registeredCount}
        badge={t("status.ended")}
        badgeClassName="bg-slate-500"
        icon={<VideoOff className="h-14 w-14 text-white/50" />}
        message={t("endedWithoutRecording")}
      />
    );
  }

  if (effectiveRuntimeMode === LiveSessionRuntimeMode.Upcoming) {
    return (
      <PlaceholderBox
        coverImageSrc={resolvedCoverImage}
        title={title}
        registeredCount={registeredCount}
        badge={t("status.upcoming")}
        badgeClassName="bg-[#C8AC59] text-[#2C4260]"
        icon={<Video className="h-14 w-14 text-white/50" />}
        message={t("upcomingMessage")}
        footer={
          <div className="flex justify-center gap-4 text-center">
            {[
              { value: countdown.hours, label: t("countdown.hours") },
              { value: countdown.minutes, label: t("countdown.minutes") },
              { value: countdown.seconds, label: t("countdown.seconds") },
            ].map(({ value, label }, index) => (
              <div key={label} className="flex items-center gap-1">
                {index > 0 ? (
                  <span className="text-2xl font-bold text-white/40">:</span>
                ) : null}
                <div>
                  <p className="text-3xl font-bold text-white">
                    {String(value).padStart(2, "0")}
                  </p>
                  <p className="text-xs text-white/60">{label}</p>
                </div>
              </div>
            ))}
          </div>
        }
      />
    );
  }

  return (
    <PlaceholderBox
      coverImageSrc={resolvedCoverImage}
      title={title}
      registeredCount={registeredCount}
      badge={t("status.live")}
      badgeClassName="bg-rose-500"
      icon={<Radio className="h-14 w-14 text-white/50" />}
      message={canHost ? t("liveReadyMessage") : t("liveViewerMessage")}
      footer={
        canHost ? (
          <Button
            type="button"
            className="rounded-2xl bg-[#C8AC59] px-8 text-white hover:bg-[#B79A46] shadow-[0px_4px_0px_0px_#8F6C0B]"
            disabled={connecting}
            onClick={() => void handleStartBroadcast()}
          >
            {connecting ? (
              <>
                <Loader2 className="me-2 h-4 w-4 animate-spin" />
                {t("connecting")}
              </>
            ) : (
              t("startBroadcast")
            )}
          </Button>
        ) : null
      }
      pulseBadge
    />
  );
}

interface PlaceholderBoxProps {
  coverImageSrc?: string;
  title: string;
  registeredCount: number;
  badge: string;
  badgeClassName: string;
  icon: ReactNode;
  message: string;
  footer?: ReactNode;
  pulseBadge?: boolean;
}

function PlaceholderBox({
  coverImageSrc,
  title,
  registeredCount,
  badge,
  badgeClassName,
  icon,
  message,
  footer,
  pulseBadge = false,
}: PlaceholderBoxProps) {
  const t = useTranslations("liveBroadcastRoom");

  return (
    <div
      className={cn(
        "relative flex min-h-[28rem] items-center justify-center overflow-hidden rounded-[1.75rem] p-6 shadow-[0px_8px_0px_0px_#0000000D]",
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
            alt={title}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a2a3a]/95 via-[#2C4260]/70 to-[#2C4260]/40" />
        </>
      ) : null}

      <div className="relative z-10 flex w-full max-w-xl flex-col items-center gap-5 text-center">
        <span
          className={cn(
            "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold text-white",
            badgeClassName,
          )}
        >
          {pulseBadge ? (
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
          ) : null}
          {badge}
        </span>

        {icon}

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <p className="text-sm text-white/75">{message}</p>
          <p className="text-xs text-white/55">
            {t("registered", { count: registeredCount })}
          </p>
        </div>

        {footer}
      </div>
    </div>
  );
}
