"use client";

import { useEffect, useState } from "react";
import { ConnectionQuality, RoomEvent, type Room } from "livekit-client";
import { Eye, Signal, Tv } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  pickHostCameraPublication,
  pickPrimaryVideoPublication,
} from "@/modules/student/application/hooks/useLiveStation";
import type {
  LiveChatMessageDto,
  LiveClassroomPanel,
  LiveParticipantDto,
  LiveStationInfoDto,
  LiveStationJoinResultDto,
} from "@/modules/student/domain/live-station/live-station.types";
import { formatSessionShortId } from "@/modules/student/domain/live-station/live-station.utils";
import { LiveKitVideoTile } from "./LiveKitVideoTile";
import { LiveStationChatPanel } from "./LiveStationChatPanel";
import { LiveStationControlBar } from "./LiveStationControlBar";
import { LiveStationParticipantsPanel } from "./LiveStationParticipantsPanel";
import { cn } from "@/shared/application/lib/cn";

type LiveStationClassroomProps = {
  info: LiveStationInfoDto;
  joinResult: LiveStationJoinResultDto | null;
  room: Room | null;
  chatMessages: LiveChatMessageDto[];
  participants: LiveParticipantDto[];
  panel: LiveClassroomPanel;
  isFullscreen: boolean;
  hasRaisedHand: boolean;
  micEnabled: boolean;
  camEnabled: boolean;
  connectionQuality: ConnectionQuality;
  isReconnecting: boolean;
  isLeaving: boolean;
  onSetPanel: (panel: LiveClassroomPanel) => void;
  onSetFullscreen: (value: boolean) => void;
  onLeave: () => void;
  onRaiseHand: () => void;
  onToggleMic: () => void;
  onToggleCam: () => void;
  onSendChat: (body: string) => Promise<void>;
};

