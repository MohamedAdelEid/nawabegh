"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import type { CommunityFeedPost } from "@/modules/teacher/domain/types/knowledgeCommunity.types";
import { UserAvatarImageOrInitials } from "@/shared/presentation/components/user/UserAvatarImageOrInitials";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { HomeSectionHeader } from "./HomeSectionHeader";

function formatRelativeTime(value: string, locale: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const diffMs = Date.now() - date.getTime();
  const diffHours = Math.max(1, Math.round(diffMs / (1000 * 60 * 60)));
  const rtf = new Intl.RelativeTimeFormat(locale.startsWith("ar") ? "ar" : "en", {
    numeric: "auto",
  });
  if (diffHours < 24) return rtf.format(-diffHours, "hour");
  const diffDays = Math.round(diffHours / 24);
  return rtf.format(-diffDays, "day");
}

type CommunityActivitySectionProps = {
  posts: CommunityFeedPost[];
  isLoading?: boolean;
};

export function CommunityActivitySection({ posts, isLoading }: CommunityActivitySectionProps) {
  const t = useTranslations("student.dashboard.home.community");
  const locale = useLocale();

  if (isLoading) {
    return (
      <section className="space-y-6">
        <HomeSectionHeader title={t("title")} />
        <div className="space-y-4 rounded-3xl border-2 border-[#e2e8f0] bg-white p-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-14 animate-pulse rounded-xl bg-[#f1f5f9]" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <HomeSectionHeader
        title={t("title")}
        viewAllHref={ROUTES.USER.STUDENT.KNOWLEDGE_COMMUNITY.LIST}
        viewAllLabel={t("viewAll")}
      />
      <div className="rounded-3xl border-2 border-[#e2e8f0] bg-white p-6 shadow-[0px_8px_0px_rgba(0,0,0,0.05)]">
        {posts.length === 0 ? (
          <p className="text-center text-sm text-[#64748b]">{t("empty")}</p>
        ) : (
          <ul className="space-y-5">
            {posts.map((post) => (
              <li key={post.id}>
                <Link
                  href={ROUTES.USER.STUDENT.KNOWLEDGE_COMMUNITY.ARTICLE(post.id)}
                  className="flex items-center justify-between gap-4 rounded-xl p-2 transition-colors hover:bg-[#f8fafc]"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <UserAvatarImageOrInitials
                      trackKey={post.id}
                      name={post.authorName}
                      imageUrl={post.authorAvatarImageUrl}
                      size="sm"
                    />
                    <p className="truncate text-start text-sm text-[#2b415e]">
                      {t("publishedIn", {
                        author: post.authorName,
                        category: post.category,
                      })}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-[#94a3b8]">
                    {formatRelativeTime(post.publishedAt, locale)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
