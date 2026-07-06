"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Loader2, Plus, Search, Swords, Trophy } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import {
  useFriendChallengeHub,
  useFriendChallengeMutations,
  useFriendChallengeOpponentSearch,
} from "@/modules/student/application/hooks/useFriendChallengeHub";
import type { FriendChallengeSearchOpponent } from "@/modules/student/domain/friend-challenge/friend-challenge.types";
import { sessionRouteForPhase } from "@/modules/student/domain/friend-challenge/friend-challenge.utils";
import { FriendChallengeListCard } from "./FriendChallengeCards";
import { FriendChallengeCreateModal } from "./FriendChallengeCreateModal";
import { FriendChallengeErrorModal } from "./FriendChallengeErrorModal";
import { FriendChallengeInviteModal } from "./FriendChallengeInviteModal";
import { ApiFailureAlert } from "@/shared/presentation/components/ui/ApiFailureAlert";
import { Button } from "@/shared/presentation/components/ui/button";
import { ROUTES } from "@/shared/infrastructure/config/routes";

export function FriendChallengeHubDashboard() {
  const t = useTranslations("student.friendChallenge");
  const locale = useLocale();
  const router = useRouter();
  const { hub, isLoading, errorMessage, refreshAll, activeSessionQuery } = useFriendChallengeHub();
  const mutations = useFriendChallengeMutations();

  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedOpponent, setSelectedOpponent] = useState<FriendChallengeSearchOpponent | null>(
    null,
  );
  const [inviteChallengeId, setInviteChallengeId] = useState<string | null>(null);
  const [apiError, setApiError] = useState<{ message: string; errorCode?: string | null } | null>(
    null,
  );

  const opponentsQuery = useFriendChallengeOpponentSearch(search);

  const recentResults = useMemo(() => {
    if (!hub) return [];
    return [...hub.wins.slice(0, 3), ...hub.losses.slice(0, 3)];
  }, [hub]);

  const formatNumber = (value: number) =>
    new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US").format(value);

  const handleMutationError = (error: unknown) => {
    const err = error as Error & { errorCode?: string | null };
    setApiError({ message: err.message, errorCode: err.errorCode ?? null });
  };

  const navigateToChallenge = (challengeId: string) => {
    router.push(ROUTES.USER.STUDENT.FRIEND_CHALLENGES.DETAIL(challengeId));
  };

  const handleEnter = async (challengeId: string) => {
    try {
      const result = await mutations.enterMutation.mutateAsync({ challengeId });
      router.push(sessionRouteForPhase(result.sessionId, result.phase));
    } catch (error) {
      handleMutationError(error);
    }
  };

  useEffect(() => {
    const active = activeSessionQuery.data;
    if (!active?.sessionId) return;
    router.replace(sessionRouteForPhase(active.sessionId, active.phase));
  }, [activeSessionQuery.data, router]);

  if (isLoading && !hub) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-[#2b415e]" aria-hidden />
        <span className="sr-only">{t("common.loading")}</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="text-start">
          <h1 className="text-3xl font-bold text-[#2b415e]">{t("page.title")}</h1>
          {hub?.schoolRank.rank != null ? (
            <p className="mt-2 text-sm text-[#64748b]">
              {t("hub.schoolRank")}:{" "}
              {t("hub.schoolRankValue", {
                rank: formatNumber(hub.schoolRank.rank),
                school: hub.schoolRank.schoolName ?? "",
              })}
            </p>
          ) : (
            <p className="mt-2 text-sm text-[#64748b]">{t("hub.noSchoolRank")}</p>
          )}
        </div>
        <Link
          href={ROUTES.USER.STUDENT.FRIEND_CHALLENGES.HISTORY}
          className="text-sm font-bold text-[#2b415e] underline-offset-4 hover:underline"
        >
          {t("hub.viewHistory")}
        </Link>
      </div>

      {errorMessage ? (
        <ApiFailureAlert message={errorMessage} fallbackMessage={t("common.loading")} />
      ) : null}

      {hub ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard icon={Trophy} label={t("hub.wins")} value={formatNumber(hub.stats.wins)} />
          <StatCard
            icon={Swords}
            label={t("hub.losses")}
            value={formatNumber(hub.stats.losses)}
          />
          <StatCard
            icon={Search}
            label={t("hub.pending")}
            value={formatNumber(hub.stats.pendingCount)}
          />
          <StatCard
            icon={Plus}
            label={t("hub.upcoming")}
            value={formatNumber(hub.stats.upcomingCount)}
            highlight
          />
        </div>
      ) : null}

      <div className="rounded-2xl border border-[#e2e8f0] bg-white p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute start-4 top-1/2 size-4 -translate-y-1/2 text-[#94a3b8]" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("hub.searchPlaceholder")}
            className="w-full rounded-xl border border-[#e2e8f0] bg-[#f8fafc] py-3 ps-11 pe-4 text-start text-sm outline-none focus:border-[#c7af6d]"
          />
        </div>

        {search.trim().length >= 2 && opponentsQuery.data?.length ? (
          <ul className="mt-3 divide-y divide-[#f1f5f9]">
            {opponentsQuery.data.map((opponent) => (
              <li key={opponent.studentUserId}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedOpponent(opponent);
                    setCreateOpen(true);
                  }}
                  className="flex w-full items-center justify-between gap-3 py-3 text-start hover:bg-[#f8fafc]"
                >
                  <span className="font-semibold text-[#2b415e]">{opponent.fullName}</span>
                  <span className="text-xs text-[#64748b]">{opponent.schoolName}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <Section title={t("hub.sections.pending")} empty={t("hub.empty.pending")} items={hub?.pending ?? []}>
        {(item) => (
          <FriendChallengeListCard
            item={item}
            isLoading={mutations.acceptMutation.isPending}
            onAccept={
              item.canAccept
                ? () => setInviteChallengeId(item.friendChallengeId)
                : undefined
            }
            onDecline={() =>
              mutations.declineMutation.mutate(item.friendChallengeId, {
                onError: handleMutationError,
              })
            }
            onCancel={() =>
              mutations.cancelMutation.mutate(item.friendChallengeId, {
                onError: handleMutationError,
              })
            }
            onView={() => navigateToChallenge(item.friendChallengeId)}
          />
        )}
      </Section>

      <Section title={t("hub.sections.upcoming")} empty={t("hub.empty.upcoming")} items={hub?.upcoming ?? []}>
        {(item) => (
          <FriendChallengeListCard
            item={item}
            isLoading={mutations.enterMutation.isPending}
            onEnter={() => void handleEnter(item.friendChallengeId)}
            onView={() =>
              router.push(ROUTES.USER.STUDENT.FRIEND_CHALLENGES.UPCOMING(item.friendChallengeId))
            }
          />
        )}
      </Section>

      <Section title={t("hub.sections.recent")} empty={t("hub.empty.recent")} items={recentResults}>
        {(item) => (
          <FriendChallengeListCard
            item={item}
            onView={() => navigateToChallenge(item.friendChallengeId)}
          />
        )}
      </Section>

      <button
        type="button"
        onClick={() => setCreateOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#dbe3f3] bg-white py-8 text-[#2b415e] transition hover:border-[#c7af6d] hover:bg-[#faf8f2]"
      >
        <Plus className="size-5" />
        <span className="font-bold">{t("hub.newChallenge")}</span>
      </button>

      <FriendChallengeCreateModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        opponent={selectedOpponent}
        onSuccess={() => {
          setCreateOpen(false);
          setSelectedOpponent(null);
          void refreshAll();
        }}
        onError={handleMutationError}
      />

      <FriendChallengeInviteModal
        challengeId={inviteChallengeId}
        onClose={() => setInviteChallengeId(null)}
        onAccepted={() => {
          setInviteChallengeId(null);
          void refreshAll();
        }}
        onError={handleMutationError}
      />

      <FriendChallengeErrorModal
        error={apiError}
        onClose={() => setApiError(null)}
        onRefresh={() => void refreshAll()}
      />

      {errorMessage ? (
        <Button type="button" variant="outline" onClick={() => void refreshAll()}>
          {t("common.retry")}
        </Button>
      ) : null}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon: typeof Trophy;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${highlight ? "border-[#c7af6d]/30 bg-[#faf6eb]" : "border-[#e2e8f0] bg-white"}`}
    >
      <div className="flex items-center gap-2 text-[#64748b]">
        <Icon className="size-4" aria-hidden />
        <span className="text-xs font-semibold">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-extrabold text-[#2b415e]">{value}</p>
    </div>
  );
}

function Section<T extends { friendChallengeId: string }>({
  title,
  empty,
  items,
  children,
}: {
  title: string;
  empty: string;
  items: T[];
  children: (item: T) => React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-start text-xl font-bold text-[#2b415e]">{title}</h2>
      {items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[#e2e8f0] bg-white p-8 text-center text-sm text-[#64748b]">
          {empty}
        </p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">{items.map((item) => children(item))}</div>
      )}
    </section>
  );
}
