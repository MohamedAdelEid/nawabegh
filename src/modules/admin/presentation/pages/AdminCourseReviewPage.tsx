"use client";

import { useEffect, useState } from "react";
import {
  Archive,
  BookOpen,
  CheckCircle2,
  Download,
  Eye,
  FileText,
  FlaskConical,
  Globe,
  GraduationCap,
  Pencil,
  PlayCircle,
  UploadCloud,
  Users,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import type { CourseReviewDetail } from "@/modules/admin/domain/data/courseManagementData";
import {
  canApproveCourse,
  canArchiveCourse,
  canPublishCourse,
  canRejectCourse,
  canUnpublishCourse,
} from "@/modules/admin/domain/utils/courseModeration";
import { stationTypeToCurriculumKey } from "@/modules/admin/domain/utils/courseContentMappers";
import {
  approveCourse,
  archiveCourse,
  getCourseDetails,
  publishCourse,
  unpublishCourse,
} from "@/modules/admin/infrastructure/api/courseApi";
import {
  CourseArchiveConfirmModal,
  CourseMetricTile,
  CourseSectionCard,
  CoursePublishConfirmModal,
  CoursePublishedBadge,
  CourseStatusBadge,
  CourseUnpublishedBadge,
} from "@/modules/admin/presentation/components/course-management";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { resolveGradeLabel } from "@/shared/domain/utils/grade.utils";
import { notify } from "@/shared/application/lib/toast";
import {
  DashboardPageHeader,
  DashboardBreadcrumb,
} from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { UserAvatarImageOrInitials } from "@/shared/presentation/components/user";

export function AdminCourseReviewPage({ courseId }: { courseId: string }) {
  const t = useTranslations("admin.dashboard.courseManagement");
  const locale = useLocale();
  const router = useRouter();
  const [detail, setDetail] = useState<CourseReviewDetail | null>(null);
  const [loadState, setLoadState] = useState<"loading" | "success" | "error" | "notFound">("loading");
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [publishingAction, setPublishingAction] = useState<"publish" | "unpublish" | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      setLoadState("loading");
      const result = await getCourseDetails(courseId, {
        getStationLabel: (type) => {
          const key = stationTypeToCurriculumKey(type);
          return t(`review.curriculum.stationTypes.${key}`);
        },
      });
      if (!alive) return;
      if (result.errorMessage || !result.data) {
        setLoadState("notFound");
        return;
      }
      setDetail(result.data);
      setLoadState("success");
    };
    void load();
    return () => {
      alive = false;
    };
  }, [courseId, t]);

  const approve = async () => {
    const result = await approveCourse(courseId);
    if (result.errorMessage) {
      notify.error(result.errorMessage);
      return;
    }
    notify.success(
      detail && !detail.isPublished
        ? `${t("messages.approved")} ${t("review.publishing.approveHint")}`
        : t("messages.approved"),
    );
    router.push(ROUTES.ADMIN.COURSE_MANAGEMENT.LIST);
  };

  const executeArchive = async () => {
    if (isArchiving) return;
    setIsArchiving(true);
    const result = await archiveCourse(courseId);
    setIsArchiving(false);
    if (result.errorMessage) {
      notify.error(result.errorMessage);
      return;
    }
    notify.success(t("messages.archived"));
    setArchiveOpen(false);
    router.push(ROUTES.ADMIN.COURSE_MANAGEMENT.LIST);
  };

  const executePublishing = async () => {
    if (!publishingAction || isPublishing) return;
    setIsPublishing(true);
    const result =
      publishingAction === "publish"
        ? await publishCourse(courseId)
        : await unpublishCourse(courseId);
    setIsPublishing(false);
    if (result.errorMessage) {
      notify.error(result.errorMessage);
      return;
    }
    notify.success(
      publishingAction === "publish" ? t("messages.published") : t("messages.unpublished"),
    );
    setPublishingAction(null);
    setDetail((current) =>
      current
        ? { ...current, isPublished: publishingAction === "publish" }
        : current,
    );
  };

  if (loadState === "loading") {
    return <div className="py-16 text-center text-sm text-slate-500">{t("review.loading")}</div>;
  }

  if (!detail || loadState === "error" || loadState === "notFound") {
    return (
      <div className="rounded-3xl border border-amber-100 bg-amber-50 p-8 text-center text-sm text-amber-900">
        {t("review.notFound")}
      </div>
    );
  }

  const gradeLabel = resolveGradeLabel(locale, detail);
  const showApprove = canApproveCourse(detail.statusId);
  const showReject = canRejectCourse(detail.statusId);
  const showArchive = canArchiveCourse(detail.statusId);
  const showPublish = canPublishCourse(detail.statusId, detail.isPublished);
  const showUnpublish = canUnpublishCourse(detail.statusId, detail.isPublished);
  const showDecisionCard = showApprove || showReject;
  const showRejectionDetails =
    detail.statusId === "rejected" &&
    (detail.reviewNotes !== "—" || detail.reviewReasons.length > 0);

  return (
    <div className="space-y-7">
      <div className="space-y-2">
        <DashboardBreadcrumb
          items={[
            { label: t("breadcrumbs.home"), href: ROUTES.ADMIN.HOME },
            { label: t("breadcrumbs.courseManagement"), href: ROUTES.ADMIN.COURSE_MANAGEMENT.LIST },
            { label: detail.title },
          ]}
        />
        <DashboardPageHeader title={t("review.title")} description={t("review.description")} />
      </div>

      <Card className="overflow-hidden rounded-[2rem] border-white/80 bg-white shadow-[0px_8px_0px_0px_#0000000D]">
        <div className="relative min-h-48 bg-[#203A5A] p-8 text-right text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,.18),transparent_30%),linear-gradient(90deg,rgba(255,255,255,.08),transparent)]" />
          <div className="relative flex min-h-32 flex-col justify-end">
            <div className="mb-3 flex flex-wrap gap-2">
              <CourseStatusBadge status={detail.statusId} label={t(`status.${detail.statusId}`)} />
              {detail.statusId === "approved" ? (
                detail.isPublished ? (
                  <CoursePublishedBadge label={t("review.publishing.published")} />
                ) : (
                  <CourseUnpublishedBadge label={t("review.publishing.unpublished")} />
                )
              ) : null}
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs">{gradeLabel}</span>
            </div>
            <h1 className="text-3xl font-bold">{detail.title}</h1>
            <p className="mt-2 text-sm text-white/75">
              {detail.subject} · {detail.termLabel}
            </p>
          </div>
        </div>
        <CardContent className="flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center justify-end gap-3 text-right">
            <UserAvatarImageOrInitials
              trackKey={detail.id}
              name={detail.teacherName}
              imageUrl={detail.teacherAvatarUrl}
              circleClassName="bg-[#2C4260] text-white"
              size="md"
            />
            <div>
              <p className="text-xs text-slate-400">{t("review.teacherLabel")}</p>
              <p className="font-bold text-slate-800">{detail.teacherName}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {showPublish ? (
              <Button
                className="h-12 rounded-xl bg-[#58CC02] px-5 text-white hover:bg-[#4DB802] shadow-[0px_4px_0px_0px_#46A302]"
                onClick={() => setPublishingAction("publish")}
              >
                <Globe className="h-4 w-4" aria-hidden />
                {t("review.actions.publish")}
              </Button>
            ) : null}
            {showUnpublish ? (
              <Button
                variant="outline"
                className="h-12 rounded-xl border-slate-200 shadow-[0px_4px_0px_0px_#0000000D]"
                onClick={() => setPublishingAction("unpublish")}
              >
                <UploadCloud className="h-4 w-4" aria-hidden />
                {t("review.actions.unpublish")}
              </Button>
            ) : null}
            {showArchive ? (
              <Button
                variant="outline"
                className="h-12 rounded-xl border-slate-200 shadow-[0px_4px_0px_0px_#0000000D]"
                onClick={() => setArchiveOpen(true)}
              >
                <Archive className="h-4 w-4" aria-hidden />
                {t("review.actions.archive")}
              </Button>
            ) : null}
            <Button
              variant="outline"
              className="h-12 rounded-xl border-[#2C4260] text-[#2C4260] shadow-[0px_4px_0px_0px_#1E2E42]"
              onClick={() => router.push(ROUTES.ADMIN.COURSE_MANAGEMENT.EDIT(courseId))}
            >
              <Pencil className="h-4 w-4" aria-hidden />
              {t("review.actions.editCourse")}
            </Button>
            <Button
              className="h-12 rounded-xl bg-[#2C4260] px-5 text-white hover:bg-[#243751] shadow-[0px_4px_0px_0px_#1E2E42]"
              onClick={() => router.push(ROUTES.ADMIN.JOURNEY_EDITOR.EDITOR(courseId))}
            >
              <BookOpen className="h-4 w-4" aria-hidden />
              {t("review.actions.viewPath")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <main className="space-y-6">
          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <CourseMetricTile icon={FlaskConical} label={t("review.metrics.subject")} value={detail.subject} />
            <CourseMetricTile
              icon={GraduationCap}
              label={t("review.metrics.stage")}
              value={gradeLabel}
              tone="warning"
            />
            <CourseMetricTile
              icon={BookOpen}
              label={t("review.metrics.stations")}
              value={String(detail.lessonCount)}
              tone="warning"
            />
            <CourseMetricTile
              icon={Users}
              label={t("review.metrics.price")}
              value={detail.priceLabel}
              tone="success"
            />
          </section>

          {showRejectionDetails ? (
            <CourseSectionCard title={t("review.rejection.title")} icon={XCircle}>
              <div className="space-y-4 text-right text-sm text-slate-700">
                {detail.reviewReasons.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {detail.reviewReasons.map((reason) => (
                      <span
                        key={reason}
                        className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700"
                      >
                        {t(`reject.reasons.${reason}`)}
                      </span>
                    ))}
                  </div>
                ) : null}
                {detail.reviewNotes !== "—" ? (
                  <p className="rounded-2xl bg-slate-50 p-4 leading-7">{detail.reviewNotes}</p>
                ) : null}
              </div>
            </CourseSectionCard>
          ) : null}

          <CourseSectionCard title={t("review.curriculum.title")} icon={BookOpen}>
            <div className="space-y-4">
              {detail.curriculum.length === 0 ? (
                <p
                  className={[
                    "rounded-2xl p-6 text-center text-sm",
                    detail.curriculumLoadError
                      ? "border border-amber-200 bg-amber-50 text-amber-900"
                      : "border border-dashed border-slate-200 bg-slate-50 text-slate-500",
                  ].join(" ")}
                >
                  {detail.curriculumLoadError ?? t("review.curriculum.empty")}
                </p>
              ) : (
                detail.curriculum.map((unit) => (
                  <div key={unit.id} className="relative space-y-3">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2B415E] text-white">
                        <GraduationCap className="h-5 w-5" />
                      </div>
                      <div className="flex flex-1 flex-wrap items-center gap-2">
                        <h3 className="font-bold text-[#2C4260]">{unit.title}</h3>
                        {unit.statusId ? (
                          <CourseStatusBadge
                            status={unit.statusId}
                            label={t(`status.${unit.statusId}`)}
                          />
                        ) : null}
                      </div>
                    </div>
                    <div className="absolute right-[1rem] top-[3rem] h-[calc(100%-3rem)] w-[.5rem] rounded-full bg-slate-200" />
                    {unit.items.map((item) => (
                      <div
                        key={item.id}
                        className="mr-[3rem] flex items-center justify-between gap-4 rounded-2xl bg-slate-50 p-4 text-sm"
                      >
                        <div className="flex flex-1 items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#2C4260]">
                            {item.type === "video" ? (
                              <PlayCircle className="h-5 w-5" />
                            ) : (
                              <FileText className="h-5 w-5" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">{item.title}</p>
                            <p className="text-xs text-slate-400">
                              {item.durationLabel} · {item.metaLabel}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400">
                          {item.type === "video" ? <Eye className="h-4 w-4" /> : null}
                          {item.type === "pdf" ? <Download className="h-4 w-4" /> : null}
                        </div>
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>
          </CourseSectionCard>
        </main>
        <aside className="space-y-5">
          <Card className="rounded-[1.75rem] border-white/80 bg-[#2C4260] text-white shadow-[0px_8px_0px_0px_#0000000D]">
            <CardContent className="space-y-5 p-6 text-right">
              <h2 className="text-xl font-bold">{t("review.adminStats.title")}</h2>
              <div>
                <p className="text-4xl font-bold">{detail.studentCount}</p>
                <p className="text-sm text-white/70">{t("review.adminStats.students")}</p>
              </div>
              <div>
                <p className="text-3xl font-bold">{detail.totalRevenueLabel}</p>
                <p className="text-sm text-white/70">{t("review.adminStats.revenue")}</p>
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span>{t("review.adminStats.completion")}</span>
                  <span>{detail.completionRate}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-white/15">
                  <div
                    className="h-full rounded-full bg-[#58CC02]"
                    style={{ width: `${detail.completionRate}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {detail.statusId === "approved" && !detail.isPublished ? (
            <Card className="rounded-[1.75rem] border-amber-100 bg-amber-50 shadow-[0px_8px_0px_0px_#0000000D]">
              <CardContent className="space-y-4 p-5 text-right text-sm leading-7 text-amber-900">
                <p className="font-bold">{t("review.publishing.catalogTitle")}</p>
                <p>{t("review.publishing.catalogHint")}</p>
                <Button
                  className="h-11 w-full rounded-xl bg-[#58CC02] text-white hover:bg-[#4DB802] shadow-[0px_4px_0px_0px_#46A302]"
                  onClick={() => setPublishingAction("publish")}
                >
                  <Globe className="h-4 w-4" aria-hidden />
                  {t("review.actions.publish")}
                </Button>
              </CardContent>
            </Card>
          ) : null}

          {showDecisionCard ? (
            <Card className="rounded-[1.75rem] border-white/80 bg-white shadow-[0px_8px_0px_0px_#0000000D]">
              <CardContent className="space-y-4 p-5 text-right">
                <h2 className="text-xl font-bold text-slate-800">{t("review.decision.title")}</h2>
                {showReject ? (
                  <p className="text-sm text-slate-500">{t("review.decision.rejectHint")}</p>
                ) : null}
                {showApprove ? (
                  <Button
                    className="h-12 w-full rounded-xl bg-[#58CC02] text-white hover:bg-[#58CC02] shadow-[0px_4px_0px_0px_#46A302]"
                    onClick={() => void approve()}
                  >
                    <CheckCircle2 className="h-4 w-4" aria-hidden />
                    {t("review.decision.approve")}
                  </Button>
                ) : null}
                {showReject ? (
                  <Button
                    className="h-12 w-full rounded-xl bg-[#FF4B4B] text-white hover:bg-[#FF4B4B] shadow-[0px_4px_0px_0px_#D33131]"
                    onClick={() => router.push(ROUTES.ADMIN.COURSE_MANAGEMENT.REJECT(detail.id))}
                  >
                    <XCircle className="h-4 w-4" aria-hidden />
                    {t("review.decision.reject")}
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          ) : null}
        </aside>
      </div>

      <CourseArchiveConfirmModal
        open={archiveOpen}
        onOpenChange={(open) => {
          if (!open && !isArchiving) setArchiveOpen(false);
        }}
        courseTitle={detail.title}
        teacherName={detail.teacherName}
        title={t("archiveModal.title")}
        description={t("archiveModal.description")}
        courseLabel={t("archiveModal.courseLabel")}
        teacherLabel={t("archiveModal.teacherLabel")}
        confirmLabel={t("archiveModal.confirm")}
        cancelLabel={t("archiveModal.cancel")}
        archivingLabel={t("archiveModal.archiving")}
        onConfirm={() => void executeArchive()}
        isConfirming={isArchiving}
      />

      <CoursePublishConfirmModal
        variant={publishingAction ?? "publish"}
        open={publishingAction !== null}
        onOpenChange={(open) => {
          if (!open && !isPublishing) setPublishingAction(null);
        }}
        courseTitle={detail.title}
        teacherName={detail.teacherName}
        title={t(publishingAction === "unpublish" ? "unpublishModal.title" : "publishModal.title")}
        description={t(
          publishingAction === "unpublish"
            ? "unpublishModal.description"
            : "publishModal.description",
        )}
        courseLabel={t(
          publishingAction === "unpublish"
            ? "unpublishModal.courseLabel"
            : "publishModal.courseLabel",
        )}
        teacherLabel={t(
          publishingAction === "unpublish"
            ? "unpublishModal.teacherLabel"
            : "publishModal.teacherLabel",
        )}
        confirmLabel={t(
          publishingAction === "unpublish" ? "unpublishModal.confirm" : "publishModal.confirm",
        )}
        cancelLabel={t(
          publishingAction === "unpublish" ? "unpublishModal.cancel" : "publishModal.cancel",
        )}
        processingLabel={t(
          publishingAction === "unpublish"
            ? "unpublishModal.processing"
            : "publishModal.processing",
        )}
        onConfirm={() => void executePublishing()}
        isConfirming={isPublishing}
      />
    </div>
  );
}
