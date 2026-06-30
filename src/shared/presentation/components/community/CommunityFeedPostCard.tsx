"use client";

import Link from "next/link";
import { Bookmark, Download, Heart, MessageSquare, Share2 } from "lucide-react";
import { useLocale } from "next-intl";
import type { CommunityFeedPost } from "@/modules/teacher/domain/types/knowledgeCommunity.types";
import { formatCommunityRelativeTime } from "@/modules/teacher/domain/utils/knowledgeCommunityMappers";
import { useScopedDashboardRoutes } from "@/shared/application/hooks/useScopedDashboardRoutes";
import { useCommunityTranslations } from "@/shared/presentation/components/community/useCommunityTranslations";
import { CommunityMediaImage, resolveCommunityFileUrl } from "@/shared/presentation/components/community/CommunityMediaImage";
import { cn } from "@/shared/application/lib/cn";
import { UserAvatarImageOrInitials } from "@/shared/presentation/components/user";

type CommunityFeedPostCardProps = {
  post: CommunityFeedPost;
  className?: string;
};

function categoryTone(category: string) {
  const normalized = category.toLowerCase();
  if (normalized.includes("رياض") || normalized.includes("math")) return "bg-emerald-50 text-emerald-700";
  if (normalized.includes("فيز") || normalized.includes("phys")) return "bg-sky-50 text-sky-700";
  return "bg-amber-50 text-amber-700";
}

export function CommunityFeedPostCard({ post, className }: CommunityFeedPostCardProps) {
  const t = useCommunityTranslations("feed");
  const locale = useLocale();
  const routes = useScopedDashboardRoutes();

  return (
    <article
      className={cn(
        "rounded-[1.5rem] border border-white/80 bg-white p-5 shadow-[var(--dashboard-shadow-soft)]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <UserAvatarImageOrInitials
            trackKey={post.authorUserId ?? post.id}
            name={post.authorName}
            imageUrl={post.authorAvatarImageUrl}
            size="md"
          />
          <div className="text-right">
            {post.authorUserId ? (
              <Link
                href={routes.knowledgeCommunity.AUTHOR(post.authorUserId)}
                className="font-bold text-[#2C4260] hover:underline"
              >
                {post.authorName}
              </Link>
            ) : (
              <p className="font-bold text-[#2C4260]">{post.authorName}</p>
            )}
            <p className="text-xs text-slate-500">
              {post.authorRole} • {post.schoolName}
            </p>
            <p className="text-xs text-slate-400">
              {formatCommunityRelativeTime(post.publishedAt, locale)}
            </p>
          </div>
        </div>
        <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", categoryTone(post.category))}>
          {post.category}
        </span>
      </div>

      <div className="mt-4 space-y-3 text-right">
        <Link href={routes.knowledgeCommunity.ARTICLE(post.id)} className="block">
          <h3 className="text-lg font-bold text-slate-800 hover:text-[#2C4260]">{post.title}</h3>
        </Link>
        {post.excerpt ? <p className="text-sm leading-7 text-slate-600">{post.excerpt}</p> : null}
      </div>

      {post.coverImageUrl ? (
        <Link href={routes.knowledgeCommunity.ARTICLE(post.id)} className="mt-4 block overflow-hidden rounded-2xl">
          <CommunityMediaImage src={post.coverImageUrl} alt={post.title} className="h-56" />
        </Link>
      ) : null}

      {post.attachmentUrl ? (
        <a
          href={resolveCommunityFileUrl(post.attachmentUrl) ?? "#"}
          target="_blank"
          rel="noreferrer"
          className="mt-4 flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
        >
          <div className="text-right">
            <p className="font-semibold text-[#2C4260]">{post.attachmentFileName ?? t("attachment")}</p>
            <p className="text-xs text-slate-500">{t("pdfAttachment")}</p>
          </div>
          <Download className="h-5 w-5 text-slate-500" />
        </a>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 text-sm text-slate-500">
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1">
            <Heart className="h-4 w-4" />
            {post.likesCount}
          </span>
          <span className="inline-flex items-center gap-1">
            <MessageSquare className="h-4 w-4" />
            {post.commentsCount}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" className="hover:text-[#2C4260]">
            <Share2 className="h-4 w-4" />
          </button>
          <button type="button" className="hover:text-[#2C4260]">
            <Bookmark className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
}
