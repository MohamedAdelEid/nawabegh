"use client";

import { useEffect, useRef, useState } from "react";
import {
  CalendarDays,
  Clock3,
  Play,
  Target,
  UserRound,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { LiveStationInfoDto } from "@/modules/student/domain/live-station/live-station.types";
import { Button } from "@/shared/presentation/components/ui/button";

type LiveStationRecordedViewProps = {
  info: LiveStationInfoDto;
  resumeSeconds: number;
  onSaveProgress: (seconds: number) => void;
  onComplete: (percentage: number) => Promise<void>;
  onBack: () => void;
};

export function LiveStationRecordedView({
  info,
  resumeSeconds,
  onSaveProgress,
  onComplete,
  onBack,
}: LiveStationRecordedViewProps) {
  const t = useTranslations("student.dashboard.liveStation");
  const locale = useLocale();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [completing, setCompleting] = useState(false);
  const [currentTime, setCurrentTime] = useState(resumeSeconds);
  const lastSavedRef = useRef(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || resumeSeconds <= 0) return;
    const seek = () => {
      if (Math.abs(video.currentTime - resumeSeconds) > 1) {
        video.currentTime = resumeSeconds;
      }
    };
    if (video.readyState >= 1) seek();
    else video.addEventListener("loadedmetadata", seek, { once: true });
  }, [resumeSeconds]);

  const teacherName = info.responsibleTeacher?.fullName ?? "";
  const dateLabel = info.scheduledAt
    ? new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date(info.scheduledAt))
    : "—";

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    setCurrentTime(video.currentTime);
    if (video.currentTime - lastSavedRef.current >= 10) {
      lastSavedRef.current = video.currentTime;
      onSaveProgress(video.currentTime);
    }
  };

  const handleEnded = async () => {
    const video = videoRef.current;
    if (video) onSaveProgress(video.duration || video.currentTime);
    setCompleting(true);
    try {
      await onComplete(100);
    } finally {
      setCompleting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const total = Math.max(0, Math.floor(seconds));
    const m = Math.floor(total / 60)
      .toString()
      .padStart(2, "0");
    const s = (total % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="min-h-dvh bg-[#f6f7f7] px-4 py-6 md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div className="flex items-start justify-between gap-4">
          <Button type="button" variant="outline" onClick={onBack}>
            {t("actions.back")}
          </Button>
          <div className="text-end">
            <h1 className="text-2xl font-bold text-[#2c4260]">
              {info.courseTitle || info.title}
            </h1>
            <p className="text-sm text-slate-500">{t("recorded.subtitle")}</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-2xl bg-slate-900 shadow-lg">
              {info.recordingUrl ? (
                <video
                  ref={videoRef}
                  src={info.recordingUrl}
                  controls
                  className="aspect-video w-full"
                  onTimeUpdate={handleTimeUpdate}
                  onEnded={() => void handleEnded()}
                />
              ) : (
                <div className="flex aspect-video items-center justify-center text-white/70">
                  {t("recorded.noUrl")}
                </div>
              )}
              {resumeSeconds > 0 ? (
                <div className="absolute end-4 top-4 flex items-center gap-2 rounded-full bg-black/50 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">
                  <Clock3 className="size-3.5" />
                  {t("recorded.resumeFrom", { time: formatTime(resumeSeconds) })}
                </div>
              ) : null}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-3 flex flex-wrap justify-end gap-2">
                <span className="rounded-lg bg-[#2c4260]/10 px-2.5 py-1 text-xs font-bold text-[#2c4260]">
                  {t("recorded.partOne")}
                </span>
                <span className="rounded-lg bg-[#c7af6d]/15 px-2.5 py-1 text-xs font-bold text-[#c7af6d]">
                  {t("recorded.tag")}
                </span>
              </div>
              <h2 className="mb-4 text-end text-xl font-bold text-[#2c4260]">
                {info.title}
              </h2>
              <div className="mb-5 flex flex-wrap items-center justify-end gap-4 text-sm text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <UserRound className="size-4" />
                  {teacherName}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="size-4" />
                  {dateLabel}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 className="size-4" />
                  {t("stats.minutes", { count: info.durationMinutes })}
                </span>
              </div>

              {info.learningGoals.length > 0 ? (
                <div className="flex items-start gap-3 rounded-xl bg-[#2c4260]/5 p-4">
                  <div className="min-w-0 flex-1 text-end">
                    <p className="mb-1 text-sm font-bold text-[#2c4260]">
                      {t("recorded.goalTitle")}
                    </p>
                    <p className="text-sm leading-relaxed text-slate-600">
                      {info.learningGoals.join(" · ")}
                    </p>
                  </div>
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#c7af6d]/20 text-[#c7af6d]">
                    <Target className="size-5" />
                  </div>
                </div>
              ) : null}

              <div className="mt-5 flex justify-end">
                <Button
                  type="button"
                  disabled={completing || !info.recordingUrl}
                  onClick={() => void handleEnded()}
                  className="rounded-xl bg-[#2c4260] font-bold text-white"
                >
                  <Play className="size-4" />
                  {completing ? t("recorded.completing") : t("recorded.markComplete")}
                </Button>
              </div>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-3 text-end text-sm font-bold text-[#2c4260]">
                {t("recorded.contextTitle")}
              </h3>
              <p className="mb-1 text-end text-xs text-slate-400">{info.courseTitle}</p>
              <p className="mb-4 text-end text-sm font-semibold text-slate-700">
                {info.learningPathTitle}
              </p>
              <div className="rounded-xl bg-slate-50 px-3 py-2 text-end text-xs text-slate-500">
                {t("recorded.watched", {
                  current: formatTime(currentTime),
                  total: t("stats.minutes", { count: info.durationMinutes }),
                })}
              </div>
            </div>
            <div className="rounded-2xl border border-[#c7af6d]/40 bg-gradient-to-b from-[#c7af6d]/10 to-white p-5 text-end shadow-sm">
              <p className="text-sm font-bold text-[#2c4260]">
                {t("recorded.badgeHint")}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
