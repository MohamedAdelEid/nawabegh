"use client";

import { useEffect, useMemo, useState } from "react";
import { CircleAlert, FilePenLine, Send, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  getArticleReviewDetailById,
  submitArticleAmendmentRequest,
  type ArticleReviewDetail,
} from "@/modules/admin/domain/data/articleEditorReviewData";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { notify } from "@/shared/application/lib/toast";
import { cn } from "@/shared/application/lib/cn";
import { DashboardPageHeader } from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { LabeledInput } from "@/shared/presentation/components/ui/labeled-input";
import { LabeledTextarea } from "@/shared/presentation/components/ui/labeled-textarea";
import { StatusSwitch } from "@/shared/presentation/components/ui/StatusSwitch";
import HiddenEye from "../assets/icons/HiddenEye";
import { UserAvatarImageOrInitials } from "@/shared/presentation/components/user";

interface AdminArticleEditorRequestAmendmentsPageProps {
  articleId: string;
}

function formatReadsCount(n: number): string {
  if (n >= 1000) {
    const k = n / 1000;
    return k >= 10 ? `${Math.round(k)}k` : `${k.toFixed(1)}k`;
  }
  return String(n);
}

export function AdminArticleEditorRequestAmendmentsPage({
  articleId,
}: AdminArticleEditorRequestAmendmentsPageProps) {
  const t = useTranslations("admin.dashboard.articleEditor.requestAmendmentsPage");
  const tEditor = useTranslations("admin.dashboard.articleEditor");
  const locale = useLocale();
  const router = useRouter();
  const [detail, setDetail] = useState<ArticleReviewDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [hideFromPlatform, setHideFromPlatform] = useState(false);
  const [reviewNotes, setReviewNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      setLoading(true);
      const data = await getArticleReviewDetailById(articleId, locale);
      if (!alive) return;
      setDetail(data);
      setLoading(false);
    };
    void load();
    return () => {
      alive = false;
    };
  }, [articleId, locale]);

  const closedCommentsLabel = useMemo(() => {
    if (!detail) return "0";
    return String(detail.stats.commentsCount);
  }, [detail]);

  const readsLabel = useMemo(() => {
    if (!detail) return "0";
    return formatReadsCount(detail.stats.viewsCount);
  }, [detail]);

  const handleSend = async () => {
    if (!detail || submitting) return;
    if (!reviewNotes.trim()) {
      notify.error(t("actions.notesRequired"));
      return;
    }
    setSubmitting(true);
    try {
      const result = await submitArticleAmendmentRequest(detail.id, {
        hideFromPlatform,
        reviewNotes: reviewNotes.trim(),
      });
      if (!result.ok) {
        notify.error(result.errorMessage ?? tEditor("table.loadError"));
        return;
      }
      notify.success(result.message ?? t("actions.success"));
      router.push(ROUTES.ADMIN.ARTICLE_EDITOR.VIEW(detail.id));
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-slate-500">
        {t("loading")}
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="space-y-4 rounded-2xl border border-red-100 bg-red-50 p-6 text-right">
        <p className="text-lg font-bold text-red-600">{t("notFound.title")}</p>
        <p className="text-sm text-red-500">{t("notFound.description")}</p>
        <Button type="button" variant="outline" onClick={() => router.push(ROUTES.ADMIN.ARTICLE_EDITOR.LIST)}>
          {t("notFound.back")}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-right">
      <DashboardPageHeader
        title={t("header.title")}
        description={t("header.description")}
        breadcrumbs={[
          { label: t("header.breadcrumbs.home"), href: ROUTES.ADMIN.HOME },
          { label: t("header.breadcrumbs.articleEditor"), href: `${ROUTES.ADMIN.HOME}?tab=articleEditor` },
          {
            label: t("header.breadcrumbs.review"),
            href: ROUTES.ADMIN.ARTICLE_EDITOR.VIEW(articleId),
          },
          { label: t("header.breadcrumbs.current") },
        ]}
      />

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <Card
          className="rounded-[1.75rem] border-white/80 bg-white"
          style={{ boxShadow: "0px 8px 0px 0px #0000000D" }}
        >
          <CardContent className="space-y-6 p-6 sm:p-8">
            <h2 className="flex items-center justify-end gap-2 text-xl font-extrabold text-[#1E3A66]">
              <span>{t("main.sectionTitle")}</span>
              <FilePenLine className="h-6 w-6 shrink-0 text-[#1E3A66]" aria-hidden />
            </h2>

            <LabeledInput
              label={t("main.articleTitleLabel")}
              value={detail.title}
              placeholder=""
              onChange={() => {}}
              readOnly
              disabled
              inputClassName="bg-[#F1F5F9] text-slate-700"
            />

            <LabeledTextarea
              label={t("main.reviewNotesLabel")}
              value={reviewNotes}
              placeholder={t("main.reviewNotesPlaceholder")}
              onChange={setReviewNotes}
              rows={8}
              className="text-right"
              textareaClassName="min-h-[12rem] rounded-xl border-[#E2E8F0] bg-white text-right text-slate-800 placeholder:text-slate-400"
              labelClassName="text-[#1E3A66] font-bold"
            />

            <div
              className={cn(
                "flex items-start gap-3 rounded-xl border border-red-200 bg-red-50/80 px-4 py-3",
              )}
            >
              <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-[#E55353]" aria-hidden />
              <p className="text-sm font-semibold leading-relaxed text-[#B42318]">
                {t("main.statusBanner")}
              </p>
            </div>

            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end sm:gap-4">
              <Button
                type="button"
                variant="outline"
                disabled={submitting}
                className="h-12 rounded-xl border-2 border-[#E2E8F0] px-8 text-base font-bold text-[#475569]"
                onClick={() => router.push(ROUTES.ADMIN.ARTICLE_EDITOR.VIEW(articleId))}
              >
                {t("actions.cancel")}
              </Button>
              <Button
                type="button"
                disabled={submitting}
                className="h-12 rounded-xl bg-[#2B415E] px-8 text-base font-bold text-white shadow-[0px_4px_0px_0px_#1a2d45] hover:bg-[#243B5A]"
                onClick={() => void handleSend()}
              >
                <span className="inline-flex items-center justify-center gap-2">
                  <Send className="h-4 w-4 shrink-0" aria-hidden />
                  {submitting ? t("actions.submitting") : t("actions.send")}
                </span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <aside className="space-y-4">
          <Card
            className="rounded-[1.5rem] border-white/80 bg-white"
            style={{ boxShadow: "0px 8px 0px 0px #0000000D" }}
          >
            {/* <CardContent className="space-y-4 p-5 text-right">
              <div className="flex items-center gap-2 text-lg font-bold text-[#2C4260]">
                <HiddenEye className="h-5 w-5 shrink-0" />
                <span>{t("sidebar.visibilityTitle")}</span>
              </div>
              <div className="flex flex-col gap-3 sm:justify-between">
                <div className="order-1 flex items-center justify-between gap-2 sm:order-2">
                  <span className="text-sm font-bold text-[#1E3A66]">
                    {hideFromPlatform
                      ? t("sidebar.visibilityToggleOn")
                      : t("sidebar.visibilityToggleOff")}
                  </span>
                  <StatusSwitch
                    checked={hideFromPlatform}
                    onChange={setHideFromPlatform}
                    activeLabel={t("sidebar.visibilityToggleOn")}
                    inactiveLabel={t("sidebar.visibilityToggleOff")}
                    activeClassName="bg-emerald-500"
                    inactiveClassName="bg-slate-200"
                  />
                </div>
              </div>
                <p className="order-2 flex-1 text-xs leading-relaxed text-slate-500 sm:order-1">
                  {t("sidebar.visibilityDescription")}
                </p>
            </CardContent> */}
          </Card>

          <Card
            className="rounded-[1.5rem] border border-[#EEF4FD] border-s-4 border-s-[#C7AF6E] bg-white"
            style={{ boxShadow: "0px 8px 0px 0px #0000000D" }}
          >
            <CardContent className="space-y-4 p-5 text-right">
              <h3 className="text-lg font-bold text-[#2C4260]">{t("sidebar.authorTitle")}</h3>
              <div className="flex items-center gap-3">
                <UserAvatarImageOrInitials
                  trackKey={detail.authorUserId}
                  name={detail.authorName}
                  imageUrl={detail.authorAvatarImageUrl}
                  size="md"
                  circleClassName="bg-[#DBEEF6] text-[#255E8A]"
                />
                <div>
                  <p className="font-bold text-[#1E3A66]">{detail.authorName}</p>
                  <p className="text-sm text-slate-500">{detail.authorRole}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden rounded-[1.5rem] border-0 bg-[#1E3A66] text-white shadow-lg">
            <CardContent className="space-y-4 p-5 text-right">
              <div className="flex items-center justify-end gap-2 font-bold">
                <span>{t("sidebar.statsTitle")}</span>
                <TrendingUp className="h-5 w-5 shrink-0 text-white/90" aria-hidden />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-white/10 px-3 py-3 text-center">
                  <p className="text-2xl font-extrabold">{readsLabel}</p>
                  <p className="mt-1 text-xs text-white/80">{t("sidebar.statsReads")}</p>
                </div>
                <div className="rounded-xl bg-white/10 px-3 py-3 text-center">
                  <p className="text-2xl font-extrabold">{closedCommentsLabel}</p>
                  <p className="mt-1 text-xs text-white/80">{t("sidebar.statsComments")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
