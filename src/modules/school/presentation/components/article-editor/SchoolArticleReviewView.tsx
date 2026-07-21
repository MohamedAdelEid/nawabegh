"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  Lightbulb,
  MessageSquare,
  Pencil,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useFormatter, useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { useSchoolCommunityArticle } from "@/modules/school/application/hooks/useSchoolCommunityArticle";
import type { SchoolCommunityComment } from "@/modules/school/domain/types/schoolCommunity.types";
import {
  SchoolArticleCommentActionModal,
  type SchoolArticleCommentPreview,
} from "@/modules/school/presentation/components/article-editor/SchoolArticleCommentActionModal";
import { SchoolArticleRejectModal } from "@/modules/school/presentation/components/article-editor/SchoolArticleRejectModal";
import { SchoolArticleRequestEditsModal } from "@/modules/school/presentation/components/article-editor/SchoolArticleRequestEditsModal";
import { notify } from "@/shared/application/lib/toast";
import { resolveFileUrl } from "@/shared/infrastructure/files/fileUrl";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import {
  DashboardBadge,
  DashboardBreadcrumb,
  DashboardPageHeader,
} from "@/shared/presentation/components/dashboard";
import { ApiFailureAlert } from "@/shared/presentation/components/ui/ApiFailureAlert";
import { Button } from "@/shared/presentation/components/ui/button";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";
import { UserAvatarImageOrInitials } from "@/shared/presentation/components/user";

function formatCommentTime(
  formatter: ReturnType<typeof useFormatter>,
  iso: string,
) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return formatter.relativeTime(date);
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function statusTone(status: string) {
  if (status === "Published") return "success" as const;
  if (status === "PendingReview" || status === "NeedsEdits") return "warning" as const;
  if (status === "Removed") return "danger" as const;
  return "neutral" as const;
}

export function SchoolArticleReviewSkeleton() {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]" aria-hidden>
      <div className="space-y-4 rounded-[1.75rem] border border-white/80 bg-white p-6">
        <Skeleton className="h-6 w-28 rounded-full" />
        <Skeleton className="h-10 w-3/4" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-28" />
          </div>
        </div>
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-[1.5rem]" />
        <Skeleton className="h-32 w-full rounded-[1.5rem]" />
      </div>
    </div>
  );
}

