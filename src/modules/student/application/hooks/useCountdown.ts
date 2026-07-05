"use client";

import { useEffect, useState } from "react";

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
