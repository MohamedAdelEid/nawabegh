"use client";

import { useEffect, useState } from "react";
import { secondsUntilSchedule } from "@/shared/domain/utils/scheduleTime";

export function useCountdown(initialSeconds: number, active = true) {
  const [remaining, setRemaining] = useState(initialSeconds);

  useEffect(() => {
    setRemaining(initialSeconds);
    if (!active) return;
    const timer = window.setInterval(() => {
      setRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [initialSeconds, active]);

  return remaining;
}

/**
 * Countdown derived from a schedule ISO string (recomputed each second from the clock).
 * Falls back to decrementing `fallbackSeconds` when no schedule is provided.
 */
export function useScheduleCountdown(
  scheduledAt: string | null | undefined,
  fallbackSeconds: number | null | undefined,
  active = true,
) {
  const resolve = () => {
    if (scheduledAt?.trim()) return secondsUntilSchedule(scheduledAt);
    return Math.max(0, fallbackSeconds ?? 0);
  };

  const [remaining, setRemaining] = useState(resolve);

  useEffect(() => {
    setRemaining(resolve());
    if (!active) return;
    const timer = window.setInterval(() => {
      setRemaining(resolve());
    }, 1000);
    return () => window.clearInterval(timer);
    // resolve closes over latest scheduledAt / fallbackSeconds
  }, [scheduledAt, fallbackSeconds, active]);

  return remaining;
}
