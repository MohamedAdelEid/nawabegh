"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Heart, MapPin, MessageSquare, Zap } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import {
  useTeacherCommunityAuthor,
  type CommunityAuthorTab,
} from "@/modules/teacher/application/hooks/useTeacherCommunityAuthor";
import { CommunityFollowButton } from "@/shared/presentation/components/community/CommunityFollowButton";
import { CommunityFeedPostCard } from "@/shared/presentation/components/community/CommunityFeedPostCard";
import { formatCommunityRelativeTime } from "@/modules/teacher/domain/utils/knowledgeCommunityMappers";
import { useScopedDashboardRoutes } from "@/shared/application/hooks/useScopedDashboardRoutes";
import { CommunityMediaImage, resolveCommunityFileUrl } from "@/shared/presentation/components/community/CommunityMediaImage";
import {
  CommunityPageShell,
  CommunitySidebarCard,
} from "@/shared/presentation/components/community/CommunityPageShell";
import { CommunityNewsletterWidget } from "@/shared/presentation/components/community/CommunitySidebarWidgets";
import { cn } from "@/shared/application/lib/cn";
import { TeacherCommunityAuthorProfileSkeleton } from "@/modules/teacher/presentation/components/knowledge-community/TeacherCommunityAuthorProfileSkeleton";
import { UserAvatarImageOrInitials } from "@/shared/presentation/components/user";
import { ApiFailureAlert } from "@/shared/presentation/components/ui/ApiFailureAlert";

