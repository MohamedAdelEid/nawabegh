"use client";

import { useEffect, useRef, useState } from "react";
import { ImageIcon, Lightbulb, ListOrdered } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { uploadAdminFile } from "@/modules/admin/infrastructure/api/fileUploadApi";
import { useSchoolCommunityArticleEditor } from "@/modules/school/application/hooks/useSchoolCommunityArticleEditor";
import { getSchoolCommunityCategoriesDropdown } from "@/modules/school/infrastructure/api/schoolCommunityApi";
import { notify } from "@/shared/application/lib/toast";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import {
  CommunityPageShell,
  CommunitySidebarCard,
} from "@/shared/presentation/components/community/CommunityPageShell";
import { CommunityRichTextEditor } from "@/shared/presentation/components/community/CommunityRichTextEditor";
import { ApiFailureAlert } from "@/shared/presentation/components/ui/ApiFailureAlert";
import { Button } from "@/shared/presentation/components/ui/button";
import { SearchableSelect } from "@/shared/presentation/components/ui/searchable-select";
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";

const IMAGE_FOLDER = "community/articles";
const MIN_CONTENT_LENGTH = 50;

type DraftState = {
  title: string;
  categoryId: string;
  content: string;
  coverImageUrl: string | null;
};

const EMPTY_DRAFT: DraftState = {
  title: "",
  categoryId: "",
  content: "",
  coverImageUrl: null,
};

function getPlainTextLength(content: string) {
  return content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().length;
}

