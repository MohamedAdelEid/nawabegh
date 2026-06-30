"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useStudentCommunityFeed } from "@/modules/student/application/hooks/useStudentCommunityFeed";
import type { CommunityFeedSort } from "@/modules/admin/infrastructure/api/communityArticlesApi";
import { CommunityFeedFilters } from "@/shared/presentation/components/community/CommunityFeedFilters";
import { CommunityFeedPostCard } from "@/shared/presentation/components/community/CommunityFeedPostCard";
import { CommunityPageShell } from "@/shared/presentation/components/community/CommunityPageShell";
import { CommunityPostComposer } from "@/shared/presentation/components/community/CommunityPostComposer";
import {
  CommunityBadgesWidget,
  CommunityTopArticlesWidget,
  CommunityTopAuthorsWidget,
} from "@/shared/presentation/components/community/CommunitySidebarWidgets";
import { DashboardPagination } from "@/shared/presentation/components/dashboard";
import { StudentKnowledgeCommunityFeedSkeleton } from "@/modules/student/presentation/components/knowledge-community/StudentKnowledgeCommunityFeedSkeleton";
import { ApiFailureAlert } from "@/shared/presentation/components/ui/ApiFailureAlert";

export function StudentKnowledgeCommunityDashboard() {
  const t = useTranslations("student.dashboard.knowledgeCommunity");
  const tCommon = useTranslations("student.dashboard");
  const [sort, setSort] = useState<CommunityFeedSort>("latest");
  const [search, setSearch] = useState("");
  const feed = useStudentCommunityFeed(sort);

  const filteredPosts = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return feed.posts;
    return feed.posts.filter(
      (post) =>
        post.title.toLowerCase().includes(keyword) ||
        post.authorName.toLowerCase().includes(keyword) ||
        post.category.toLowerCase().includes(keyword),
    );
  }, [feed.posts, search]);

  const sortLabels = {
    latest: t("filters.latest"),
    mostActive: t("filters.mostActive"),
    unanswered: t("filters.unanswered"),
  } as const;

  return (
    <CommunityPageShell
      title={t("title")}
      subtitle={t("subtitle")}
      searchValue={search}
      onSearchChange={setSearch}
      sidebar={
        <>
          <CommunityTopArticlesWidget articles={feed.topArticles} />
          <CommunityTopAuthorsWidget authors={feed.topAuthors} />
          <CommunityBadgesWidget badges={feed.badges} />
        </>
      }
    >
      <CommunityPostComposer />
      <CommunityFeedFilters value={sort} onChange={setSort} labels={sortLabels} title={t("feedTitle")} />

      {feed.error ? <ApiFailureAlert message={feed.error} fallbackMessage={t("loadError")} /> : null}

      {feed.loading ? (
        <StudentKnowledgeCommunityFeedSkeleton label={tCommon("common.loading")} />
      ) : (
        <div className="space-y-4">
          {filteredPosts.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
              {t("empty")}
            </div>
          ) : (
            filteredPosts.map((post) => <CommunityFeedPostCard key={post.id} post={post} />)
          )}
        </div>
      )}

      {!feed.loading && feed.totalPages > 1 ? (
        <DashboardPagination
          pages={Array.from({ length: feed.totalPages }, (_, index) => index + 1)}
          currentPage={feed.page}
          onPageChange={feed.setPage}
          previousLabel={t("pagination.previous")}
          nextLabel={t("pagination.next")}
        />
      ) : null}
    </CommunityPageShell>
  );
}
