"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  COMMUNITY_POST_DRAFT_STORAGE_KEY,
  type CommunityPostDraft,
} from "@/modules/teacher/domain/types/knowledgeCommunity.types";
import { CommunityMediaImage } from "@/shared/presentation/components/community/CommunityMediaImage";
import { CommunityPageShell } from "@/shared/presentation/components/community/CommunityPageShell";
import { useScopedDashboardRoutes } from "@/shared/application/hooks/useScopedDashboardRoutes";
import { Button } from "@/shared/presentation/components/ui/button";
import { ApiFailureAlert } from "@/shared/presentation/components/ui/ApiFailureAlert";

export function TeacherCommunityPostPreviewView() {
  const t = useTranslations("teacher.dashboard.knowledgeCommunity.preview");
  const router = useRouter();
  const routes = useScopedDashboardRoutes();
  const [draft, setDraft] = useState<CommunityPostDraft | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(COMMUNITY_POST_DRAFT_STORAGE_KEY);
      if (!raw) {
        setDraft(null);
        return;
      }
      setDraft(JSON.parse(raw) as CommunityPostDraft);
    } catch {
      setDraft(null);
    }
  }, []);

  if (!draft) {
    return <ApiFailureAlert message={t("missingDraft")} fallbackMessage={t("missingDraft")} />;
  }

  return (
    <CommunityPageShell
      title={t("title")}
      subtitle={t("subtitle")}
      sidebar={<div />}
    >
      <article className="rounded-[1.5rem] border border-white/80 bg-white p-6 shadow-[var(--dashboard-shadow-soft)]">
        <div className="space-y-4 text-right">
          <span className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
            {draft.categoryLabel || t("uncategorized")}
          </span>
          <h1 className="text-3xl font-bold text-[#2C4260]">{draft.title}</h1>
        </div>

        {draft.coverImageUrl ? (
          <div className="mt-6 overflow-hidden rounded-2xl">
            <CommunityMediaImage
              src={draft.coverImageUrl}
              alt={draft.title}
              className="h-72"
            />
          </div>
        ) : null}

        <div
          className="prose prose-sm mt-6 max-w-none text-right leading-8 text-slate-700"
          dangerouslySetInnerHTML={{ __html: draft.content }}
        />

        {draft.attachmentFileName ? (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-right text-sm text-slate-600">
            {t("attachment", { name: draft.attachmentFileName })}
          </div>
        ) : null}

        <div className="mt-8 flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-6">
          <Button
            type="button"
            variant="outline"
            className="rounded-xl"
            onClick={() => router.push(routes.knowledgeCommunity.CREATE)}
          >
            {t("backToEdit")}
          </Button>
          <Button
            type="button"
            className="rounded-xl bg-[#2C4260] hover:bg-[#243652]"
            onClick={() => router.push(routes.knowledgeCommunity.CREATE)}
          >
            {t("continueEditing")}
          </Button>
        </div>
      </article>
    </CommunityPageShell>
  );
}
