"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  CircleCheck,
  Eye,
  EyeOff,
  MessageSquare,
  Trash2,
  UserX,
  X,
  ArrowRight,
  ArrowLeft,
  Send,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  getArticleReviewDetailById,
  submitArticleAmendmentRequest,
  submitArticleCommentAuthorSuspension,
  submitArticleCommentModeration,
  type ArticleReviewComment,
  type ArticleReviewDecision,
  type ArticleReviewDetail,
  type CommentAuthorSuspensionDuration,
} from "@/modules/admin/domain/data/articleEditorReviewData";
import {
  approveCommunityArticle,
  hideCommunityArticle,
  rejectCommunityArticle,
  unhideCommunityArticle,
} from "@/modules/admin/infrastructure/api/communityArticlesApi";
import type { ArticleStatusId } from "@/modules/admin/domain/data/articleEditorDashboardData";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { cn } from "@/shared/application/lib/cn";
import { notify } from "@/shared/application/lib/toast";
import {DashboardBadge,
  DashboardPageHeader,
  DashboardBreadcrumb,} from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { StatusSwitch } from "@/shared/presentation/components/ui/StatusSwitch";
import Message from "../assets/icons/Message";
import HiddenEye from "../assets/icons/HiddenEye";
import {
  ArticleCommentAuthorSuspendModal,
  ArticleCommentModerationModal,
  ArticleRejectModal,
  type RejectReason,
} from "@/modules/admin/presentation/components/article-editor";
import { UserAvatarImageOrInitials } from "@/shared/presentation/components/user";

interface AdminArticleEditorReviewPageProps {
  articleId: string;
}

function reviewArticleStatusTone(status: ArticleStatusId) {
  if (status === "published") return "success" as const;
  if (status === "pendingReview") return "warning" as const;
  if (status === "rejected") return "danger" as const;
  if (status === "needsEdits") return "warning" as const;
  if (status === "hidden") return "neutral" as const;
  return "neutral" as const;
}

/** Same rules as `ArticleEditorDashboard` row actions. */
function canHideArticleForAdmin(statusId: ArticleStatusId) {
  return statusId !== "hidden" && statusId !== "rejected";
}

function canUnhideArticleForAdmin(statusId: ArticleStatusId) {
  return statusId === "hidden";
}

