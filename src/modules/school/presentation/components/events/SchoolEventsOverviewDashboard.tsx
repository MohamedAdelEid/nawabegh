"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { CalendarDays, Plus } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import {
  useSchoolEventsList,
} from "@/modules/school/application/hooks/useSchoolEvents";
import type {
  SchoolEventCard,
  SchoolEventStatusFilter,
} from "@/modules/school/domain/types/schoolEvents.types";
import { cn } from "@/shared/application/lib/cn";
import { formatDate, formatNumber } from "@/shared/application/lib/format";
import { resolveFileUrl } from "@/shared/infrastructure/files/fileUrl";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { DashboardPageHeader } from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";
import { UserAvatarImageOrInitials } from "@/shared/presentation/components/user/UserAvatarImageOrInitials";
import { SchoolEventsOverviewSkeleton } from "./SchoolEventsSkeletons";

const TABS: SchoolEventStatusFilter[] = [
  "all",
  "ongoing",
  "published",
  "draft",
  "finished",
];

const PAGE_SIZE = 9;

function statusTone(status: SchoolEventCard["status"]) {
  if (status === "Ongoing") return "bg-emerald-500 text-white";
  if (status === "Published") return "bg-sky-600 text-white";
  if (status === "Draft") return "bg-slate-200 text-slate-700";
  if (status === "Finished") return "bg-slate-500 text-white";
  return "bg-slate-400 text-white";
}

function EventCard({
  event,
  locale,
}: {
  event: SchoolEventCard;
  locale: string;
}) {
  const t = useTranslations("school.dashboard.events.overview");
  const cover = resolveFileUrl(event.coverImageUrl);
  const dateText =
    event.dateLabel ||
    [event.startsAt, event.endsAt]
      .filter(Boolean)
      .map((value) => formatDate(value as string, locale))
      .join(" - ");

  const primaryHref =
    event.status === "Draft"
      ? ROUTES.USER.SCHOOL.EVENTS.EDIT(event.id)
      : ROUTES.USER.SCHOOL.EVENTS.VIEW(event.id);

  const primaryLabel =
    event.status === "Draft"
      ? t("actions.editDraft")
      : event.status === "Finished"
        ? t("actions.viewReports")
        : t("actions.manage");

  const primaryClass =
    event.status === "Draft" || event.status === "Finished"
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
          {t(`status.${event.status}`)}
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
            <Link href={primaryHref}>{primaryLabel}</Link>
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
                {t("participants", {
                  count: formatNumber(event.participantCount, locale),
                })}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export function SchoolEventsOverviewDashboard() {
  const t = useTranslations("school.dashboard.events.overview");
  const common = useTranslations("school.dashboard.events.common");
  const locale = useLocale();
  const [status, setStatus] = useState<SchoolEventStatusFilter>("all");
  const [pageNumber, setPageNumber] = useState(1);
  const [accumulated, setAccumulated] = useState<SchoolEventCard[]>([]);

  const query = useSchoolEventsList({
    status,
    pageNumber,
    pageSize: PAGE_SIZE,
  });

  const pageItems = query.data?.items ?? [];
  const items = useMemo(() => {
    if (pageNumber === 1) return pageItems;
    const seen = new Set(accumulated.map((item) => item.id));
    const merged = [...accumulated];
    for (const item of pageItems) {
      if (!seen.has(item.id)) merged.push(item);
    }
    return merged;
  }, [accumulated, pageItems, pageNumber]);

  const totalCount = query.data?.totalCount ?? items.length;
  const hasNext = query.data?.hasNext ?? false;

  const selectStatus = (next: SchoolEventStatusFilter) => {
    setStatus(next);
    setPageNumber(1);
    setAccumulated([]);
  };

  const loadMore = () => {
    if (!query.data) return;
    setAccumulated(items);
    setPageNumber((current) => current + 1);
  };

  if (query.isLoading && pageNumber === 1) {
    return <SchoolEventsOverviewSkeleton />;
  }

  if (query.isError && items.length === 0) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
        <p>{common("loadError")}</p>
        <Button className="mt-4" variant="outline" onClick={() => void query.refetch()}>
          {common("retry")}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardPageHeader title={t("title")} description={t("subtitle")} />

      <div
        role="tablist"
        className="flex flex-wrap gap-1 border-b border-slate-200"
      >
        {TABS.map((tab) => {
          const selected = tab === status;
          return (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => selectStatus(tab)}
              className={cn(
                "relative min-h-11 px-4 py-2 text-sm font-semibold transition-colors",
                selected ? "text-[#1e3a5f]" : "text-slate-500 hover:text-slate-700",
              )}
            >
              {t(`tabs.${tab}`)}
              {selected ? (
                <motion.span
                  layoutId="school-events-tab"
                  className="absolute inset-x-2 -bottom-px h-1 rounded-full bg-[#1e3a5f]"
                />
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex min-h-80 flex-col items-center justify-center rounded-[1.5rem] border-2 border-dashed border-slate-300 bg-slate-50/80 p-6 text-center"
        >
          <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-sky-100 text-sky-700">
            <Plus className="size-7" />
          </div>
          <h3 className="text-lg font-bold text-[#1e3a5f]">{t("addCard.title")}</h3>
          <p className="mt-2 max-w-xs text-sm text-slate-500">{t("addCard.description")}</p>
          <Button asChild className="mt-5 rounded-xl bg-[#1e3a5f] text-white hover:translate-y-0 hover:bg-[#163049]">
            <Link href={ROUTES.USER.SCHOOL.EVENTS.CREATE}>{t("addCard.title")}</Link>
          </Button>
        </motion.div>

        {items.map((event) => (
          <EventCard key={event.id} event={event} locale={locale} />
        ))}
      </div>

      {items.length === 0 ? (
        <p className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
          {t("empty")}
        </p>
      ) : null}

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3 text-sm text-slate-600">
          <span>
            {t("summary", {
              visible: formatNumber(items.length, locale),
              total: formatNumber(totalCount, locale),
            })}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-[#1e3a5f] transition-all"
            style={{
              width: `${Math.min(100, totalCount ? (items.length / totalCount) * 100 : 0)}%`,
            }}
          />
        </div>
        {hasNext ? (
          <div className="flex justify-center">
            <Button
              variant="outline"
              className="min-h-12 rounded-xl border-[#1e3a5f]/30 px-8 text-[#1e3a5f] hover:translate-y-0"
              onClick={loadMore}
              disabled={query.isFetching}
            >
              {query.isFetching ? common("loading") : t("loadMore")}
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
