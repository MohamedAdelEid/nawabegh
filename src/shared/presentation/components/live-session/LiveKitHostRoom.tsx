"use client";

import {
  LiveKitRoom,
  RoomAudioRenderer,
  VideoConference,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { Room } from "livekit-client";
import { useTranslations } from "next-intl";
import { useEffect, useMemo } from "react";
import { notify } from "@/shared/application/lib/toast";
import { Button } from "@/shared/presentation/components/ui/button";

interface LiveKitHostRoomProps {
  token: string;
  wsUrl: string;
  ending: boolean;
  onEndSession: () => void;
  onDisconnected: () => void;
}

export function LiveKitHostRoom({
  token,
  wsUrl,
  ending,
  onEndSession,
  onDisconnected,
}: LiveKitHostRoomProps) {
  const t = useTranslations("liveBroadcastRoom");

  // A single, stable Room instance so React Strict Mode double-mounts and
  // unmounts reuse/destroy the same connection instead of leaking new ones.
  const room = useMemo(() => new Room({ adaptiveStream: true, dynacast: true }), []);

  useEffect(() => {
    return () => {
      void room.disconnect();
    };
  }, [room]);

  return (
    <LiveKitRoom
      room={room}
      serverUrl={wsUrl}
      token={token}
      connect
      video
      audio
      onDisconnected={onDisconnected}
      onError={(error) => notify.error(error.message)}
      className="h-full w-full"
      data-lk-theme="default"
    >
      <div className="relative flex h-full min-h-[28rem] flex-col">
        <div className="absolute end-4 top-4 z-20">
          <Button
            type="button"
            variant="destructive"
            className="rounded-xl shadow-lg"
            disabled={ending}
            onClick={onEndSession}
          >
            {ending ? t("endingSession") : t("endSession")}
          </Button>
        </div>
        <VideoConference />
        <RoomAudioRenderer />
      </div>
    </LiveKitRoom>
  );
}