export function AdminArticleEditorReviewPage({
  articleId,
}: AdminArticleEditorReviewPageProps) {
  const t = useTranslations("admin.dashboard.articleEditor.reviewPage");
  const tEditor = useTranslations("admin.dashboard.articleEditor");
  const tReq = useTranslations("admin.dashboard.articleEditor.requestAmendmentsPage");
  const locale = useLocale();
  const router = useRouter();
  const [detail, setDetail] = useState<ArticleReviewDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [commentModerationTarget, setCommentModerationTarget] =
    useState<ArticleReviewComment | null>(null);
  const [suspendAuthorTarget, setSuspendAuthorTarget] = useState<ArticleReviewComment | null>(null);
  const [commentLocalState, setCommentLocalState] = useState<
    Record<string, "visible" | "hidden" | "removed">
  >({});
  const [decision, setDecision] = useState<ArticleReviewDecision | null>(null);
  const [notes, setNotes] = useState("");
  const [articleActionPending, setArticleActionPending] = useState(false);
  const [hideArticlePending, setHideArticlePending] = useState(false);
  const [hideFromFeed, setHideFromFeed] = useState(false);
  const [requestEditsPending, setRequestEditsPending] = useState(false);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      setIsLoading(true);
      const data = await getArticleReviewDetailById(articleId, locale);
      console.log("data", data);
      if (!alive) return;
      setDetail(data);
      setIsLoading(false);
    };
    void load();
    return () => {
      alive = false;
    };
  }, [articleId, locale]);

  useEffect(() => {
    if (!detail) {
      setCommentLocalState({});
      return;
    }
    const seeded: Record<string, "visible" | "hidden" | "removed"> = {};
    for (const c of detail.comments) {
      if (c.serverCommentStatus !== 0) {
        seeded[c.id] = "hidden";
      }
    }
    setCommentLocalState(seeded);
  }, [detail?.id]);

  const commentsToRender = useMemo(() => {
    if (!detail) return [];
    return detail.comments.filter((comment) => commentLocalState[comment.id] !== "removed");
  }, [detail, commentLocalState]);

  console.log("commentsToRender", detail?.comments);
  const completionTone = useMemo(() => {
    if (!detail) return "warning";
    return detail.reviewSummary.informationCompletionPercent >= 80
      ? ("success" as const)
      : ("warning" as const);
  }, [detail]);

  const canReviewArticle =
    detail?.statusId === "pendingReview" || detail?.statusId === "needsEdits";

  const handleApproveArticle = async () => {
    if (!detail || articleActionPending || !canReviewArticle) return;
    setArticleActionPending(true);
    const result = await approveCommunityArticle(detail.id);
    setArticleActionPending(false);
    if (result.errorMessage) {
      notify.error(result.errorMessage ?? tEditor("table.loadError"));
      return;
    }
    setDecision("approve");
    notify.success(result.message ?? tEditor("table.actions.approve"));
    router.push(ROUTES.ADMIN.ARTICLE_EDITOR.LIST);
    router.refresh();
  };

  const handleToggleArticleVisibility = async () => {
    if (!detail || hideArticlePending) return;
    const isHidden = detail.statusId === "hidden";
    if (isHidden && !canUnhideArticleForAdmin(detail.statusId)) return;
    if (!isHidden && !canHideArticleForAdmin(detail.statusId)) return;

    setHideArticlePending(true);
    const result = isHidden
      ? await unhideCommunityArticle(detail.id)
      : await hideCommunityArticle(detail.id);
    setHideArticlePending(false);

    if (result.errorMessage) {
      notify.error(result.errorMessage ?? tEditor("table.loadError"));
      return;
    }
    notify.success(
      result.message ??
        (isHidden ? tEditor("table.actions.showSuccess") : tEditor("table.actions.hideSuccess")),
    );
    const data = await getArticleReviewDetailById(articleId, locale);
    setDetail(data);
    router.refresh();
  };

  const confirmRejectFromModal = async (payload: { reasons: RejectReason[]; notes: string }) => {
    if (!detail || articleActionPending || !canReviewArticle) return;
    setArticleActionPending(true);
    const reasonLabels = payload.reasons.map((reason) =>
      tEditor(`modals.reject.reasons.${reason}`),
    );
    const result = await rejectCommunityArticle(detail.id, {
      reasons:
        reasonLabels.length > 0 ? reasonLabels : [tEditor("modals.reject.reasons.unspecified")],
      additionalNotes: payload.notes.trim(),
    });
    setArticleActionPending(false);
    if (result.errorMessage) {
      notify.error(result.errorMessage ?? tEditor("table.loadError"));
      return;
    }
    setRejectModalOpen(false);
    setDecision("reject");
    notify.success(result.message ?? tEditor("modals.reject.confirm"));
    router.push(ROUTES.ADMIN.ARTICLE_EDITOR.LIST);
    router.refresh();
  };

  const handleCommentModalDelete = async (commentId: string) => {
    if (!detail) return;
    const result = await submitArticleCommentModeration(detail.id, commentId, "delete");
    if (!result.ok) {
      notify.error(result.errorMessage ?? t("comments.moderationError"));
      return;
    }
    setCommentLocalState((prev) => ({ ...prev, [commentId]: "removed" }));
    setCommentModerationTarget(null);
  };

  const handleCommentModalHide = async (commentId: string, reason: string) => {
    if (!detail) return;
    const result = await submitArticleCommentModeration(detail.id, commentId, "hide", reason);
    if (!result.ok) {
      notify.error(result.errorMessage ?? t("comments.moderationError"));
      return;
    }
    setCommentLocalState((prev) => ({ ...prev, [commentId]: "hidden" }));
    setCommentModerationTarget(null);
  };

  const handleSuspendAuthorConfirm = async (payload: {
    duration: CommentAuthorSuspensionDuration;
    reason: string;
  }) => {
    if (!detail || !suspendAuthorTarget) return;
    const result = await submitArticleCommentAuthorSuspension(suspendAuthorTarget.authorUserId, payload);
    if (!result.ok) {
      notify.error(result.errorMessage ?? t("comments.suspendAuthorError"));
      return;
    }
    notify.success(result.message ?? t("comments.suspendAuthorSuccess"));
    setSuspendAuthorTarget(null);
  };

  if (isLoading) {
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
    <div className="space-y-8">
            <div className="space-y-2">
        <DashboardBreadcrumb items={[
          { label: t("header.breadcrumbs.home"), href: ROUTES.ADMIN.HOME },
          { label: t("header.breadcrumbs.articleEditor"), href: `${ROUTES.ADMIN.HOME}?tab=articleEditor` },
          { label: t("header.breadcrumbs.review") },
        ]} />
        <DashboardPageHeader
        title={t("header.title")}
        description={t("header.description")}
        action={
          canReviewArticle ? 
          <div className="flex gap-2">
          <Button
            type="button"
            className="h-12 w-[10rem] rounded-xl bg-[#FF4B4B] text-md font-semibold text-white shadow-[0px_4px_0px_0px_#D33131] hover:bg-[#E13E3E]"
            disabled={articleActionPending || !canReviewArticle}
            onClick={() => setRejectModalOpen(true)}
          >
            <X className="h-4 w-4" />
            {t("actions.reject")}
          </Button>
          <Button
            type="button"
            className="h-12 w-[10rem] rounded-xl bg-[#67C23A] text-md font-semibold text-white shadow-[0px_4px_0px_0px_#46A302] hover:bg-[#57B32B]"
            disabled={articleActionPending || !canReviewArticle}
            onClick={() => void handleApproveArticle()}
          >
            <CircleCheck className="h-4 w-4" />
            {t("actions.approve")}
          </Button>
          </div>
        : null}
      />
      </div>

      <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_25rem]">
        <Card className="overflow-hidden rounded-[1.75rem] border-white/80 bg-white" style={{ boxShadow: "0px 8px 0px 0px #0000000D" }}>
          <CardContent className="space-y-6 p-6 sm:p-8">
            <div className="space-y-3 border-b-3 border-slate-100 pb-5">
              <DashboardBadge tone={reviewArticleStatusTone(detail.statusId)} className="w-fit">
                {tEditor(`table.status.${detail.statusId}`)}
              </DashboardBadge>
              <h1 className="text-4xl font-bold leading-tight text-[#1E3A66]">
                {detail.title}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                <span>{detail.category}</span>
                <span>•</span>
                <span>{t("content.readTime", { minutes: detail.readTimeMinutes })}</span>
                <span>•</span>
                <span>{detail.schoolName}</span>
              </div>
              {detail.tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {detail.tags.map((tag, tagIndex) => (
                    <span
                      key={`${detail.id}-tag-${tagIndex}-${tag}`}
                      className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
              <div className="flex items-center gap-2">
                <UserAvatarImageOrInitials
                  trackKey={detail.id}
                  name={detail.authorName}
                  imageUrl={detail.authorAvatarImageUrl}
                  circleClassName="bg-[#DBEEF6] text-[#255E8A]"
                />
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-700">{detail.authorName}</p>
                  <p className="text-xs text-slate-400">{detail.authorRole}</p>
                </div>
              </div>
            </div>

            <div className="font-sans text-slate-700 text-lg leading-relaxed prose prose-sm max-w-none " dangerouslySetInnerHTML={{ __html: detail.content }} />

            <div className="overflow-hidden rounded-2xl border border-slate-100 bg-gradient-to-b from-[#102338] to-[#1f466f] p-3">
              <div className="relative flex h-80 items-center justify-center overflow-hidden rounded-xl bg-white/10">
                {detail.coverImageUrl ? (
                  <Image
                    src={detail.coverImageUrl}
                    alt={detail.coverImageAlt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 800px"
                    unoptimized
                  />
                ) : (
                  <span className="px-4 text-center text-sm text-white/90">{detail.coverImageAlt}</span>
                )}
              </div>
              <p className="mt-2 text-center text-xs text-slate-300">
                {t("content.coverCaption")}
              </p>
            </div>

            {detail.keyPoints.length > 0 ? (
              <div className="space-y-3">
                <h2 className="text-3xl font-extrabold text-[#1E3A66]">
                  {t("content.keyPointsTitle")}
                </h2>
                <ul className="space-y-2 text-lg text-slate-700">
                  {detail.keyPoints.map((point, index) => (
                    <li key={`${detail.id}-k-${index}`} className="flex items-start gap-2">
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#C7AF6E]" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="space-y-4 border-t-3 border-slate-100 pt-5">
              <h3 className="flex items-center gap-2 text-2xl font-extrabold text-[#1E3A66]">
                <Message className="h-5 w-5 shrink-0" fillColor="#1E3A66" />
                <span>{t("comments.title", { count: commentsToRender.length })}</span>
              </h3>
              <div className="space-y-3">
                {commentsToRender.map((comment) => (
                  <div
                    key={comment.id}
                    className={cn(
                      "rounded-xl border border-[#E2E8F0] bg-white px-5 py-4 shadow-[0_2px_10px_0_#0F172A08]",
                      (commentLocalState[comment.id] ?? "visible") === "hidden" && "opacity-75",
                    )}
                  >
                    {(commentLocalState[comment.id] ?? "visible") === "hidden" ? (
                      <div className="mb-3 flex justify-end">
                        <DashboardBadge tone="neutral" className="w-fit text-xs">
                          {t("comments.hiddenBadge")}
                        </DashboardBadge>
                      </div>
                    ) : null}
                    <div className="flex items-start gap-3">
                      <UserAvatarImageOrInitials
                        trackKey={comment.id}
                        name={comment.authorName}
                        imageUrl={comment.authorAvatarImageUrl}
                        size="md"
                        circleClassName="bg-[#DBEEF6] text-[#255E8A]"
                      />
                      <div className="min-w-0">
                        <p className="text-lg font-extrabold text-[#1E3A66]">
                          {comment.authorName}
                        </p>
                        <p className="text-md text-slate-500">{comment.createdAtLabel}</p>
                      </div>
                    </div>
                    <p className="mt-5 text-md leading-[1.8] text-[#1E3A66]">
                      {comment.message}
                    </p>
                    {comment.canModerate ? (
                      <div className="mt-5 flex flex-wrap items-center gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          className="h-8 rounded-md border-[#E2EAF6] text-xs px-4 font-bold text-[#5C7093]"
                          disabled={!comment.authorUserId}
                          onClick={() => setSuspendAuthorTarget(comment)}
                        >
                          <UserX className="h-4 w-4" />
                          {t("comments.actions.suspendAuthor")}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="h-8 rounded-md border-[#E2EAF6] text-xs px-4 font-bold text-[#5C7093]"
                          onClick={() => setCommentModerationTarget(comment)}
                        >
                          <EyeOff className="h-4 w-4" />
                          {t("comments.actions.hide")}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="h-8 rounded-md border-[#FFD9D9] text-xs px-4 font-bold text-[#FF4B4B] hover:bg-red-50 hover:text-[#FF4B4B] transition-none"
                          onClick={() => setCommentModerationTarget(comment)}
                        >
                          <Trash2 className="h-4 w-4" />
                          {t("comments.actions.delete")}
                        </Button>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>

            {/* <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(ROUTES.ADMIN.ARTICLE_EDITOR.LIST)}
                className="rounded-xl border-[#DCE6F3] text-[#2C4260]"
              >
                {t("backToList")}
              </Button>
            </div> */}
          </CardContent>
        </Card>
        <aside className="space-y-4">
          <Card className="rounded-[1.5rem] border-white/80 bg-white" style={{ boxShadow: "0px 8px 0px 0px #0000000D" }}>
            <CardContent className="space-y-4 p-5 text-right">
              <h3 className="flex items-center gap-2 text-lg font-bold text-[#2C4260]">
                <MessageSquare className="h-4 w-4" />
                {t("summary.title")}
              </h3>
              {/* <div className="rounded-xl border border-[#EEF4FD] bg-[#FAFCFF] p-4">
                <p className="text-xs text-slate-400">{t("summary.completionLabel")}</p>
                <div className="mt-2 flex items-center justify-between">
                  <DashboardBadge tone={completionTone} withDot>
                    {t("summary.percent", {
                      value: detail.reviewSummary.informationCompletionPercent,
                    })}
                  </DashboardBadge>
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                </div>
              </div> */}

              <div className="space-y-2">
                {/* <p className="text-xs font-medium text-slate-500">{t("summary.tagsLabel")}</p> */}
                {detail.tags.length > 0 ? (
                  <div className="flex flex-wrap justify-end gap-2">
                    {detail.tags.map((tag, tagIndex) => (
                      <span
                        key={`${detail.id}-summary-tag-${tagIndex}-${tag}`}
                        className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">{t("summary.tagsEmpty")}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[1.5rem] border-white/80 bg-white" style={{ boxShadow: "0px 8px 0px 0px #0000000D" }}>
            <CardContent className="space-y-4 p-5 text-right">
              <h3 className="text-lg font-bold text-[#2C4260]">{t("actions.title")}</h3>
              {/* <p className="text-xs leading-relaxed text-slate-500">{tReq("main.statusBanner")}</p> */}
              {/* <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={4}
                placeholder={t("actions.notesPlaceholder")}
                disabled={!canReviewArticle || requestEditsPending}
                className="w-full resize-none rounded-md border border-[#E2E8F0] bg-[#F1F3F5] p-3 text-right text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#243B5A]/20 disabled:opacity-60"
              /> */}

              <div className="rounded-xl border border-[#E2E8F0] bg-[#FAFCFF] p-3">
                <p className="text-sm font-bold text-[#1E3A66]">{tReq("sidebar.visibilityTitle")}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  {tReq("sidebar.visibilityDescription")}
                </p>
                {/* <div className="mt-3 flex items-center justify-between gap-2">
                  <span className="text-sm font-bold text-[#1E3A66]">
                    {hideFromFeed ? tReq("sidebar.visibilityToggleOn") : tReq("sidebar.visibilityToggleOff")}
                  </span>
                  <StatusSwitch
                    checked={hideFromFeed}
                    onChange={setHideFromFeed}
                    // disabled={!canReviewArticle || requestEditsPending}
                    activeLabel={tReq("sidebar.visibilityToggleOn")}
                    inactiveLabel={tReq("sidebar.visibilityToggleOff")}
                    activeClassName="bg-emerald-500"
                    inactiveClassName="bg-slate-200"
                  />
                </div> */}
              </div>

              <div className="grid grid-cols-1 gap-2">
                <Button
                  type="button"
                  className="flex items-center justify-start h-11 rounded-md bg-[#fff] text-[#000] hover:bg-[#fff] hover:text-[#000] border-2 border-[#E2E8F0]"
                  disabled={
                    hideArticlePending ||
                    !(
                      canUnhideArticleForAdmin(detail.statusId) ||
                      canHideArticleForAdmin(detail.statusId)
                    )
                  }
                  onClick={() => void handleToggleArticleVisibility()}
                >
                  {detail.statusId === "hidden" ? (
                    <Eye className="h-4 w-4" aria-hidden />
                  ) : (
                    <HiddenEye className="h-4 w-4" aria-hidden />
                  )}
                  {detail.statusId === "hidden"
                    ? t("actions.showArticleOnPlatform")
                    : t("actions.hideArticleFromPlatform")}
                </Button>
              </div>
              <Button
                type="button"
                variant="outline"
                disabled={
                  requestEditsPending ||
                  articleActionPending ||
                  hideArticlePending
                }
                className="h-16 w-full cursor-pointer rounded-xl border-[#DCE6F3] bg-[#2B415E] text-md font-semibold text-white transition-none hover:bg-[#2B415E]/95 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => router.push(ROUTES.ADMIN.ARTICLE_EDITOR.REQUEST_AMENDMENTS(detail.id))}
              >
                <span className="inline-flex items-center justify-center gap-2">
                  <Send className="h-4 w-4 shrink-0" />
                  {requestEditsPending ? tReq("actions.submitting") : t("actions.sendDecisionToAuthor")}
                </span>
              </Button>
              {/* {decision ? (
                <p className="rounded-lg bg-[#F8FAFC] px-3 py-2 text-xs text-slate-500">
                  {t("actions.currentDecision")}: {t(`actions.decisions.${decision}`)}
                </p>
              ) : null} */}
            </CardContent>
          </Card>

          <Card className="rounded-[1rem] border-dashed border-[#D9C9A4] bg-[#FFFDF8]">
            <CardContent className="p-4 text-right text-xs leading-6 text-[#8F6C0B]">
              <p className="font-semibold">{t("tips.title")}</p>
              <p>{t("tips.body")}</p>
            </CardContent>
          </Card>
        </aside>
      </div>

      <ArticleRejectModal
        open={rejectModalOpen}
        onOpenChange={setRejectModalOpen}
        title={tEditor("modals.reject.title")}
        infoBannerText={tEditor("modals.reject.infoBanner")}
        reasonsTitle={tEditor("modals.reject.reasonsTitle")}
        notesLabel={tEditor("modals.reject.notesLabel")}
        notesPlaceholder={tEditor("modals.reject.notesPlaceholder")}
        confirmLabel={tEditor("modals.reject.confirm")}
        cancelLabel={tEditor("modals.reject.cancel")}
        closeLabel={tEditor("modals.reject.close")}
        reasonOptions={[
          { id: "inaccurateInfo", label: tEditor("modals.reject.reasons.inaccurateInfo") },
          { id: "inappropriate", label: tEditor("modals.reject.reasons.inappropriate") },
          { id: "policyViolation", label: tEditor("modals.reject.reasons.policyViolation") },
          { id: "formatWeak", label: tEditor("modals.reject.reasons.formatWeak") },
        ]}
        onConfirm={confirmRejectFromModal}
      />

      <ArticleCommentModerationModal
        open={commentModerationTarget !== null}
        onOpenChange={(open) => {
          if (!open) setCommentModerationTarget(null);
        }}
        comment={
          commentModerationTarget
            ? {
                id: commentModerationTarget.id,
                authorName: commentModerationTarget.authorName,
                authorInitials: getCommentInitials(commentModerationTarget.authorName),
                createdAtLabel: commentModerationTarget.createdAtLabel,
                message: commentModerationTarget.message,
              }
            : null
        }
        title={t("comments.moderationModal.title")}
        description={t("comments.moderationModal.description")}
        deleteLabel={t("comments.moderationModal.deleteComment")}
        hideLabel={t("comments.moderationModal.hideComment")}
        cancelLabel={t("comments.moderationModal.cancel")}
        submittingLabel={t("comments.moderationModal.submitting")}
        hideReasonLabel={t("comments.moderationModal.hideReasonLabel")}
        hideReasonPlaceholder={t("comments.moderationModal.hideReasonPlaceholder")}
        hideReasonRequired={t("comments.moderationModal.hideReasonRequired")}
        onDelete={handleCommentModalDelete}
        onHide={handleCommentModalHide}
      />

      <ArticleCommentAuthorSuspendModal
        open={suspendAuthorTarget !== null}
        onOpenChange={(open) => {
          if (!open) setSuspendAuthorTarget(null);
        }}
        author={
          suspendAuthorTarget
            ? {
                name: suspendAuthorTarget.authorName,
                email: suspendAuthorTarget.authorEmail,
                trackKey:
                  suspendAuthorTarget.authorUserId.trim() !== ""
                    ? suspendAuthorTarget.authorUserId
                    : suspendAuthorTarget.id,
                imageUrl: suspendAuthorTarget.authorAvatarImageUrl,
              }
            : null
        }
        title={t("comments.suspendAuthorModal.title")}
        subtitle={t("comments.suspendAuthorModal.subtitle")}
        closeLabel={t("comments.suspendAuthorModal.close")}
        activeAuthorBadge={t("comments.suspendAuthorModal.activeAuthorBadge")}
        durationLabel={t("comments.suspendAuthorModal.durationLabel")}
        durationDay={t("comments.suspendAuthorModal.durationDay")}
        durationWeek={t("comments.suspendAuthorModal.durationWeek")}
        durationMonth={t("comments.suspendAuthorModal.durationMonth")}
        durationPermanent={t("comments.suspendAuthorModal.durationPermanent")}
        reasonLabel={t("comments.suspendAuthorModal.reasonLabel")}
        reasonPlaceholder={t("comments.suspendAuthorModal.reasonPlaceholder")}
        warningText={t("comments.suspendAuthorModal.warning")}
        cancelLabel={t("comments.suspendAuthorModal.cancel")}
        confirmLabel={t("comments.suspendAuthorModal.confirm")}
        submittingLabel={t("comments.suspendAuthorModal.submitting")}
        onConfirm={handleSuspendAuthorConfirm}
      />
    </div>
  );
}

function getCommentInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  if (parts.length === 0) return "؟";
  return parts.map((part) => part[0]).join("");
}
