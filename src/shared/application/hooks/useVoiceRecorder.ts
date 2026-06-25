import { useCallback, useEffect, useRef, useState } from "react";

export type VoiceRecorderStatus = "idle" | "recording";

function resolveRecorderMimeType(): string {
  if (typeof MediaRecorder === "undefined") return "";
  if (MediaRecorder.isTypeSupported("audio/webm")) return "audio/webm";
  if (MediaRecorder.isTypeSupported("audio/mp4")) return "audio/mp4";
  if (MediaRecorder.isTypeSupported("audio/ogg")) return "audio/ogg";
  return "";
}

export function formatVoiceDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export function useVoiceRecorder() {
  const [status, setStatus] = useState<VoiceRecorderStatus>("idle");
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(0);
  const discardOnStopRef = useRef(false);

  const cleanupStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const clearTimer = useCallback(() => {
    if (!timerRef.current) return;
    clearInterval(timerRef.current);
    timerRef.current = null;
  }, []);

  const reset = useCallback(() => {
    clearTimer();
    cleanupStream();
    mediaRecorderRef.current = null;
    chunksRef.current = [];
    discardOnStopRef.current = false;
    setStatus("idle");
    setDuration(0);
    setError(null);
  }, [clearTimer, cleanupStream]);

  const start = useCallback(async () => {
    if (status === "recording") return;
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setError("unsupported");
      return;
    }

    setError(null);
    chunksRef.current = [];
    discardOnStopRef.current = false;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = resolveRecorderMimeType();
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.start();
      startTimeRef.current = Date.now();
      setDuration(0);
      setStatus("recording");

      timerRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 200);
    } catch {
      cleanupStream();
      setError("permission_denied");
      setStatus("idle");
    }
  }, [status, cleanupStream]);

  const stop = useCallback((): Promise<Blob | null> => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === "inactive") {
      return Promise.resolve(null);
    }

    return new Promise((resolve) => {
      recorder.onstop = () => {
        clearTimer();
        cleanupStream();

        const blob = discardOnStopRef.current
          ? null
          : new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });

        chunksRef.current = [];
        mediaRecorderRef.current = null;
        discardOnStopRef.current = false;
        setStatus("idle");
        setDuration(0);
        resolve(blob && blob.size > 0 ? blob : null);
      };

      recorder.stop();
    });
  }, [clearTimer, cleanupStream]);

  const cancel = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === "inactive") {
      reset();
      return;
    }

    discardOnStopRef.current = true;
    recorder.stop();
  }, [reset]);

  useEffect(() => () => reset(), [reset]);

  return {
    status,
    duration,
    error,
    isRecording: status === "recording",
    start,
    stop,
    cancel,
    reset,
  };
}
