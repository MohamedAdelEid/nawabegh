"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Pause, Play } from "lucide-react";
import { formatVoiceDuration } from "@/shared/application/hooks/useVoiceRecorder";
import { cn } from "@/shared/application/lib/cn";

interface ChatVoiceMessageProps {
  fileUrl: string;
  durationLabel?: string;
  isTeacher: boolean;
}

export function ChatVoiceMessage({ fileUrl, durationLabel, isTeacher }: ChatVoiceMessageProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [durationSeconds, setDurationSeconds] = useState<number | null>(null);

  useEffect(() => {
    const audio = new Audio(fileUrl);
    audioRef.current = audio;

    const handleLoadedMetadata = () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        setDurationSeconds(Math.floor(audio.duration));
      }
    };

    const handleTimeUpdate = () => {
      if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;
      setProgress((audio.currentTime / audio.duration) * 100);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      audio.currentTime = 0;
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("pause", () => setIsPlaying(false));
    audio.addEventListener("play", () => setIsPlaying(true));

    return () => {
      audio.pause();
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audioRef.current = null;
    };
  }, [fileUrl]);

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      return;
    }

    try {
      await audio.play();
    } catch {
      setIsPlaying(false);
    }
  };

  const displayedDuration =
    durationSeconds !== null ? formatVoiceDuration(durationSeconds) : durationLabel ?? "0:00";

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-2xl px-4 py-3",
        isTeacher ? "bg-[#243B5A] text-white" : "bg-[#F2EFE9] text-slate-800",
      )}
    >
      <button
        type="button"
        className="rounded-full bg-white/20 p-2 transition hover:bg-white/30"
        onClick={() => void togglePlayback()}
        aria-label={isPlaying ? "Pause voice message" : "Play voice message"}
      >
        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </button>
      <button
        type="button"
        className="h-1.5 flex-1 rounded-full bg-white/30"
        onClick={() => void togglePlayback()}
        aria-label="Play voice message"
      >
        <div
          className="h-full rounded-full bg-current transition-[width]"
          style={{ width: `${Math.max(progress, isPlaying ? 2 : 0)}%` }}
        />
      </button>
      <Mic className="h-4 w-4 shrink-0 opacity-70" />
      <span className="shrink-0 text-xs">{displayedDuration}</span>
    </div>
  );
}
