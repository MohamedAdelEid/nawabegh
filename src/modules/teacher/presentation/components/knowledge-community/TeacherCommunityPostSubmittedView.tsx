"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock3 } from "lucide-react";
import { useTranslations } from "next-intl";
import { ArticleStatus } from "@/modules/admin/domain/entities/community.enums";
import { getKnowledgeCommunityArticleById } from "@/modules/admin/infrastructure/api/communityArticlesApi";
import {
  COMMUNITY_POST_SUBMISSION_STORAGE_KEY,
  type CommunityPostSubmission,
} from "@/modules/teacher/domain/types/knowledgeCommunity.types";
import { CommunityPageShell, CommunitySidebarCard } from "@/shared/presentation/components/community/CommunityPageShell";
import { useScopedDashboardRoutes } from "@/shared/application/hooks/useScopedDashboardRoutes";
import { Button } from "@/shared/presentation/components/ui/button";

const REVIEW_POLL_INTERVAL_MS = 20_000;

function readSubmissionFromStorage(articleId: string): CommunityPostSubmission | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(COMMUNITY_POST_SUBMISSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CommunityPostSubmission;
    if (parsed.articleId !== articleId) return null;
    return parsed;
  } catch {
    return null;
  }
}

type TeacherCommunityPostSubmittedViewProps = {
  articleId: string;
};

export function TeacherCommunityPostSubmittedView({ articleId }: TeacherCommunityPostSubmittedViewProps) {
  const t = useTranslations("teacher.dashboard.knowledgeCommunity.submitted");
  const router = useRouter();
  const routes = useScopedDashboardRoutes();
  const [submission, setSubmission] = useState<CommunityPostSubmission | null>(null);

  useEffect(() => {
    setSubmission(readSubmissionFromStorage(articleId));
  }, [articleId]);

  useEffect(() => {
    let cancelled = false;

    const checkPublicationStatus = async () => {
      const result = await getKnowledgeCommunityArticleById(articleId);
      if (cancelled || !result.data) return;

      if (result.data.status === ArticleStatus.Published) {
        sessionStorage.removeItem(COMMUNITY_POST_SUBMISSION_STORAGE_KEY);
        router.replace(routes.knowledgeCommunity.ARTICLE(articleId));
      }
    };

    void checkPublicationStatus();
    const interval = window.setInterval(() => {
      void checkPublicationStatus();
    }, REVIEW_POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [articleId, router, routes.knowledgeCommunity]);

  const title = submission?.title?.trim() || t("untitledPost");

  return (
    <CommunityPageShell
      title={t("title")}
      subtitle={t("subtitle")}
      sidebar={
        <CommunitySidebarCard title={t("sidebar.title")}>
          <ol className="list-decimal space-y-3 ps-5 text-right text-sm leading-7 text-slate-600">
            {(["one", "two", "three"] as const).map((key) => (
              <li key={key}>{t(`sidebar.steps.${key}`)}</li>
            ))}
          </ol>
        </CommunitySidebarCard>
      }
    >
      <section className="rounded-[1.5rem] border border-white/80 bg-white p-8 shadow-[var(--dashboard-shadow-soft)]">
        <div className="mx-auto max-w-2xl space-y-6 text-right">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-8 w-8" aria-hidden />
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-1.5 text-sm font-semibold text-amber-800">
              <Clock3 className="h-4 w-4" aria-hidden />
              {t("status.inReview")}
            </span>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-500">{t("postLabel")}</p>
            <h2 className="text-2xl font-bold text-[#2C4260]">{title}</h2>
            {submission?.categoryLabel ? (
              <p className="text-sm text-slate-500">{submission.categoryLabel}</p>
            ) : null}
          </div>

          <p className="text-sm leading-7 text-slate-600">{t("body")}</p>

          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm leading-7 text-slate-600">
            {t("reviewNote")}
          </div>

          <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-6">
            <Button type="button" variant="outline" className="rounded-xl" asChild>
              <Link href={routes.knowledgeCommunity.LIST}>{t("actions.backToCommunity")}</Link>
            </Button>
            <Button type="button" className="rounded-xl bg-[#2C4260] hover:bg-[#243652]" asChild>
              <Link href={routes.knowledgeCommunity.CREATE}>{t("actions.createAnother")}</Link>
            </Button>
          </div>
        </div>
      </section>
    </CommunityPageShell>
  );
}