export function LiveStationClassroom({
  info,
  joinResult,
  room,
  chatMessages,
  participants,
  panel,
  isFullscreen,
  hasRaisedHand,
  micEnabled,
  camEnabled,
  connectionQuality,
  isReconnecting,
  isLeaving,
  onSetPanel,
  onSetFullscreen,
  onLeave,
  onRaiseHand,
  onToggleMic,
  onToggleCam,
  onSendChat,
}: LiveStationClassroomProps) {
  const t = useTranslations("student.dashboard.liveStation");
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!room) return;
    const bump = () => setTick((value) => value + 1);
    room.on(RoomEvent.TrackSubscribed, bump);
    room.on(RoomEvent.TrackUnsubscribed, bump);
    room.on(RoomEvent.TrackMuted, bump);
    room.on(RoomEvent.TrackUnmuted, bump);
    room.on(RoomEvent.ParticipantConnected, bump);
    room.on(RoomEvent.ParticipantDisconnected, bump);
    return () => {
      room.off(RoomEvent.TrackSubscribed, bump);
      room.off(RoomEvent.TrackUnsubscribed, bump);
      room.off(RoomEvent.TrackMuted, bump);
      room.off(RoomEvent.TrackUnmuted, bump);
      room.off(RoomEvent.ParticipantConnected, bump);
      room.off(RoomEvent.ParticipantDisconnected, bump);
    };
  }, [room]);

  const primary = pickPrimaryVideoPublication(room);
  const hostCam = pickHostCameraPublication(room, info.hostIdentity);
  const showPip =
    hostCam &&
    primary &&
    hostCam.publication.trackSid !== primary.publication.trackSid;
  const teacherName = info.responsibleTeacher?.fullName ?? "";
  const studentName = joinResult?.studentDisplayName ?? "";
  const viewerCount = Math.max(participants.length, info.liveParticipantCount);
  const sidebarOpen = !isFullscreen && panel !== null;

  const qualityLabel =
    connectionQuality === ConnectionQuality.Excellent ||
    connectionQuality === ConnectionQuality.Good
      ? t("footer.connectionExcellent")
      : connectionQuality === ConnectionQuality.Poor
        ? t("footer.connectionPoor")
        : t("footer.connectionUnknown");

  return (
    <div className="flex h-dvh min-h-0 flex-col bg-[#f6f7f7]">
      <header className="flex items-center justify-between border-b border-[#2c4260]/10 bg-white px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="text-end">
            <p className="text-sm font-bold text-slate-800">{studentName || "—"}</p>
            <p className="text-[10px] font-bold uppercase tracking-wide text-[#c7af6d]">
              {t("header.enrolledBadge")}
            </p>
          </div>
          <div className="size-10 overflow-hidden rounded-full border-2 border-[#c7af6d]/30 bg-slate-200" />
        </div>
        <div className="flex items-center gap-4">
          <div className="text-end">
            <h1 className="text-lg font-bold text-[#2c4260]">{info.title}</h1>
            <p className="text-xs text-slate-500">
              {t("header.teacher", { name: teacherName })}
            </p>
          </div>
          <div className="flex size-10 items-center justify-center rounded-lg bg-[#2c4260]/10 text-[#2c4260]">
            <Tv className="size-5" />
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {sidebarOpen ? (
          <aside className="flex w-full max-w-sm shrink-0 flex-col border-e border-slate-200 bg-white">
            <div className="flex border-b border-slate-100">
              <TabButton
                active={panel === "chat"}
                onClick={() => onSetPanel("chat")}
                label={t("tabs.chat")}
              />
              <TabButton
                active={panel === "participants"}
                onClick={() => onSetPanel("participants")}
                label={t("tabs.participants", { count: viewerCount })}
              />
            </div>
            <div className="min-h-0 flex-1">
              {panel === "participants" ? (
                <LiveStationParticipantsPanel
                  participants={participants}
                  hasRaisedHand={hasRaisedHand}
                  micEnabled={micEnabled}
                  camEnabled={camEnabled}
                  onRaiseHand={onRaiseHand}
                  onToggleMic={onToggleMic}
                  onToggleCam={onToggleCam}
                />
              ) : panel === "info" ? (
                <div className="space-y-3 overflow-y-auto p-4 text-end text-sm text-slate-600">
                  <p className="font-bold text-[#2c4260]">{info.title}</p>
                  <p>{info.description}</p>
                  {info.learningGoals.map((goal) => (
                    <p key={goal}>• {goal}</p>
                  ))}
                </div>
              ) : (
                <LiveStationChatPanel messages={chatMessages} onSend={onSendChat} />
              )}
            </div>
          </aside>
        ) : null}

        <main className="relative min-w-0 flex-1 p-4">
          <div className="relative h-full overflow-hidden rounded-2xl bg-[#1a2f1f] shadow-inner">
            {primary?.publication.track ? (
              <LiveKitVideoTile
                track={primary.publication.track}
                className="absolute inset-0 size-full object-contain"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-white/70">
                {isReconnecting ? t("stage.reconnecting") : t("stage.waiting")}
              </div>
            )}

            <div className="absolute end-4 top-4 z-10 flex items-center gap-1.5 rounded-lg bg-[#ef4444] px-3 py-1 text-xs font-bold text-white">
              <span className="size-2 animate-pulse rounded-full bg-white" />
              {t("badge.live")}
            </div>

            {showPip && hostCam?.publication.track ? (
              <div className="absolute start-4 top-4 z-10 w-40 overflow-hidden rounded-xl border-2 border-white/80 shadow-lg sm:w-48">
                <LiveKitVideoTile
                  track={hostCam.publication.track}
                  className="aspect-video w-full object-cover"
                />
                <div className="bg-[#2c4260]/90 px-2 py-1 text-center text-[10px] font-bold text-white">
                  {teacherName}
                </div>
              </div>
            ) : null}

            <LiveStationControlBar
              hasRaisedHand={hasRaisedHand}
              micEnabled={micEnabled}
              camEnabled={camEnabled}
              activePanel={isFullscreen ? null : panel}
              leaving={isLeaving}
              onLeave={onLeave}
              onRaiseHand={onRaiseHand}
              onToggleMic={onToggleMic}
              onToggleCam={onToggleCam}
              onTogglePanel={(next) => {
                if (isFullscreen) onSetFullscreen(false);
                onSetPanel(panel === next ? null : next);
              }}
            />
          </div>
        </main>
      </div>

      <footer className="flex items-center justify-between bg-[#2c4260] px-6 py-2.5 text-xs text-white">
        <p>
          {t("footer.sessionId", {
            id: formatSessionShortId(info.liveSessionId ?? joinResult?.liveSessionId),
          })}
        </p>
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1.5">
            <Signal className="size-3.5 text-emerald-300" />
            {qualityLabel}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Eye className="size-3.5" />
            {t("footer.viewers", { count: viewerCount })}
          </span>
        </div>
      </footer>
    </div>
  );
}

function TabButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex-1 border-b-2 py-3 text-sm font-bold transition",
        active
          ? "border-[#2c4260] text-[#2c4260]"
          : "border-transparent text-slate-400 hover:text-slate-600",
      )}
    >
      {label}
    </button>
  );
}