export function TeacherCommunityAuthorProfileView({ authorId }: { authorId: string }) {
  const t = useTranslations("teacher.dashboard.knowledgeCommunity.author");
  const tCommon = useTranslations("teacher.dashboard");
  const locale = useLocale();
  const routes = useScopedDashboardRoutes();
  const [tab, setTab] = useState<CommunityAuthorTab>("all");
  const { profile, articles, loading, error, setFollowing } = useTeacherCommunityAuthor(authorId, tab);

  const postsWithAuthor = useMemo(() => {
    if (!profile) return [];
    return articles.map((article) => ({
      ...article,
      authorName: profile.fullName,
      authorAvatarImageUrl: profile.avatarUrl,
      authorUserId: profile.userId,
      authorRole: profile.specialty,
    }));
  }, [articles, profile]);

  if (loading) {
    return <TeacherCommunityAuthorProfileSkeleton label={tCommon("common.loading")} />;
  }

  if (error || !profile) {
    return <ApiFailureAlert message={error ?? t("notFound")} fallbackMessage={t("notFound")} />;
  }

  const tabs: Array<{ id: CommunityAuthorTab; label: string }> = [
    { id: "all", label: t("tabs.all") },
    { id: "mostRead", label: t("tabs.mostRead") },
    { id: "topRated", label: t("tabs.topRated") },
  ];

  return (
    <CommunityPageShell
      title={t("pageTitle")}
      subtitle={profile.fullName}
      sidebar={
        <>
          <CommunitySidebarCard title={t("badges.title")}>
            {profile.earnedBadges.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {profile.earnedBadges.map((badge) => (
                  <div key={badge.badgeId} className="rounded-2xl bg-slate-50 p-4 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                      {badge.iconUrl ? (
                        <img
                          src={resolveCommunityFileUrl(badge.iconUrl) ?? undefined}
                          alt={badge.name}
                          className="h-8 w-8 rounded-xl object-cover"
                        />
                      ) : (
                        <Zap className="h-5 w-5" />
                      )}
                    </div>
                    <p className="mt-2 text-xs font-semibold text-slate-600">{badge.name}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-right text-sm text-slate-500">{t("badges.empty")}</p>
            )}
          </CommunitySidebarCard>

          {profile.skills.length > 0 ? (
            <CommunitySidebarCard title={t("skills.title")}>
              <div className="flex flex-wrap justify-end gap-2">
                {profile.skills.map((skill) => (
                  <span
                    key={skill.name}
                    className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </CommunitySidebarCard>
          ) : null}

          <CommunitySidebarCard title={t("stats.title")}>
            <ul className="space-y-3 text-right text-sm text-slate-600">
              <li className="flex items-center justify-between gap-3">
                <span>{profile.publishedArticlesCount.toLocaleString()}</span>
                <span>{t("stats.articles")}</span>
              </li>
              <li className="flex items-center justify-between gap-3">
                <span>{profile.followersCount.toLocaleString()}</span>
                <span>{t("stats.followers")}</span>
              </li>
              <li className="flex items-center justify-between gap-3">
                <span>{profile.followingCount.toLocaleString()}</span>
                <span>{t("stats.following")}</span>
              </li>
              <li className="flex items-center justify-between gap-3">
                <span>{profile.interactionsCount.toLocaleString()}</span>
                <span>{t("stats.interactions")}</span>
              </li>
            </ul>
          </CommunitySidebarCard>

          <CommunityNewsletterWidget />
        </>
      }
    >
      <nav className="text-right text-sm text-slate-500">
        <Link href={routes.knowledgeCommunity.LIST} className="hover:text-[#2C4260]">
          {t("breadcrumbs.home")}
        </Link>
        <span className="mx-2">›</span>
        <span className="text-[#2C4260]">{t("breadcrumbs.current")}</span>
      </nav>

      <section className="overflow-hidden rounded-[1.5rem] border border-white/80 bg-white shadow-[var(--dashboard-shadow-soft)]">
        <div className="relative h-40 bg-gradient-to-l from-[#2C4260] to-[#4a6282]">
          {profile.bannerImageUrl ? (
            <CommunityMediaImage
              src={profile.bannerImageUrl}
              alt={profile.fullName}
              className="h-full w-full object-cover"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
        </div>

        <div className="relative px-6 pb-6 pt-0">
          <div className="-mt-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-col items-end gap-4 sm:flex-row sm:items-end">
              <UserAvatarImageOrInitials
                trackKey={profile.userId}
                name={profile.fullName}
                imageUrl={profile.avatarUrl}
                size="xxl"
                circleClassName="border-4 border-white bg-[#2C4260] text-white shadow-lg"
              />
              <div className="space-y-2 text-right">
                <h2 className="text-2xl font-bold text-[#2C4260]">{profile.fullName}</h2>
                <p className="text-sm font-medium text-slate-600">{profile.specialty}</p>
                {profile.bio ? (
                  <p className="max-w-2xl text-sm leading-7 text-slate-500">{profile.bio}</p>
                ) : null}
                <div className="flex flex-wrap items-center justify-end gap-4 text-xs text-slate-500">
                  {profile.location ? (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {profile.location}
                    </span>
                  ) : null}
                  {profile.joinedAtLabel ? (
                    <span>
                      {t("joined", {
                        date: formatCommunityRelativeTime(profile.joinedAtLabel, locale),
                      })}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3">
              <CommunityFollowButton
                userId={profile.userId}
                isFollowing={profile.isFollowing}
                onFollowingChange={setFollowing}
                className="gap-2"
              />
              <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700">
                <Zap className="h-4 w-4" />
                {t("points", { count: profile.points })}
              </span>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: t("stats.articles"), value: profile.publishedArticlesCount, icon: MessageSquare },
              { label: t("stats.followers"), value: profile.followersCount, icon: Heart },
              { label: t("stats.following"), value: profile.followingCount, icon: Heart },
              { label: t("stats.interactions"), value: profile.interactionsCount, icon: Zap },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl bg-slate-50 px-4 py-5 text-center">
                <item.icon className="mx-auto mb-2 h-5 w-5 text-[#2C4260]/70" />
                <p className="text-2xl font-bold text-[#2C4260]">{item.value.toLocaleString()}</p>
                <p className="mt-1 text-sm text-slate-500">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-xl font-bold text-[#2C4260]">{t("articlesTitle")}</h3>
          <div className="flex flex-wrap justify-center gap-2">
            {tabs.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={cn(
                  "rounded-full px-5 py-2 text-sm font-medium transition",
                  tab === item.id
                    ? "bg-[#2C4260] text-white"
                    : "bg-white text-slate-600 ring-1 ring-slate-200",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {postsWithAuthor.length > 0 ? (
          <div className="grid gap-4">
            {postsWithAuthor.map((post) => (
              <CommunityFeedPostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500">
            {t("emptyArticles")}
          </div>
        )}
      </section>
    </CommunityPageShell>
  );
}
