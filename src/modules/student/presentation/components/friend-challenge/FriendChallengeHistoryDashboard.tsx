"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useFriendChallengeHistory } from "@/modules/student/application/hooks/useFriendChallengeHub";
import type { FriendChallengeHistoryTab } from "@/modules/student/domain/friend-challenge/friend-challenge.types";
import { FriendChallengeListCard } from "./FriendChallengeCards";
import { cn } from "@/shared/application/lib/cn";
import { ROUTES } from "@/shared/infrastructure/config/routes";

const TABS: FriendChallengeHistoryTab[] = [
  "pending",
  "upcoming",
  "wins",
  "losses",
  "cancelled",
];

export function FriendChallengeHistoryDashboard() {
  const t = useTranslations("student.friendChallenge");
  const locale = useLocale();
  const [activeTab, setActiveTab] = useState<FriendChallengeHistoryTab>("upcoming");
  const [search, setSearch] = useState("");
  const { items, hub, isLoading, refreshAll } = useFriendChallengeHistory(activeTab);

  const formatNumber = (value: number) =>
    new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US").format(value);

  const filteredItems = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return items;
    return items.filter(
      (item) =>
        item.opponent.fullName.toLowerCase().includes(keyword) ||
        item.subjectName.toLowerCase().includes(keyword) ||
        item.title.toLowerCase().includes(keyword),
    );
  }, [items, search]);

  const totalCount = hub
    ? hub.pending.length +
      hub.upcoming.length +
      hub.wins.length +
      hub.losses.length +
      hub.cancelled.length
    : 0;

  if (isLoading && !hub) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-[#2b415e]" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="text-start">
        <h1 className="text-3xl font-bold text-[#2b415e]">{t("page.historyTitle")}</h1>
        <p className="mt-2 text-[#64748b]">{t("history.subtitle")}</p>
      </div>

      {hub ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label={t("history.stats.total")} value={formatNumber(totalCount)} />
          <StatCard label={t("history.stats.wins")} value={formatNumber(hub.stats.wins)} />
          <StatCard label={t("history.stats.losses")} value={formatNumber(hub.stats.losses)} />
          <StatCard
            label={t("history.stats.upcoming")}
            value={formatNumber(hub.stats.upcomingCount)}
            highlight
          />
        </div>
      ) : null}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={t("history.searchPlaceholder")}
          className="w-full max-w-md rounded-xl border border-[#e2e8f0] bg-white px-4 py-3 text-start text-sm outline-none focus:border-[#c7af6d] sm:flex-1"
        />
        <button type="button" className="rounded-xl border border-[#e2e8f0] px-4 py-3 text-sm font-semibold text-[#64748b]">
          {t("history.filter")}
        </button>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-[#e2e8f0] pb-1">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={cn(
              "rounded-t-lg px-4 py-2 text-sm font-bold transition",
              activeTab === tab
                ? "border-b-2 border-[#2b415e] text-[#2b415e]"
                : "text-[#64748b] hover:text-[#2b415e]",
            )}
          >
            {t(`history.tabs.${tab}`)}
          </button>
        ))}
      </div>

      {filteredItems.length === 0 ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <Link
            href={ROUTES.USER.STUDENT.FRIEND_CHALLENGES.HUB}
            className="flex min-h-[280px] flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-[#dbe3f3] bg-white p-8 text-center transition hover:border-[#c7af6d]"
          >
            <span className="flex size-14 items-center justify-center rounded-full bg-[#dbe3f3] text-[#2b415e]">
              <Plus className="size-7" />
            </span>
            <p className="font-bold text-[#2b415e]">{t("history.newChallengeCard.title")}</p>
            <p className="text-sm text-[#64748b]">{t("history.newChallengeCard.subtitle")}</p>
          </Link>
          <p className="flex items-center justify-center rounded-2xl border border-dashed border-[#e2e8f0] bg-white p-8 text-sm text-[#64748b] lg:col-span-2">
            {t(`hub.empty.${activeTab}`)}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {filteredItems.map((item) => (
            <FriendChallengeListCard
              key={item.friendChallengeId}
              item={item}
              onView={() =>
                window.location.assign(
                  ROUTES.USER.STUDENT.FRIEND_CHALLENGES.DETAIL(item.friendChallengeId),
                )
              }
            />
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => void refreshAll()}
        className="text-sm font-semibold text-[#2b415e] underline-offset-4 hover:underline"
      >
        {t("common.retry")}
      </button>
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-4",
        highlight ? "border-[#c7af6d]/30 bg-[#faf6eb]" : "border-[#e2e8f0] bg-white",
      )}
    >
      <p className="text-xs font-semibold text-[#64748b]">{label}</p>
      <p className="mt-2 text-2xl font-extrabold text-[#2b415e]">{value}</p>
    </div>
  );
}
