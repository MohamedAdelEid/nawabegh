"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { CalendarDays } from "lucide-react";
import { useLocale } from "next-intl";
import { cn } from "@/shared/application/lib/cn";
import { formatDate, formatNumber } from "@/shared/application/lib/format";
import { resolveFileUrl } from "@/shared/infrastructure/files/fileUrl";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { Button } from "@/shared/presentation/components/ui/button";
import { UserAvatarImageOrInitials } from "@/shared/presentation/components/user/UserAvatarImageOrInitials";
import type { SchoolEventCard as SchoolEventCardModel } from "@/modules/student/domain/types/schoolEvent.types";

type SchoolEventCardProps = {
  event: SchoolEventCardModel;
  statusLabel: string;
  participantsLabel: (count: string) => string;
};

function statusTone(status: SchoolEventCardModel["status"]) {
  if (status === "Ongoing") return "bg-emerald-500 text-white";
  if (status === "Published") return "bg-sky-600 text-white";
  return "bg-slate-500 text-white";
}

export function SchoolEventCard({
  event,
  statusLabel,
  participantsLabel,
}: SchoolEventCardProps) {
  const locale = useLocale();
  const cover = resolveFileUrl(event.coverImageUrl);
  const dateText =
    event.dateLabel ||
    [event.startsAt, event.endsAt]
      .filter(Boolean)
      .map((value) => formatDate(value as string, locale))
      .join(" - ");

  const href = ROUTES.USER.STUDENT.EVENT_LIVE(String(event.id));
  const isRegister = event.actionType === "Register";
  const primaryClass = isRegister
    ? "bg-[#c4a574] text-white hover:bg-[#b39463]"
    : event.status === "Finished"
      ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
      : "bg-[#c4a574] text-white hover:bg-[#b39463]";

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[1.5rem] border border-slate-200 bg-white shadow-sm"
    >
      <div className="relative aspect-[16/9] overflow-hidden rounded-t-[1.5rem] bg-slate-100">
        {cover ? (
          <Image
            src={cover}
            alt={event.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-200 to-slate-100">
            <CalendarDays className="size-10 text-slate-400" />
          </div>
        )}
        <span
          className={cn(
            "absolute end-3 top-3 rounded-full px-3 py-1 text-xs font-semibold",
            statusTone(event.status),
          )}
        >
          {statusLabel}
        </span>
        {event.typeLabel ? (
          <span className="absolute bottom-3 start-3 rounded-lg bg-slate-900/80 px-3 py-1 text-xs font-medium text-white">
            {event.typeLabel}
          </span>
        ) : null}
      </div>

      <div className="space-y-4 p-5">
        <div className="space-y-2">
          <h3 className="line-clamp-2 text-lg font-bold text-[#1e3a5f]">
            {event.title}
          </h3>
          {dateText ? (
            <p className="flex items-center gap-2 text-sm text-slate-500">
              <CalendarDays className="size-4 shrink-0" />
              <span>{dateText}</span>
            </p>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-3">
          <Button
            asChild
            className={cn(
              "min-h-11 rounded-xl px-4 hover:translate-y-0",
              primaryClass,
            )}
          >
            <Link href={href}>{event.actionLabel}</Link>
          </Button>
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2 space-x-reverse">
              {event.participantPreview.slice(0, 3).map((participant) => (
                <UserAvatarImageOrInitials
                  key={participant.id}
                  trackKey={participant.id}
                  name={participant.fullName}
                  imageUrl={resolveFileUrl(participant.avatarUrl)}
                  size="sm"
                  circleClassName="ring-2 ring-white"
                />
              ))}
            </div>
            {event.participantCount > 0 ? (
              <span className="text-sm font-semibold text-slate-600">
                {participantsLabel(formatNumber(event.participantCount, locale))}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </motion.article>
  );
}
