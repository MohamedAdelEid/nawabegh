"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Mail, RotateCcw, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import type { CourseReviewDetail } from "@/modules/admin/domain/data/courseManagementData";
import { readLearningPathReviewSnapshot } from "@/modules/admin/domain/utils/learningPathModeration";
import {
  getLearningPathById,
  learningPathDetailToCourseReviewDetail,
} from "@/modules/admin/infrastructure/api/learningPathsModerationApi";
import { CourseCoverPreview, CourseSectionCard, CourseStatusBadge } from "@/modules/admin/presentation/components/course-management";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import {DashboardPageHeader,
  DashboardBreadcrumb,} from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { UserAvatarImageOrInitials } from "@/shared/presentation/components/user";

export function AdminCourseRejectionDetailsPage({ courseId }: { courseId: string }) {
  const learningPathId = courseId;
  const t = useTranslations("admin.dashboard.courseManagement");
  const router = useRouter();
  const [detail, setDetail] = useState<CourseReviewDetail | null>(null);

  const [asideCoverUrl, setAsideCoverUrl] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      const snapshot = readLearningPathReviewSnapshot(learningPathId);
      const result = await getLearningPathById(learningPathId);
      if (!alive) return;
      if (!result.errorMessage && result.data) {
        setAsideCoverUrl(snapshot?.courseCoverImageUrl ?? null);
        setDetail(learningPathDetailToCourseReviewDetail(result.data, snapshot));
      }
    };
    void load();
    return () => {
      alive = false;
    };
  }, [learningPathId]);

  if (!detail) {
    return <div className="py-16 text-center text-sm text-slate-500">{t("rejectionDetails.loading")}</div>;
  }

  return (
    <div className="space-y-7">
            <div className="space-y-2">
        <DashboardBreadcrumb items={[
          { label: t("breadcrumbs.home"), href: ROUTES.ADMIN.HOME },
          { label: t("breadcrumbs.courseManagement"), href: ROUTES.ADMIN.COURSE_MANAGEMENT.LIST },
          { label: t("breadcrumbs.rejectionDetails") },
        ]} />
        <DashboardPageHeader
        title={t("rejectionDetails.title")}
        action={
          <div className="flex gap-3">
            <Button className="h-12 rounded-2xl bg-[#C8AC59] text-white hover:bg-[#B79A46]">
              {t("rejectionDetails.actions.editDecision")}
            </Button>
            <Button variant="outline" className="h-12 rounded-2xl border-slate-200">
              <Mail className="h-4 w-4" />
              {t("rejectionDetails.actions.contactTeacher")}
            </Button>
          </div>
        }
      />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <main className="space-y-6">
          <Card className="overflow-hidden rounded-[1.75rem] border-white/80 bg-white shadow-[0px_8px_0px_0px_#0000000D]">
            <CardContent className="grid gap-5 p-5 md:grid-cols-[12rem_minmax(0,1fr)]">
              <div className="flex flex-col gap-3 justify-center items-start">
                <CourseStatusBadge status="rejected" label={t("status.rejected")} />
                <CourseCoverPreview
                  tone={detail.coverTone}
                  label={detail.coverLabel}
                  imageUrl={asideCoverUrl}
                  className="h-40 w-full"
                />
              </div>
              <div className="flex flex-col justify-center gap-3">
                <h2 className="mt-3 text-3xl font-bold text-slate-800">{detail.title}</h2>
                <div className="mt-3 flex flex-wrap gap-2 items-center">
                  <UserAvatarImageOrInitials 
                    trackKey={detail.reviewerName}
                    name={detail.reviewerName}
                    imageUrl={null}
                    circleClassName="bg-[#2C4260] text-white"
                  />
                  <p className="font-bold text-slate-800">{detail.reviewerName}</p>
                </div>
                <div className="flex flex-wrap gap-2 items-center text-sm text-slate-400">
                  <span className="inline-flex items-center gap-2">
                    {detail.submittedAt.slice(0, 10)}
                    <CalendarDays className="h-4 w-4" />
                  </span>
                  <span className="inline-flex items-center gap-2">
                    {detail.teacherName}
                    <UserRound className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <CourseSectionCard title={t("rejectionDetails.notes.title")}>
            <div className="rounded-2xl bg-[#F1F5F9] p-6 text-lg leading-8 text-[#0F172A]">
              {detail.reviewNotes}
            </div>
            <div className="flex items-center gap-3 border-t-2 border-slate-200 pt-5">
              <UserAvatarImageOrInitials
                trackKey={detail.reviewerName}
                name={detail.reviewerName}
                imageUrl={null}
                circleClassName="bg-[#2C4260] text-white"
              />
              <div>
                <p className="font-bold text-slate-800">{detail.reviewerName}</p>
                <p className="text-xs text-slate-400">{t("rejectionDetails.notes.reviewerRole")}</p>
              </div>
            </div>
          </CourseSectionCard>
        </main>
        <aside className="space-y-5">
          <Card className="rounded-[1.75rem] border-white/80 bg-white shadow-[0px_8px_0px_0px_#0000000D]">
            <CardContent className="space-y-4 p-5">
              <h2 className="font-bold text-slate-800">{t("rejectionDetails.reasons.title")}</h2>
              {detail.reviewReasons.map((reason) => (
                <span
                  key={reason}
                  className="block w-fit rounded-full border border-red-300 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600"
                >
                  {t(`reject.reasons.${reason}`)}
                </span>
              ))}
              <p className="text-xs leading-6 text-slate-400">{t("rejectionDetails.reasons.help")}</p>
            </CardContent>
          </Card>

          <Card className="rounded-[1.75rem] border-white/80 bg-white shadow-[0px_8px_0px_0px_#0000000D]">
            <CardContent className="space-y-4 p-5">
              <h2 className="font-bold text-slate-800">{t("rejectionDetails.timeline.title")}</h2>
              {["received", "reviewStarted", "decisionIssued"].map((event) => (
                <div key={event} className="flex items-start gap-3 text-sm">
                  <span className="mt-1 h-2 w-2 rounded-full bg-[#58CC02]" />
                  <div>
                    <p className="font-semibold text-slate-700">{t(`rejectionDetails.timeline.${event}.title`)}</p>
                    <p className="text-xs text-slate-400">{t(`rejectionDetails.timeline.${event}.time`)}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Button
            className="h-14 w-full rounded-2xl bg-[#2C4260] text-white hover:bg-[#243751] shadow-[0px_4px_0px_0px_#1E2E42]"
            onClick={() => router.push(ROUTES.ADMIN.COURSE_MANAGEMENT.REVIEW(learningPathId))}
          >
            <RotateCcw className="h-4 w-4" />
            {t("rejectionDetails.actions.reReview")}
          </Button>
        </aside>
      </div>
    </div>
  );
}
