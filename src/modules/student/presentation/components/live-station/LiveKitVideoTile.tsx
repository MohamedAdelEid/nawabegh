"use client";

import { useEffect, useRef } from "react";
import type { Track } from "livekit-client";

type LiveKitVideoTileProps = {
  track: Track | null | undefined;
  className?: string;
  muted?: boolean;
};

export function LiveKitVideoTile({
  track,
  className,
  muted = true,
}: LiveKitVideoTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !track) return;
    track.attach(el);
    return () => {
      track.detach(el);
    };
  }, [track]);

  return (
    <video
      ref={videoRef}
      className={className}
      autoPlay
      playsInline
      muted={muted}
    />
  );
}
