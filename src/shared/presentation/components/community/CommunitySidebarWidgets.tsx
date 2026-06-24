"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, Trophy } from "lucide-react";
import { useTranslations } from "next-intl";
import { subscribeCommunityNewsletter } from "@/modules/admin/infrastructure/api/communityArticlesApi";
import type { CommunityBadgeRow } from "@/modules/admin/domain/types/communityBadges.types";
import type {
  CommunityAuthorSummary,
  CommunityFeedPost,
} from "@/modules/teacher/domain/types/knowledgeCommunity.types";
import { notify } from "@/shared/application/lib/toast";
import { useScopedDashboardRoutes } from "@/shared/application/hooks/useScopedDashboardRoutes";
import { Button } from "@/shared/presentation/components/ui/button";
import { UserAvatarImageOrInitials } from "@/shared/presentation/components/user";
import { CommunitySidebarCard } from "./CommunityPageShell";

export function CommunityTopArticlesWidget({ articles }: { articles: CommunityFeedPost[] }) {
  const t = useTranslations("teacher.dashboard.knowledgeCommunity.sidebar.topArticles");
  const routes = useScopedDashboardRoutes();

  return (
    <CommunitySidebarCard title={t("title")} icon={<Trophy className="h-4 w-4 text-amber-500" />}>
      <ol className="space-y-4">
        {articles.map((article, index) => (
          <li key={article.id} className="flex items-start gap-3 text-right">
            <span className="mt-1 text-sm font-bold text-amber-500">#{index + 1}</span>
            <div className="min-w-0 flex-1">
              <Link
                href={routes.knowledgeCommunity.ARTICLE(article.id)}
                className="line-clamp-2 font-semibold text-[#2C4260] hover:underline"
              >
                {article.title}
              </Link>
              <p className="text-xs text-slate-500">
                {article.authorName} • {t("readTime", { minutes: article.readTimeMinutes })}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </CommunitySidebarCard>
  );
}

export function CommunityTopAuthorsWidget({ authors }: { authors: CommunityAuthorSummary[] }) {
  const t = useTranslations("teacher.dashboard.knowledgeCommunity.sidebar.topAuthors");
  const routes = useScopedDashboardRoutes();

  return (
    <CommunitySidebarCard title={t("title")} icon={<Sparkles className="h-4 w-4 text-amber-500" />}>
      <ul className="space-y-4">
        {authors.map((author) => (
          <li key={author.userId} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <UserAvatarImageOrInitials
                trackKey={author.userId}
                name={author.fullName}
                imageUrl={author.avatarUrl}
                size="sm"
              />
              <div className="text-right">
                <Link
                  href={routes.knowledgeCommunity.AUTHOR(author.userId)}
                  className="font-semibold text-[#2C4260] hover:underline"
                >
                  {author.fullName}
                </Link>
                <p className="text-xs text-slate-500">
                  {t("stats", { articles: author.articlesCount, followers: author.followersCount })}
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="rounded-full">
              {t("follow")}
            </Button>
          </li>
        ))}
      </ul>
    </CommunitySidebarCard>
  );
}

export function CommunityBadgesWidget({ badges }: { badges: CommunityBadgeRow[] }) {
  const t = useTranslations("teacher.dashboard.knowledgeCommunity.sidebar.badges");

  return (
    <CommunitySidebarCard title={t("title")}>
      <div className="grid grid-cols-4 gap-3">
        {badges.map((badge, index) => {
          const locked = index > 4;
          return (
            <div key={badge.id} className="text-center">
              <div
                className={`mx-auto flex h-12 w-12 items-center justify-center rounded-2xl ${
                  locked ? "bg-slate-100 text-slate-300" : "bg-amber-50 text-amber-600"
                }`}
              >
                <Trophy className="h-5 w-5" />
              </div>
              <p className="mt-2 line-clamp-2 text-[10px] font-medium text-slate-500">{badge.name}</p>
            </div>
          );
        })}
      </div>
      <button type="button" className="mt-4 w-full text-center text-xs font-semibold text-[#2C4260]">
        {t("viewAll")}
      </button>
    </CommunitySidebarCard>
  );
}

export function CommunityNewsletterWidget() {
  const t = useTranslations("teacher.dashboard.knowledgeCommunity.sidebar.newsletter");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!email.trim()) return;
    setSubmitting(true);
    const result = await subscribeCommunityNewsletter(email.trim());
    setSubmitting(false);
    if (result.errorMessage) {
      notify.error(result.errorMessage);
      return;
    }
    notify.success(t("success"));
    setEmail("");
  };

  return (
    <CommunitySidebarCard title={t("title")}>
      <p className="mb-4 text-right text-sm leading-6 text-slate-500">{t("description")}</p>
      <div className="space-y-3">
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={t("emailPlaceholder")}
          className="h-11 w-full rounded-xl border border-slate-200 px-4 text-right text-sm outline-none"
        />
        <Button
          type="button"
          disabled={submitting}
          onClick={() => void submit()}
          className="w-full rounded-xl bg-[#2C4260] hover:bg-[#243652]"
        >
          {t("submit")}
        </Button>
      </div>
    </CommunitySidebarCard>
  );
}
