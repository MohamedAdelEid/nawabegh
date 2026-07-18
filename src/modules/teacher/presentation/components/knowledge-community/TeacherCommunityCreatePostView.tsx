"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImageIcon, Paperclip } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { uploadAdminFile } from "@/modules/admin/infrastructure/api/fileUploadApi";
import { createCommunityArticle } from "@/modules/admin/infrastructure/api/communityArticlesApi";
import { getKnowledgeCommunityCategoriesDropdown } from "@/modules/teacher/infrastructure/api/knowledgeCommunityCategoriesApi";
import {
  COMMUNITY_POST_DRAFT_STORAGE_KEY,
  COMMUNITY_POST_SUBMISSION_STORAGE_KEY,
  type CommunityPostDraft,
} from "@/modules/teacher/domain/types/knowledgeCommunity.types";
import { CommunityRichTextEditor } from "@/shared/presentation/components/community/CommunityRichTextEditor";
import { CommunityPageShell, CommunitySidebarCard } from "@/shared/presentation/components/community/CommunityPageShell";
import { useScopedDashboardRoutes } from "@/shared/application/hooks/useScopedDashboardRoutes";
import { notify } from "@/shared/application/lib/toast";
import { Button } from "@/shared/presentation/components/ui/button";
import { ApiFailureAlert } from "@/shared/presentation/components/ui/ApiFailureAlert";
import { SearchableSelect } from "@/shared/presentation/components/ui/searchable-select";

const IMAGE_FOLDER = "community/articles";
const FILE_FOLDER = "community/attachments";
const MIN_CONTENT_LENGTH = 50;

function getPlainTextLength(content: string): number {
  return content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().length;
}

const EMPTY_DRAFT: CommunityPostDraft = {
  title: "",
  categoryId: "",
  categoryLabel: "",
  content: "",
  coverImageUrl: null,
  attachmentUrl: null,
  attachmentFileName: null,
};

function readDraftFromStorage(): CommunityPostDraft {
  if (typeof window === "undefined") return EMPTY_DRAFT;
  try {
    const raw = sessionStorage.getItem(COMMUNITY_POST_DRAFT_STORAGE_KEY);
    if (!raw) return EMPTY_DRAFT;
    return { ...EMPTY_DRAFT, ...(JSON.parse(raw) as CommunityPostDraft) };
  } catch {
    return EMPTY_DRAFT;
  }
}

function writeDraftToStorage(draft: CommunityPostDraft) {
  sessionStorage.setItem(COMMUNITY_POST_DRAFT_STORAGE_KEY, JSON.stringify(draft));
}

