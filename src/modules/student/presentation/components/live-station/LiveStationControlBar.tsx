"use client";

import {
  Hand,
  Info,
  MessageCircle,
  Mic,
  MicOff,
  MoreVertical,
  PhoneOff,
  ScreenShare,
  Users,
  Video,
  VideoOff,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/shared/application/lib/cn";

type LiveStationControlBarProps = {
  hasRaisedHand: boolean;
  micEnabled: boolean;
  camEnabled: boolean;
  activePanel: "chat" | "participants" | "info" | null;
  leaving?: boolean;
  onLeave: () => void;
  onRaiseHand: () => void;
  onToggleMic: () => void;
  onToggleCam: () => void;
  onTogglePanel: (panel: "chat" | "participants" | "info") => void;
};

export function LiveStationControlBar({
  hasRaisedHand,
  micEnabled,
  camEnabled,
  activePanel,
  leaving,
  onLeave,
  onRaiseHand,
  onToggleMic,
  onToggleCam,
  onTogglePanel,
}: LiveStationControlBarProps) {
  const t = useTranslations("student.dashboard.liveStation");

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-4 z-20 flex items-center justify-center px-4">
      <div className="pointer-events-auto flex max-w-full flex-wrap items-center justify-center gap-3">
        <div className="flex items-center gap-2 rounded-full bg-black/35 p-1.5 backdrop-blur-md">
          <IconButton
            active={activePanel === "participants"}
            label={t("controls.participants")}
            onClick={() => onTogglePanel("participants")}
          >
            <Users className="size-4" />
          </IconButton>
          <IconButton
            active={activePanel === "chat"}
            label={t("controls.chat")}
            onClick={() => onTogglePanel("chat")}
          >
            <MessageCircle className="size-4" />
          </IconButton>
          <IconButton
            active={activePanel === "info"}
            label={t("controls.info")}
            onClick={() => onTogglePanel("info")}
          >
            <Info className="size-4" />
          </IconButton>
        </div>

        <div className="flex items-center gap-2 rounded-full bg-white/95 p-1.5 shadow-lg">
          <button
            type="button"
            disabled={leaving}
            onClick={onLeave}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-[#ef4444] px-4 text-sm font-bold text-white disabled:opacity-60"
          >
            <PhoneOff className="size-4" />
            {leaving ? t("actions.leaving") : t("actions.leave")}
          </button>
          <IconButton label={t("controls.more")} onClick={() => undefined} tone="light">
            <MoreVertical className="size-4" />
          </IconButton>
          <IconButton label={t("controls.share")} onClick={() => undefined} tone="light">
            <ScreenShare className="size-4" />
          </IconButton>
          <IconButton
            label={t("controls.hand")}
            onClick={onRaiseHand}
            tone="light"
            className={hasRaisedHand ? "bg-[#c7af6d] text-white" : "text-[#c7af6d]"}
          >
            <Hand className="size-4" />
          </IconButton>
          <IconButton
            label={t("controls.camera")}
            onClick={onToggleCam}
            tone="light"
            className={!camEnabled ? "opacity-60" : undefined}
          >
            {camEnabled ? <Video className="size-4" /> : <VideoOff className="size-4" />}
          </IconButton>
          <IconButton
            label={t("controls.mic")}
            onClick={onToggleMic}
            tone="light"
            className={!micEnabled ? "opacity-60" : undefined}
          >
            {micEnabled ? <Mic className="size-4" /> : <MicOff className="size-4" />}
          </IconButton>
        </div>
      </div>
    </div>
  );
}

function IconButton({
  children,
  label,
  onClick,
  active,
  tone = "dark",
  className,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
  tone?: "dark" | "light";
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn(
        "flex size-10 items-center justify-center rounded-full transition",
        tone === "dark"
          ? active
            ? "bg-white text-[#2c4260]"
            : "bg-white/15 text-white hover:bg-white/25"
          : "bg-slate-100 text-slate-700 hover:bg-slate-200",
        className,
      )}
    >
      {children}
    </button>
  );
}