export function SchoolArticleCreateView({ articleId }: { articleId?: string }) {
  const t = useTranslations("school.dashboard.articleEditor");
  const common = useTranslations("school.dashboard.common");
  const locale = useLocale();
  const router = useRouter();
  const editor = useSchoolCommunityArticleEditor(articleId);
  const [draft, setDraft] = useState<DraftState>(EMPTY_DRAFT);
  const [categories, setCategories] = useState<Array<{ id: string; label: string }>>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const hydratedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    setCategoriesLoading(true);

    void getSchoolCommunityCategoriesDropdown({ pageNumber: 1, pageSize: 200 })
      .then((rows) => {
        if (cancelled) return;
        setCategories(rows.map((item) => ({ id: item.id, label: item.name })));
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setCategories([]);
        notify.error(err instanceof Error ? err.message : t("create.loadCategoriesError"));
      })
      .finally(() => {
        if (!cancelled) setCategoriesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [locale, t]);

  useEffect(() => {
    if (!articleId || !editor.detail || hydratedRef.current) return;
    const article = editor.detail.article;
    setDraft({
      title: article.title,
      categoryId:
        article.primaryCategory?.id ??
        article.categories.find((item) => item.isPrimary)?.id ??
        article.categories[0]?.id ??
        "",
      content: article.content,
      coverImageUrl: article.coverImageUrl,
    });
    hydratedRef.current = true;
  }, [articleId, editor.detail]);

  const updateDraft = (patch: Partial<DraftState>) => {
    setDraft((current) => ({ ...current, ...patch }));
  };

  const validate = () => {
    if (!draft.title.trim()) return t("create.validation.title");
    if (!draft.categoryId) return t("create.validation.category");
    if (getPlainTextLength(draft.content) < MIN_CONTENT_LENGTH) {
      return t("create.validation.content", { min: MIN_CONTENT_LENGTH });
    }
    return null;
  };

  const buildPayload = () => ({
    title: draft.title.trim(),
    content: draft.content,
    coverImageUrl: draft.coverImageUrl,
    categoryIds: [draft.categoryId],
    primaryCategoryId: draft.categoryId,
    tags: [],
  });

  const handleSaveDraft = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    try {
      await editor.saveDraft.mutateAsync(buildPayload());
      notify.success(t("messages.draftSaved"));
      router.push(ROUTES.USER.SCHOOL.ARTICLES.LIST);
    } catch (err) {
      notify.error(err instanceof Error ? err.message : t("messages.actionError"));
    }
  };

  const handlePublish = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    try {
      await editor.publish.mutateAsync(buildPayload());
      notify.success(articleId ? t("messages.updated") : t("messages.published"));
      router.push(ROUTES.USER.SCHOOL.ARTICLES.LIST);
    } catch (err) {
      notify.error(err instanceof Error ? err.message : t("messages.actionError"));
    }
  };

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const result = await uploadAdminFile(file, IMAGE_FOLDER);
    if (!result.ok) {
      notify.error(result.errorMessage);
      return;
    }
    updateDraft({ coverImageUrl: result.filePath });
  };

  if (articleId && editor.isLoadingDetail) {
    return (
      <div className="space-y-6" aria-hidden>
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-6 w-96" />
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
          <Skeleton className="h-[32rem] w-full rounded-[1.75rem]" />
          <Skeleton className="h-64 w-full rounded-[1.5rem]" />
        </div>
      </div>
    );
  }

  const busy = editor.saveDraft.isPending || editor.publish.isPending;

  return (
    <CommunityPageShell
      title={articleId ? t("create.editTitle") : t("create.title")}
      subtitle={t("create.subtitle")}
      sidebar={
        <>
          <CommunitySidebarCard
            title={t("create.rulesTitle")}
            icon={<ListOrdered className="h-4 w-4 text-[#C7AF6E]" />}
          >
            <ol className="list-decimal space-y-2 pe-5 text-sm leading-relaxed text-slate-600">
              <li>{t("create.rules.one")}</li>
              <li>{t("create.rules.two")}</li>
              <li>{t("create.rules.three")}</li>
              <li>{t("create.rules.four")}</li>
            </ol>
            <p className="mt-4 rounded-xl bg-[#FFF7E0] px-3 py-2 text-sm text-[#8A7340]">
              {t("create.rulesQuote")}
            </p>
          </CommunitySidebarCard>
          <CommunitySidebarCard
            title={t("create.tipTitle")}
            icon={<Lightbulb className="h-4 w-4 text-[#2B415E]" />}
          >
            <p className="text-sm leading-relaxed text-slate-600">{t("create.tipBody")}</p>
          </CommunitySidebarCard>
        </>
      }
    >
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="space-y-5 rounded-[1.75rem] border border-white/80 bg-white p-5 shadow-[var(--dashboard-shadow-soft)] sm:p-6"
      >
        {error ? <ApiFailureAlert message={error} /> : null}

        <label className="block space-y-2 text-right">
          <span className="text-sm font-semibold text-slate-700">{t("create.titleLabel")}</span>
          <input
            value={draft.title}
            onChange={(event) => updateDraft({ title: event.target.value })}
            placeholder={t("create.titlePlaceholder")}
            className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-[#2C4260]/20"
          />
        </label>

        <div className="text-right">
          <SearchableSelect
            label={t("create.categoryLabel")}
            value={draft.categoryId || null}
            onChange={(categoryId) => updateDraft({ categoryId })}
            options={categories.map((category) => ({
              value: category.id,
              label: category.label,
            }))}
            placeholder={t("create.categoryPlaceholder")}
            isLoading={categoriesLoading}
            className="gap-2"
            labelClassName="text-sm font-semibold text-slate-700"
            triggerClassName="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-right text-sm shadow-none"
          />
        </div>

        <CommunityRichTextEditor
          value={draft.content}
          onChange={(content) => updateDraft({ content })}
          placeholder={t("create.contentPlaceholder")}
          onAddImage={() => imageInputRef.current?.click()}
        />

        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => void handleImageChange(event)}
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={() => imageInputRef.current?.click()}
            >
              <ImageIcon className="h-4 w-4" />
              {t("create.addImage")}
            </Button>
            {draft.coverImageUrl ? (
              <span className="self-center text-xs text-emerald-600">✓</span>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              disabled={busy}
              onClick={() => void handleSaveDraft()}
            >
              {editor.saveDraft.isPending ? common("saving") : t("create.saveDraft")}
            </Button>
            <Button
              type="button"
              className="rounded-xl bg-[#2B415E] text-white hover:bg-[#24384f]"
              disabled={busy}
              onClick={() => void handlePublish()}
            >
              {editor.publish.isPending ? common("saving") : t("create.publish")}
            </Button>
          </div>
        </div>
      </motion.section>
    </CommunityPageShell>
  );
}
