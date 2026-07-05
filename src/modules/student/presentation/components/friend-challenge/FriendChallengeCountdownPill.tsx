"use client";

import { useLocale, useTranslations } from "next-intl";
import { Clock } from "lucide-react";
import { useCountdown } from "@/modules/student/application/hooks/useCountdown";
import { formatCountdownParts } from "@/modules/student/domain/friend-challenge/friend-challenge.utils";

type FriendChallengeCountdownPillProps = {
  seconds: number;
  label?: string;
  variant?: "default" | "danger";
};

export function FriendChallengeCountdownPill({
  seconds,
  label,
  variant = "default",
}: FriendChallengeCountdownPillProps) {
  const locale = useLocale();
  const remaining = useCountdown(seconds);
  const parts = formatCountdownParts(remaining);
  const isDanger = variant === "danger";

  const formatPart = (value: number) =>
    new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US").format(value);

  return (
    <div className="flex flex-col items-center gap-2">
      {label ? (
        <p
          className={cnText(isDanger, "text-sm font-semibold")}
        >
          {label}
        </p>
      ) : null}
      <div
        className={cnBox(
          isDanger,
          "inline-flex items-center gap-2 rounded-2xl px-4 py-2 shadow-[0_4px_0_rgba(0,0,0,0.05)]",
        )}
      >
        <Clock className={cnText(isDanger, "size-4")} aria-hidden />
        <div className="flex items-center gap-2 text-sm font-semibold">
          {parts.days > 0 ? (
            <>
              <span>{formatPart(parts.days)}</span>
              <span className="opacity-60">|</span>
            </>
          ) : null}
          <span>{formatPart(parts.hours)}</span>
          <span className="opacity-60">|</span>
          <span>{formatPart(parts.minutes)}</span>
          <span className="opacity-60">|</span>
          <span>{formatPart(parts.seconds)}</span>
        </div>
      </div>
    </div>
  );
}

function cnText(isDanger: boolean, base: string) {
  return `${base} ${isDanger ? "text-[#ff4b4b]" : "text-[#64748b]"}`;
}

function cnBox(isDanger: boolean, base: string) {
  return `${base} ${isDanger ? "border border-[#ff4b4b]/20 bg-[#f4d8d8] text-[#ff4b4b]" : "bg-white text-[#2b415e]"}`;
}