export function SchoolArticleReviewView({ articleId }: { articleId: string }) {
  const t = useTranslations("school.dashboard.articleEditor");
  const common = useTranslations("school.dashboard.common");
  const formatter = useFormatter();
  const router = useRouter();
  const article = useSchoolCommunityArticle(articleId);

  const [rejectOpen, setRejectOpen] = useState(false);
  const [requestEditsOpen, setRequestEditsOpen] = useState(false);
  const [commentTarget, setCommentTarget] = useState<SchoolCommunityComment | null>(null);
  const [removedCommentIds, setRemovedCommentIds] = useState<string[]>([]);

  const detail = article.detail;
  const actions = detail?.actions;
  const visibleComments = useMemo(
    () => article.comments.filter((comment) => !removedCommentIds.includes(comment.commentId)),
    [article.comments, removedCommentIds],
  );

  const commentPreview: SchoolArticleCommentPreview | null = commentTarget
    ? {
        id: commentTarget.commentId,
        authorName: commentTarget.author.fullName,
        authorInitials: initials(commentTarget.author.fullName),
        createdAtLabel: formatCommentTime(formatter, commentTarget.createdAt),
        message: commentTarget.content,
      }
    : null;

  const handleApprove = async () => {
    try {
      await article.approve.mutateAsync();
      notify.success(t("messages.approved"));
      router.push(ROUTES.USER.SCHOOL.ARTICLES.LIST);
    } catch (error) {
      notify.error(error instanceof Error ? error.message : t("messages.actionError"));
    }
  };

  const handleReject = async (payload: { reasons: string[]; notes: string }) => {
    try {
      await article.reject.mutateAsync({
        reasons:
          payload.reasons.length > 0
            ? payload.reasons
            : [t("modals.reject.reasons.unspecified")],
        additionalNotes: payload.notes,
      });
      notify.success(t("messages.rejected"));
      setRejectOpen(false);
      router.push(ROUTES.USER.SCHOOL.ARTICLES.LIST);
    } catch (error) {
      notify.error(error instanceof Error ? error.message : t("messages.actionError"));
    }
  };

  const handleRequestEdits = async (payload: { notes: string; hideFromFeed: boolean }) => {
    try {
      await article.requestEdits.mutateAsync(payload);
      notify.success(t("messages.editsRequested"));
      setRequestEditsOpen(false);
      router.push(ROUTES.USER.SCHOOL.ARTICLES.LIST);
    } catch (error) {
      notify.error(error instanceof Error ? error.message : t("messages.actionError"));
    }
  };

  const handleHideToggle = async () => {
    try {
      if (actions?.canHide) {
        await article.hide.mutateAsync({});
        notify.success(t("messages.hidden"));
      } else if (actions?.canUnhide) {
        await article.unhide.mutateAsync();
        notify.success(t("messages.unhidden"));
      }
    } catch (error) {
      notify.error(error instanceof Error ? error.message : t("messages.actionError"));
    }
  };

  const handleDeleteArticle = async () => {
    try {
      await article.remove.mutateAsync();
      notify.success(t("messages.deleted"));
      router.push(ROUTES.USER.SCHOOL.ARTICLES.LIST);
    } catch (error) {
      notify.error(error instanceof Error ? error.message : t("messages.actionError"));
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await article.deleteComment.mutateAsync(commentId);
      setRemovedCommentIds((current) => [...current, commentId]);
      setCommentTarget(null);
      notify.success(t("messages.commentDeleted"));
    } catch (error) {
      notify.error(error instanceof Error ? error.message : t("messages.actionError"));
    }
  };

  const handleHideComment = async (commentId: string) => {
    try {
      await article.hideComment.mutateAsync(commentId);
      setRemovedCommentIds((current) => [...current, commentId]);
      setCommentTarget(null);
      notify.success(t("messages.commentHidden"));
    } catch (error) {
      notify.error(error instanceof Error ? error.message : t("messages.actionError"));
    }
  };

  if (article.isLoading) {
    return (
      <div className="space-y-6">
        <DashboardPageHeader title={t("review.title")} description={t("review.description")} />
        <SchoolArticleReviewSkeleton />
      </div>
    );
  }

  if (article.isError || !detail) {
    return (
      <div className="space-y-4">
        <ApiFailureAlert
          message={article.error instanceof Error ? article.error.message : t("review.loadError")}
          fallbackMessage={t("review.loadError")}
        />
        <Button type="button" variant="outline" onClick={() => void article.refetch()}>
          {common("retry")}
        </Button>
      </div>
    );
  }

  const { article: core } = detail;
  const coverUrl = core.coverImageUrl ? resolveFileUrl(core.coverImageUrl) : null;
  const categoryName =
    core.categories.find((item) => item.isPrimary)?.name ??
    core.primaryCategory?.name ??
    core.categories[0]?.name;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <DashboardBreadcrumb
          items={[
            { label: t("review.breadcrumbs.home"), href: ROUTES.USER.SCHOOL.HOME },
            {
              label: t("review.breadcrumbs.articles"),
              href: ROUTES.USER.SCHOOL.ARTICLES.LIST,
            },
            { label: t("review.breadcrumbs.current") },
          ]}
        />
        <DashboardPageHeader
          title={t("review.title")}
          description={t("review.description")}
          action={
            <div className="flex flex-wrap items-center gap-2">
              {actions?.canReject ? (
                <Button
                  type="button"
                  className="h-11 rounded-xl bg-rose-500 text-white hover:bg-rose-600"
                  onClick={() => setRejectOpen(true)}
                >
                  {t("review.reject")}
                </Button>
              ) : null}
              {actions?.canApprove ? (
                <Button
                  type="button"
                  className="h-11 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600"
                  disabled={article.approve.isPending}
                  onClick={() => void handleApprove()}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {t("review.approve")}
                </Button>
              ) : null}
            </div>
          }
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <Card
            className="rounded-[1.75rem] border-white/80 bg-white"
            style={{ boxShadow: "0px 8px 0px 0px #0000000D" }}
          >
            <CardContent className="space-y-6 p-6 text-right">
              <div className="flex flex-wrap items-center justify-between gap-3">
                {categoryName ? (
                  <span className="rounded-full bg-[#EEF4FD] px-3 py-1 text-xs font-semibold text-[#2B415E]">
                    {categoryName}
                  </span>
                ) : (
                  <span />
                )}
                <DashboardBadge tone={statusTone(core.status)} withDot>
                  {detail.statusLabel || t(`status.${core.status}`)}
                </DashboardBadge>
              </div>

              <h2 className="text-2xl font-extrabold leading-relaxed text-[#1E3A66] sm:text-3xl">
                {core.title}
              </h2>

              <div className="flex items-center gap-3">
                <UserAvatarImageOrInitials
                  trackKey={core.articleId}
                  name={core.author.fullName}
                  imageUrl={core.author.avatarUrl}
                  circleClassName="bg-[#DBEEF6] text-[#255E8A]"
                />
                <div className="text-right">
                  <p className="font-bold text-[#1E3A66]">{core.author.fullName}</p>
                  <p className="text-xs text-slate-500">
                    {core.author.institution ||
                      core.author.specialty ||
                      core.schoolName ||
                      "—"}
                  </p>
                </div>
              </div>

              {coverUrl ? (
                <div className="overflow-hidden rounded-2xl">
                  <Image
                    src={coverUrl}
                    alt={core.title}
                    width={1200}
                    height={640}
                    className="h-auto w-full object-cover"
                    unoptimized
                  />
                </div>
              ) : null}

              {core.content ? (
                <div
                  className="prose prose-slate max-w-none text-right leading-8 text-slate-700"
                  dangerouslySetInnerHTML={{ __html: core.content }}
                />
              ) : core.excerpt ? (
                <p className="leading-8 text-slate-700">{core.excerpt}</p>
              ) : null}

              <div className="space-y-4 border-t border-slate-100 pt-6">
                <h3 className="text-lg font-bold text-[#2C4260]">
                  {t("review.commentsTitle", { count: visibleComments.length })}
                </h3>
                {visibleComments.length === 0 ? (
                  <p className="text-sm text-slate-400">{t("review.commentsEmpty")}</p>
                ) : (
                  <div className="space-y-3">
                    {visibleComments.map((comment) => (
                      <div
                        key={comment.commentId}
                        className="rounded-2xl border border-slate-100 bg-[#F8FAFC] p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <UserAvatarImageOrInitials
                              trackKey={comment.commentId}
                              name={comment.author.fullName}
                              imageUrl={comment.author.avatarUrl}
                              circleClassName="bg-[#DBEEF6] text-[#255E8A]"
                            />
                            <div className="space-y-1 text-right">
                              <p className="font-bold text-[#1E3A66]">
                                {comment.author.fullName}
                              </p>
                              <p className="text-sm leading-relaxed text-slate-600">
                                {comment.content}
                              </p>
                            </div>
                          </div>
                          <p className="shrink-0 text-xs text-slate-400">
                            {formatCommentTime(formatter, comment.createdAt)}
                          </p>
                        </div>
                        {actions?.canHideComment || actions?.canDeleteComment ? (
                          <div className="mt-3 flex flex-wrap justify-end gap-2">
                            {actions.canDeleteComment ? (
                              <Button
                                type="button"
                                variant="outline"
                                className="h-8 rounded-md border-[#FFD9D9] text-xs font-bold text-[#FF4B4B]"
                                onClick={() => setCommentTarget(comment)}
                              >
                                <Trash2 className="h-4 w-4" />
                                {t("modals.comment.delete")}
                              </Button>
                            ) : null}
                            {actions.canHideComment ? (
                              <Button
                                type="button"
                                variant="outline"
                                className="h-8 rounded-md text-xs font-bold text-[#5C7093]"
                                onClick={() => setCommentTarget(comment)}
                              >
                                <EyeOff className="h-4 w-4" />
                                {t("modals.comment.hide")}
                              </Button>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.aside
          className="space-y-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
        >
          {actions?.canApprove ? (
            <Button
              type="button"
              className="h-12 w-full rounded-xl bg-[#2B415E] text-white hover:bg-[#24384f]"
              disabled={article.approve.isPending}
              onClick={() => void handleApprove()}
            >
              <CheckCircle2 className="h-4 w-4" />
              {t("review.share")}
            </Button>
          ) : null}

          <Card
            className="rounded-[1.5rem] border-white/80 bg-white"
            style={{ boxShadow: "0px 8px 0px 0px #0000000D" }}
          >
            <CardContent className="space-y-4 p-5 text-right">
              <h3 className="flex items-center gap-2 text-lg font-bold text-[#2C4260]">
                <MessageSquare className="h-4 w-4" />
                {t("review.summaryTitle")}
              </h3>
              {core.tags.length > 0 ? (
                <div className="flex flex-wrap justify-end gap-2">
                  {core.tags.map((tag) => (
                    <span
                      key={tag.name}
                      className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">{t("review.tagsEmpty")}</p>
              )}
            </CardContent>
          </Card>

          <Card
            className="rounded-[1.5rem] border-dashed border-[#C7AF6E]/50 bg-[#FFFBF0]"
            style={{ boxShadow: "0px 8px 0px 0px #0000000D" }}
          >
            <CardContent className="space-y-3 p-5 text-right">
              <h3 className="flex items-center gap-2 text-lg font-bold text-[#2C4260]">
                <Lightbulb className="h-4 w-4 text-[#C7AF6E]" />
                {t("review.guidelinesTitle")}
              </h3>
              <p className="text-sm leading-relaxed text-slate-600">
                {t("review.guidelinesBody")}
              </p>
            </CardContent>
          </Card>

          <Card
            className="rounded-[1.5rem] border-white/80 bg-white"
            style={{ boxShadow: "0px 8px 0px 0px #0000000D" }}
          >
            <CardContent className="space-y-3 p-5">
              {actions?.canRequestEdits ? (
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 w-full rounded-xl"
                  onClick={() => setRequestEditsOpen(true)}
                >
                  {t("review.requestEdits")}
                </Button>
              ) : null}
              {actions?.canEdit ? (
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 w-full rounded-xl"
                  onClick={() =>
                    router.push(ROUTES.USER.SCHOOL.ARTICLES.EDIT(core.articleId))
                  }
                >
                  <Pencil className="h-4 w-4" />
                  {t("review.edit")}
                </Button>
              ) : null}
              {actions?.canHide || actions?.canUnhide ? (
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 w-full rounded-xl"
                  disabled={article.hide.isPending || article.unhide.isPending}
                  onClick={() => void handleHideToggle()}
                >
                  {actions.canHide ? (
                    <>
                      <EyeOff className="h-4 w-4" />
                      {t("review.hide")}
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4" />
                      {t("review.unhide")}
                    </>
                  )}
                </Button>
              ) : null}
              {actions?.canDelete ? (
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 w-full rounded-xl border-rose-200 text-rose-600"
                  disabled={article.remove.isPending}
                  onClick={() => void handleDeleteArticle()}
                >
                  <Trash2 className="h-4 w-4" />
                  {t("review.delete")}
                </Button>
              ) : null}
            </CardContent>
          </Card>
        </motion.aside>
      </div>

      <SchoolArticleRejectModal
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        title={t("modals.reject.title")}
        infoBannerText={t("modals.reject.info")}
        reasonsTitle={t("modals.reject.reasonsTitle")}
        notesLabel={t("modals.reject.notesLabel")}
        notesPlaceholder={t("modals.reject.notesPlaceholder")}
        confirmLabel={t("modals.reject.confirm")}
        cancelLabel={t("modals.reject.cancel")}
        reasonOptions={[
          { id: "unclearTitle", label: t("modals.reject.reasons.unclearTitle") },
          { id: "needsSources", label: t("modals.reject.reasons.needsSources") },
          { id: "inappropriate", label: t("modals.reject.reasons.inappropriate") },
          { id: "offTopic", label: t("modals.reject.reasons.offTopic") },
        ]}
        onConfirm={handleReject}
      />

      <SchoolArticleRequestEditsModal
        open={requestEditsOpen}
        onOpenChange={setRequestEditsOpen}
        title={t("modals.requestEdits.title")}
        notesLabel={t("modals.requestEdits.notesLabel")}
        notesPlaceholder={t("modals.requestEdits.notesPlaceholder")}
        notesRequired={t("modals.requestEdits.notesRequired")}
        hideFromFeedLabel={t("modals.requestEdits.hideFromFeed")}
        confirmLabel={t("modals.requestEdits.confirm")}
        cancelLabel={t("modals.requestEdits.cancel")}
        onConfirm={handleRequestEdits}
      />

      <SchoolArticleCommentActionModal
        open={Boolean(commentTarget)}
        onOpenChange={(open) => !open && setCommentTarget(null)}
        comment={commentPreview}
        title={t("modals.comment.title")}
        description={t("modals.comment.description")}
        deleteLabel={t("modals.comment.delete")}
        hideLabel={t("modals.comment.hide")}
        cancelLabel={t("modals.comment.cancel")}
        submittingLabel={t("modals.comment.submitting")}
        canDelete={Boolean(actions?.canDeleteComment)}
        canHide={Boolean(actions?.canHideComment)}
        onDelete={handleDeleteComment}
        onHide={handleHideComment}
      />
    </div>
  );
}
