"use client";

import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { cn } from "@/shared/application/lib/cn";
import { UserAvatarImageOrInitials } from "@/shared/presentation/components/user/UserAvatarImageOrInitials";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import type { SchoolEventCard as SchoolEventCardModel } from "@/modules/student/domain/types/schoolEvent.types";

type SchoolEventCardProps = {
  event: SchoolEventCardModel;
};

const statusBadgeClass: Record<SchoolEventCardModel["status"], string> = {
  Live: "bg-[#58cc02] text-white",
  Published: "bg-[#2b415e] text-white",
  Draft: "bg-[#dee2e6] text-[#0f172a]",
  Ended: "bg-[#94a3b8] text-white",
};

function eventHref(event: SchoolEventCardModel): string | null {
  if (event.actionType === "ComingSoon") return null;
  return ROUTES.USER.STUDENT.EVENT_LIVE(event.id);
}

export function SchoolEventCard({ event }: SchoolEventCardProps) {
  const href = eventHref(event);
  const isPrimaryAction =
    event.actionType === "ViewLive" || event.actionType === "ViewEvent";
  const isEnded = event.status === "Ended";

  const actionClass = cn(
    "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-bold transition-all",
    isPrimaryAction
      ? "bg-[#c7af6d] text-white shadow-[0px_4px_0px_#a38f5a] hover:translate-y-0.5 hover:shadow-none"
      : "border-2 border-[#e2e8f0] bg-[#f8fafc] text-[#2b415e] hover:bg-white",
    !href && "cursor-not-allowed opacity-60",
  );

  return (
    <article
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-[20px] bg-white shadow-[0px_8px_0px_0px_rgba(0,0,0,0.05)]",
        isEnded && "opacity-80",
      )}
    >
      <div className="relative h-48 w-full overflow-hidden bg-[#e2e8f0]">
        {event.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={event.coverImageUrl}
            alt=""
            className="size-full object-cover"
          />
        ) : null}

        <span
          className={cn(
            "absolute start-4 top-4 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide",
            statusBadgeClass[event.status],
          )}
        >
          {event.statusLabel}
        </span>

        <span className="absolute bottom-4 end-4 rounded-lg bg-black/50 px-2 py-1 text-[10px] font-medium text-white backdrop-blur-[6px]">
          {event.categoryLabel}
        </span>
      </div>

      <div className="flex flex-1 flex-col justify-between gap-4 p-6">
        <div className="space-y-3 text-start">
          <h3 className="text-xl font-bold leading-7 text-[#0f172a]">{event.title}</h3>
          <div className="flex items-center gap-2 text-sm text-[#64748b]">
            <CalendarDays className="size-3.5 shrink-0" aria-hidden />
            <span>{event.dateRangeLabel}</span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t-2 border-[#e2e8f0] pt-[18px]">
          {href ? (
            <Link href={href} className={actionClass}>
              {event.actionLabel}
            </Link>
          ) : (
            <span className={actionClass}>{event.actionLabel}</span>
          )}

          <div className="flex items-center">
            {event.participantPreview.length === 0 ? (
              <span className="inline-flex size-8 items-center justify-center rounded-full border-2 border-white bg-[#dee2e6] text-[10px] font-bold text-[#0f172a]">
                —
              </span>
            ) : (
              event.participantPreview.slice(0, 2).map((participant, index) => (
                <div
                  key={`${event.id}-p-${index}`}
                  className={index > 0 ? "-ms-2" : undefined}
                >
                  <UserAvatarImageOrInitials
                    trackKey={`${event.id}-p-${index}`}
                    imageUrl={participant.profileImageUrl}
                    name={participant.fullName ?? "?"}
                    size="sm"
                    circleClassName="!h-8 !w-8 border-2 border-white text-[10px]"
                  />
                </div>
              ))
            )}
            {event.participantCount > 0 ? (
              <span className="-ms-2 inline-flex size-8 items-center justify-center rounded-full border-2 border-white bg-[#dee2e6] text-[10px] font-bold text-[#0f172a]">
                +{event.participantCount}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