export function TeacherCommunityCreatePostView() {
  const t = useTranslations("teacher.dashboard.knowledgeCommunity.create");
  const locale = useLocale();
  const router = useRouter();
  const routes = useScopedDashboardRoutes();
  const [draft, setDraft] = useState<CommunityPostDraft>(EMPTY_DRAFT);
  const [categories, setCategories] = useState<Array<{ id: string; label: string }>>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const storedDraft = readDraftFromStorage();
    setDraft(storedDraft);

    void getKnowledgeCommunityCategoriesDropdown({ pageNumber: 1, pageSize: 200 }).then((result) => {
      const rows = result.data ?? [];
      setCategories(rows.map((item) => ({ id: item.id, label: item.name })));

      if (
        storedDraft.categoryId &&
        !rows.some((item) => item.id === storedDraft.categoryId)
      ) {
        setDraft((current) => {
          const next = { ...current, categoryId: "", categoryLabel: "" };
          writeDraftToStorage(next);
          return next;
        });
      }
    });
  }, [locale]);

  const updateDraft = (patch: Partial<CommunityPostDraft>) => {
    setDraft((current) => {
      const next = { ...current, ...patch };
      writeDraftToStorage(next);
      return next;
    });
  };

  const uploadAsset = async (file: File, folder: string) => {
    const result = await uploadAdminFile(file, folder);
    if (!result.ok) {
      notify.error(result.errorMessage);
      return null;
    }
    return result.filePath;
  };

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const url = await uploadAsset(file, IMAGE_FOLDER);
    if (url) updateDraft({ coverImageUrl: url });
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const url = await uploadAsset(file, FILE_FOLDER);
    if (url) updateDraft({ attachmentUrl: url, attachmentFileName: file.name });
  };

  const validate = () => {
    if (!draft.title.trim() || !draft.content.trim() || !draft.categoryId) {
      setError(t("validation.required"));
      return false;
    }
    const contentLength = getPlainTextLength(draft.content);
    if (contentLength < MIN_CONTENT_LENGTH) {
      setError(
        t("validation.contentMinLength", {
          min: MIN_CONTENT_LENGTH,
          count: contentLength,
        }),
      );
      return false;
    }
    setError(null);
    return true;
  };

  const preview = () => {
    if (!validate()) return;
    writeDraftToStorage(draft);
    router.push(routes.knowledgeCommunity.PREVIEW);
  };

  const publish = async () => {
    if (!validate()) return;
    setSubmitting(true);
    const result = await createCommunityArticle({
      title: draft.title,
      content: draft.content,
      coverImageUrl: draft.coverImageUrl,
      primaryCategoryId: draft.categoryId,
      categoryIds: [draft.categoryId],
      tags: [],
    });
    setSubmitting(false);
    if (!result.data?.articleId) {
      const message = result.errorMessage ?? t("publishError");
      setError(message);
      notify.error(message);
      return;
    }
    sessionStorage.removeItem(COMMUNITY_POST_DRAFT_STORAGE_KEY);
    sessionStorage.setItem(
      COMMUNITY_POST_SUBMISSION_STORAGE_KEY,
      JSON.stringify({
        articleId: result.data.articleId,
        title: draft.title,
        categoryLabel: draft.categoryLabel,
        submittedAt: new Date().toISOString(),
      }),
    );
    notify.success(t("publishSuccess"));
    router.push(routes.knowledgeCommunity.SUBMITTED(result.data.articleId));
  };

  return (
    <CommunityPageShell
      title={t("title")}
      subtitle={t("subtitle")}
      sidebar={
        <>
          <CommunitySidebarCard title={t("rules.title")}>
            <ol className="list-decimal space-y-3 ps-5 text-right text-sm leading-7 text-slate-600">
              {(["one", "two", "three", "four"] as const).map((key) => (
                <li key={key}>{t(`rules.items.${key}`)}</li>
              ))}
            </ol>
            <div className="mt-4 rounded-2xl bg-amber-50 p-4 text-right text-sm leading-7 text-amber-900">
              {t("rules.tip")}
            </div>
          </CommunitySidebarCard>
          <CommunitySidebarCard title={t("smartTip.title")}>
            <p className="text-right text-sm leading-7 text-slate-600">{t("smartTip.body")}</p>
          </CommunitySidebarCard>
        </>
      }
    >
      {error ? <ApiFailureAlert message={error} fallbackMessage={t("validation.required")} /> : null}

      <section className="rounded-[1.5rem] border border-white/80 bg-white p-6 shadow-[var(--dashboard-shadow-soft)]">
        <div className="space-y-6">
          <label className="block space-y-2 text-right">
            <span className="text-sm font-semibold text-slate-700">{t("fields.title")}</span>
            <input
              value={draft.title}
              onChange={(event) => updateDraft({ title: event.target.value })}
              placeholder={t("fields.titlePlaceholder")}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-right text-sm outline-none"
            />
          </label>

          <div className="text-right">
            <SearchableSelect
              label={t("fields.category")}
              value={draft.categoryId}
              onChange={(categoryId) => {
                const option = categories.find((item) => item.id === categoryId);
                updateDraft({
                  categoryId,
                  categoryLabel: option?.label ?? "",
                });
              }}
              placeholder={t("fields.categoryPlaceholder")}
              options={categories.map((category) => ({
                value: category.id,
                label: category.label,
              }))}
              className="gap-2"
              labelClassName="text-sm font-semibold text-slate-700"
              triggerClassName="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-right text-sm shadow-none"
            />
          </div>

          <div className="space-y-2 text-right">
            <span className="text-sm font-semibold text-slate-700">{t("fields.content")}</span>
            <CommunityRichTextEditor
              value={draft.content}
              onChange={(content) => updateDraft({ content })}
              placeholder={t("fields.contentPlaceholder")}
              onAddImage={() => imageInputRef.current?.click()}
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <Button type="button" variant="outline" className="gap-2 rounded-xl" onClick={() => imageInputRef.current?.click()}>
              <ImageIcon className="h-4 w-4" />
              {t("actions.addImage")}
            </Button>
            <Button type="button" variant="outline" className="gap-2 rounded-xl" onClick={() => fileInputRef.current?.click()}>
              <Paperclip className="h-4 w-4" />
              {t("actions.uploadFile")}
            </Button>
          </div>

          {draft.coverImageUrl ? (
            <p className="text-right text-xs text-emerald-600">{t("attachments.imageReady")}</p>
          ) : null}
          {draft.attachmentFileName ? (
            <p className="text-right text-xs text-emerald-600">
              {t("attachments.fileReady", { name: draft.attachmentFileName })}
            </p>
          ) : null}

          <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-6">
            <Button type="button" variant="outline" className="rounded-xl" onClick={preview}>
              {t("actions.preview")}
            </Button>
            <Button
              type="button"
              disabled={submitting}
              className="rounded-xl bg-[#2C4260] hover:bg-[#243652]"
              onClick={() => void publish()}
            >
              {t("actions.publish")}
            </Button>
          </div>
        </div>
      </section>

      <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={(event) => void handleImageChange(event)} />
      <input ref={fileInputRef} type="file" className="hidden" onChange={(event) => void handleFileChange(event)} />
    </CommunityPageShell>
  );
}
