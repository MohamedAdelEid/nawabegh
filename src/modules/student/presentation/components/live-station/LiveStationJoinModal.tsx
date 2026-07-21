"use client";

import {
  CheckCircle2,
  Clock3,
  Paperclip,
  Tv,
  Users,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { LiveSessionRuntimeMode } from "@/modules/student/domain/progress/progress.enums";
import type { LiveStationInfoDto } from "@/modules/student/domain/live-station/live-station.types";
import { Button } from "@/shared/presentation/components/ui/button";
import { cn } from "@/shared/application/lib/cn";

type LiveStationJoinModalProps = {
  info: LiveStationInfoDto;
  isJoining: boolean;
  canJoin: boolean;
  onJoin: () => void;
  onClose: () => void;
  onViewAttachments: () => void;
};

export function LiveStationJoinModal({
  info,
  isJoining,
  canJoin,
  onJoin,
  onClose,
  onViewAttachments,
}: LiveStationJoinModalProps) {
  const t = useTranslations("student.dashboard.liveStation");
  const isLive = info.runtimeMode === LiveSessionRuntimeMode.Live;
  const isUpcoming = info.runtimeMode === LiveSessionRuntimeMode.Upcoming;
  const teacherName = info.responsibleTeacher?.fullName ?? "";
  const teacherImage = info.responsibleTeacher?.profileImageUrl;
  const features = info.features;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2c4260]/60 p-4 backdrop-blur-[2px]">
      <div className="relative w-full max-w-lg overflow-hidden rounded-xl border border-[#2c4260]/10 bg-white shadow-2xl">
        <div className="relative h-40 bg-[#2c4260]">
          <button
            type="button"
            onClick={onClose}
            className="absolute start-4 top-4 rounded-lg p-2 text-white/90 transition hover:bg-white/10"
            aria-label={t("actions.close")}
          >
            <X className="size-3.5" />
          </button>

          <div className="absolute -bottom-10 end-8 flex items-end gap-4">
            {isLive ? (
              <div className="mb-12 flex items-center gap-1.5 rounded-lg bg-[#ef4444] px-3 py-1 text-xs font-bold text-white">
                <span className="size-2 rounded-full bg-white" />
                {t("badge.liveNow")}
              </div>
            ) : null}
            <div className="size-24 overflow-hidden rounded-xl border-4 border-white bg-slate-200 shadow-lg">
              {teacherImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={teacherImage}
                  alt={teacherName}
                  className="size-full object-cover"
                />
              ) : (
                <div className="flex size-full items-center justify-center text-2xl font-bold text-[#2c4260]">
                  {teacherName.slice(0, 1) || "م"}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6 px-8 pb-8 pt-14">
          <div className="space-y-1 text-end">
            <p className="text-sm font-bold text-[#c7af6d]">{t("stationLabel")}</p>
            <h2 className="text-2xl font-bold leading-tight text-[#2c4260]">
              {info.title}
            </h2>
            {teacherName ? (
              <p className="pt-1 text-sm text-slate-500">
                {t("byTeacher", { name: teacherName })}
              </p>
            ) : null}
          </div>

          {(isLive || info.studentHasAttended) && (
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-end gap-3 rounded-lg border border-[#2c4260]/10 bg-[#2c4260]/5 px-3 py-3">
                <div className="text-end">
                  <p className="text-[10px] uppercase tracking-wide text-slate-500">
                    {isUpcoming ? t("stats.startsIn") : t("stats.remaining")}
                  </p>
                  <p className="text-sm font-bold text-[#2c4260]">
                    {t("stats.minutes", { count: info.remainingMinutes || info.durationMinutes })}
                  </p>
                </div>
                <Clock3 className="size-5 text-[#2c4260]" />
              </div>
              <div className="flex items-center justify-end gap-3 rounded-lg border border-[#c7af6d]/20 bg-[#c7af6d]/5 px-3 py-3">
                <div className="text-end">
                  <p className="text-[10px] uppercase tracking-wide text-slate-500">
                    {t("stats.attendance")}
                  </p>
                  <p className="text-sm font-bold text-[#c7af6d]">
                    {t("stats.students", { count: info.liveParticipantCount })}
                  </p>
                </div>
                <Users className="size-5 text-[#c7af6d]" />
              </div>
            </div>
          )}

          {isUpcoming ? (
            <div className="rounded-xl border border-[#2c4260]/10 bg-slate-50 px-4 py-3 text-end text-sm text-slate-600">
              {t("upcoming.notice", {
                minutes: info.remainingMinutes || info.durationMinutes,
              })}
            </div>
          ) : null}

          <ul className="space-y-3">
            {(features?.interactiveChatEnabled ?? true) && (
              <FeatureRow label={t("features.chat")} />
            )}
            {(features?.highQualityStream ?? true) && (
              <FeatureRow label={t("features.board")} />
            )}
            {(features?.recordingAfterSession ?? true) && (
              <FeatureRow label={t("features.recording")} />
            )}
          </ul>

          <div className="flex flex-col gap-3 pt-2">
            <Button
              type="button"
              disabled={!canJoin || isJoining}
              onClick={onJoin}
              className={cn(
                "h-14 w-full rounded-xl bg-[#2c4260] text-base font-bold text-white hover:bg-[#243650]",
                !canJoin && "opacity-60",
              )}
            >
              <Tv className="size-5" />
              {isJoining ? t("actions.joining") : t("actions.join")}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={info.attachments.length === 0}
              onClick={onViewAttachments}
              className="h-14 w-full rounded-xl border-2 border-[#2c4260]/20 text-base font-bold text-[#2c4260]"
            >
              <Paperclip className="size-5" />
              {t("actions.attachments")}
            </Button>
          </div>
        </div>

        <div className="h-1 bg-gradient-to-r from-[#c7af6d] via-[#2c4260] to-[#c7af6d] opacity-30" />
      </div>
    </div>
  );
}

function FeatureRow({ label }: { label: string }) {
  return (
    <li className="flex items-center justify-end gap-3 text-sm text-slate-700">
      <span>{label}</span>
      <CheckCircle2 className="size-4 text-emerald-500" />
    </li>
  );
}
