"use client";

import { useMemo, useState } from "react";
import {
  Hand,
  MoreVertical,
  Search,
  Video,
  VideoOff,
  Mic,
  MicOff,
} from "lucide-react";
import { useTranslations } from "next-intl";
import type { LiveParticipantDto } from "@/modules/student/domain/live-station/live-station.types";
import { isTeacherRole } from "@/modules/student/domain/live-station/live-station.utils";
import { Button } from "@/shared/presentation/components/ui/button";
import { cn } from "@/shared/application/lib/cn";

type LiveStationParticipantsPanelProps = {
  participants: LiveParticipantDto[];
  hasRaisedHand: boolean;
  micEnabled: boolean;
  camEnabled: boolean;
  onRaiseHand: () => void;
  onToggleMic: () => void;
  onToggleCam: () => void;
};

export function LiveStationParticipantsPanel({
  participants,
  hasRaisedHand,
  micEnabled,
  camEnabled,
  onRaiseHand,
  onToggleMic,
  onToggleCam,
}: LiveStationParticipantsPanelProps) {
  const t = useTranslations("student.dashboard.liveStation");
  const [query, setQuery] = useState("");

  const { teachers, students } = useMemo(() => {
    const filtered = participants.filter((participant) =>
      participant.displayName.toLowerCase().includes(query.trim().toLowerCase()),
    );
    return {
      teachers: filtered.filter((p) => isTeacherRole(p.role)),
      students: filtered.filter((p) => !isTeacherRole(p.role)),
    };
  }, [participants, query]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="space-y-3 border-b border-slate-100 px-4 py-4">
        <div className="flex items-center justify-between gap-2">
          <span className="rounded-full bg-[#2c4260]/10 px-2.5 py-0.5 text-xs font-bold text-[#2c4260]">
            {participants.length}
          </span>
          <h3 className="text-base font-bold text-[#2c4260]">{t("participants.title")}</h3>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("participants.search")}
            className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pe-3 ps-9 text-sm outline-none focus:border-[#2c4260]/40"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-4">
        {teachers.length > 0 ? (
          <section className="space-y-2">
            <p className="text-end text-xs font-bold text-slate-400">
              {t("participants.teacherSection")}
            </p>
            {teachers.map((participant) => (
              <ParticipantRow
                key={participant.userId}
                participant={participant}
                subtitle={t("participants.speaking")}
              />
            ))}
          </section>
        ) : null}

        <section className="space-y-2">
          <p className="text-end text-xs font-bold text-slate-400">
            {t("participants.studentsSection")}
          </p>
          {students.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">
              {t("participants.empty")}
            </p>
          ) : (
            students.map((participant) => (
              <ParticipantRow
                key={participant.userId}
                participant={participant}
                subtitle={
                  participant.isHandRaised
                    ? t("participants.handRaised")
                    : t("participants.studentRole")
                }
              />
            ))
          )}
        </section>
      </div>

      <div className="space-y-2 border-t border-slate-100 px-4 py-4">
        <Button
          type="button"
          onClick={onRaiseHand}
          className={cn(
            "h-11 w-full rounded-xl font-bold",
            hasRaisedHand
              ? "bg-[#2c4260] text-white hover:bg-[#243650]"
              : "bg-[#c7af6d] text-white hover:bg-[#b89d5a]",
          )}
        >
          <Hand className="size-4" />
          {hasRaisedHand ? t("actions.lowerHand") : t("actions.raiseHand")}
        </Button>
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onToggleMic}
            className="h-11 rounded-xl border-[#2c4260]/20 bg-[#2c4260] font-bold text-white hover:bg-[#243650] hover:text-white"
          >
            {micEnabled ? <Mic className="size-4" /> : <MicOff className="size-4" />}
            {micEnabled ? t("actions.mute") : t("actions.unmute")}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onToggleCam}
            className="h-11 rounded-xl border-[#2c4260]/15 bg-[#2c4260]/10 font-bold text-[#2c4260]"
          >
            {camEnabled ? <Video className="size-4" /> : <VideoOff className="size-4" />}
            {camEnabled ? t("actions.closeCamera") : t("actions.openCamera")}
          </Button>
        </div>
      </div>
    </div>
  );
}

function ParticipantRow({
  participant,
  subtitle,
}: {
  participant: LiveParticipantDto;
  subtitle: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-3 py-2.5">
      <button type="button" className="text-slate-300" aria-hidden>
        <MoreVertical className="size-4" />
      </button>
      <div className="min-w-0 flex-1 text-end">
        <div className="flex items-center justify-end gap-2">
          {participant.isHandRaised ? (
            <Hand className="size-4 text-[#c7af6d]" />
          ) : null}
          <p className="truncate text-sm font-bold text-slate-800">
            {participant.displayName}
          </p>
        </div>
        <p className="text-xs text-slate-400">{subtitle}</p>
      </div>
      <div className="relative size-10 shrink-0 overflow-hidden rounded-full bg-slate-200">
        {participant.profileImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={participant.profileImageUrl}
            alt=""
            className="size-full object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-xs font-bold text-[#2c4260]">
            {participant.displayName.slice(0, 2)}
          </div>
        )}
        <span className="absolute bottom-0 end-0 size-2.5 rounded-full border-2 border-white bg-emerald-500" />
      </div>
      <div className="flex flex-col gap-1 text-slate-400">
        {participant.isMuted ? (
          <MicOff className="size-3.5" />
        ) : (
          <Mic className="size-3.5 text-emerald-500" />
        )}
        {participant.isCameraOff ? (
          <VideoOff className="size-3.5" />
        ) : (
          <Video className="size-3.5 text-emerald-500" />
        )}
      </div>
    </div>
  );
}
