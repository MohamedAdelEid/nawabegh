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
  GraduationCap,
  Pencil,
  PlayCircle,
  Users,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import type { CourseReviewDetail } from "@/modules/admin/domain/data/courseManagementData";
import {
  approveCourse,
  archiveCourse,
  getCourseDetails,
} from "@/modules/admin/infrastructure/api/courseApi";
import {
  CourseMetricTile,
  CourseSectionCard,
  CourseStatusBadge,
} from "@/modules/admin/presentation/components/course-management";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { notify } from "@/shared/application/lib/toast";
import { DashboardPageHeader } from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { UserAvatarImageOrInitials } from "@/shared/presentation/components/user";

export function AdminCourseReviewPage({ courseId }: { courseId: string }) {
  const t = useTranslations("admin.dashboard.courseManagement");
  const router = useRouter();
  const [detail, setDetail] = useState<CourseReviewDetail | null>(null);
  const [loadState, setLoadState] = useState<"loading" | "success" | "error" | "notFound">("loading");

  useEffect(() => {
    let alive = true;
    const load = async () => {
      setLoadState("loading");
      const result = await getCourseDetails(courseId);
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
  }, [courseId]);

  const approve = async () => {
    const result = await approveCourse(courseId);
    if (result.errorMessage) {
      notify.error(result.errorMessage);
      return;
    }
    notify.success(t("messages.approved"));
    router.push(ROUTES.ADMIN.COURSE_MANAGEMENT.LIST);
  };

  const archive = async () => {
    const ok = typeof window !== "undefined" ? window.confirm(t("table.confirmArchive")) : true;
    if (!ok) return;
    const result = await archiveCourse(courseId);
    if (result.errorMessage) {
      notify.error(result.errorMessage);
      return;
    }
    notify.success(t("messages.archived"));
    router.push(ROUTES.ADMIN.COURSE_MANAGEMENT.LIST);
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

  const canReview = detail.statusId === "pending" || detail.statusId === "draft";

  return (
    <div className="space-y-7">
      <DashboardPageHeader
        title={t("review.title")}
        description={t("review.description")}
        breadcrumbs={[
          { label: t("breadcrumbs.home"), href: ROUTES.ADMIN.HOME },
          { label: t("breadcrumbs.courseManagement"), href: ROUTES.ADMIN.COURSE_MANAGEMENT.LIST },
          { label: detail.title },
        ]}
      />

      <Card className="overflow-hidden rounded-[2rem] border-white/80 bg-white shadow-[0px_8px_0px_0px_#0000000D]">
        <div className="relative min-h-48 bg-[#203A5A] p-8 text-right text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,.18),transparent_30%),linear-gradient(90deg,rgba(255,255,255,.08),transparent)]" />
          <div className="relative flex min-h-32 flex-col justify-end">
            <div className="mb-3 flex flex-wrap gap-2">
              <CourseStatusBadge status={detail.statusId} label={t(`status.${detail.statusId}`)} />
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs">{detail.stageLabel}</span>
            </div>
            <h1 className="text-3xl font-bold">{detail.title}</h1>
            <p className="mt-2 text-sm text-white/75">{detail.subject} · {detail.termLabel}</p>
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
            <Button
              variant="outline"
              className="h-12 rounded-xl border-slate-200 shadow-[0px_4px_0px_0px_#0000000D]"
              onClick={() => void archive()}
            >
              <Archive className="h-4 w-4" aria-hidden />
              {t("review.actions.archive")}
            </Button>
            <Button
              variant="outline"
              className="h-12 rounded-xl border-[#2C4260] text-[#2C4260] shadow-[0px_4px_0px_0px_#1E2E42]"
              onClick={() => router.push(ROUTES.ADMIN.COURSE_MANAGEMENT.EDIT(courseId))}
            >
              <Pencil className="h-4 w-4" aria-hidden />
              {t("review.actions.editCourse")}
            </Button>
            <Button className="h-12 rounded-xl bg-[#2C4260] px-5 text-white hover:bg-[#243751] shadow-[0px_4px_0px_0px_#1E2E42]"
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
            <CourseMetricTile icon={GraduationCap} label={t("review.metrics.stage")} value={detail.stageLabel} tone="warning" />
            <CourseMetricTile icon={BookOpen} label={t("review.metrics.lessons")} value={String(detail.lessonCount)} tone="warning" />
            <CourseMetricTile icon={Users} label={t("review.metrics.price")} value={detail.priceLabel} tone="success" />
          </section>

          <CourseSectionCard title={t("review.curriculum.title")} icon={BookOpen}>
            <div className="space-y-4">
              {detail.curriculum.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                  {t("review.curriculum.empty")}
                </p>
              ) : (
                detail.curriculum.map((unit) => (
                  <div key={unit.id} className="space-y-3 relative">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2B415E] text-white">
                        <GraduationCap className="h-5 w-5" />
                      </div>
                      <h3 className="font-bold text-[#2C4260]">{unit.title}</h3>
                    </div>
                    <div className="absolute right-[1rem] top-[3rem] w-[.5rem] h-[calc(100%-3rem)] bg-slate-200 rounded-full"/>
                    {unit.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 p-4 text-sm mr-[3rem]"
                      >
                        <div className="flex flex-1 items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#2C4260]">
                            {item.type === "video" ? <PlayCircle className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">{item.title}</p>
                            <p className="text-xs text-slate-400">{item.durationLabel} · {item.metaLabel}</p>
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
                  <div className="h-full rounded-full bg-[#58CC02]" style={{ width: `${detail.completionRate}%` }} />
                </div>
              </div>
            </CardContent>
          </Card>

          {canReview ? (
            <Card className="rounded-[1.75rem] border-white/80 bg-white shadow-[0px_8px_0px_0px_#0000000D]">
              <CardContent className="space-y-4 p-5 text-right">
                <h2 className="text-xl font-bold text-slate-800">{t("review.decision.title")}</h2>
                <textarea
                  className="min-h-28 w-full rounded-2xl border border-slate-100 bg-slate-50 p-4 text-right text-sm outline-none"
                  placeholder={t("review.decision.placeholder")}
                />
                <Button
                  className="h-12 w-full rounded-xl bg-[#58CC02] text-white hover:bg-[#58CC02] shadow-[0px_4px_0px_0px_#46A302]"
                  onClick={() => void approve()}
                >
                  <CheckCircle2 className="h-4 w-4" aria-hidden />
                  {t("review.decision.approve")}
                </Button>
                <Button
                  className="h-12 w-full rounded-xl bg-[#FF4B4B] text-white hover:bg-[#FF4B4B] shadow-[0px_4px_0px_0px_#D33131]"
                  onClick={() => router.push(ROUTES.ADMIN.COURSE_MANAGEMENT.REJECT(detail.id))}
                >
                  <XCircle className="h-4 w-4" aria-hidden />
                  {t("review.decision.reject")}
                </Button>
              </CardContent>
            </Card>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
