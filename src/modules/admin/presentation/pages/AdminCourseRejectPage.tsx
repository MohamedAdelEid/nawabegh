"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Clock, FileText, ShieldAlert, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import type { CourseReviewDetail, CourseReviewReasonId } from "@/modules/admin/domain/data/courseManagementData";
import { courseManagementData } from "@/modules/admin/domain/data/courseManagementData";
import {
  readLearningPathReviewSnapshot,
  rejectionReasonIdsToBitmask,
} from "@/modules/admin/domain/utils/learningPathModeration";
import {
  getLearningPathById,
  learningPathDetailToCourseReviewDetail,
  rejectLearningPath,
} from "@/modules/admin/infrastructure/api/learningPathsModerationApi";
import { CourseCoverPreview, CourseSectionCard } from "@/modules/admin/presentation/components/course-management";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { notify } from "@/shared/application/lib/toast";
import { DashboardPageHeader } from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";

export function AdminCourseRejectPage({ courseId }: { courseId: string }) {
  const learningPathId = courseId;
  const t = useTranslations("admin.dashboard.courseManagement");
  const router = useRouter();
  const [detail, setDetail] = useState<CourseReviewDetail | null>(null);
  const [asideCoverUrl, setAsideCoverUrl] = useState<string | null>(null);
  const [selectedReasons, setSelectedReasons] = useState<CourseReviewReasonId[]>(["incompleteMaterials"]);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      const snapshot = readLearningPathReviewSnapshot(learningPathId);
      const result = await getLearningPathById(learningPathId);
      if (!alive) return;
      if (result.errorMessage || !result.data) {
        setDetail(null);
        setAsideCoverUrl(null);
        return;
      }
      setAsideCoverUrl(snapshot?.courseCoverImageUrl ?? null);
      setDetail(learningPathDetailToCourseReviewDetail(result.data, snapshot));
    };
    void load();
    return () => {
      alive = false;
    };
  }, [learningPathId]);

  const toggleReason = (reason: CourseReviewReasonId) => {
    setSelectedReasons((prev) =>
      prev.includes(reason) ? prev.filter((item) => item !== reason) : [...prev, reason],
    );
  };

  const submit = async () => {
    if (submitting || selectedReasons.length === 0 || notes.trim().length < 10) {
      notify.error(t("reject.validation"));
      return;
    }
    setSubmitting(true);
    const result = await rejectLearningPath(learningPathId, {
      rejectionNotes: notes.trim(),
      rejectionReasons: rejectionReasonIdsToBitmask(selectedReasons),
    });
    setSubmitting(false);
    if (result.errorMessage) {
      notify.error(result.errorMessage);
      return;
    }
    notify.success(t("messages.rejected"));
    router.push(ROUTES.ADMIN.COURSE_MANAGEMENT.REJECTION_DETAILS(learningPathId));
  };

  if (!detail) {
    return <div className="py-16 text-center text-sm text-slate-500">{t("reject.loading")}</div>;
  }

  return (
    <div className="space-y-7">
      <DashboardPageHeader
        title={t("reject.title")}
        description={t("reject.description")}
        breadcrumbs={[
          { label: t("breadcrumbs.home"), href: ROUTES.ADMIN.HOME },
          { label: t("breadcrumbs.courseManagement"), href: ROUTES.ADMIN.COURSE_MANAGEMENT.LIST },
          { label: t("breadcrumbs.reject") },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <main className="space-y-5">
          <CourseSectionCard title={t("reject.form.title")} icon={AlertTriangle}>
            <div>
              <p className="mb-4 text-sm text-slate-500">{t("reject.form.reasonsLabel")}</p>
              <div className="flex flex-wrap gap-3">
                {courseManagementData.rejectReasons.map((reason) => {
                  const selected = selectedReasons.includes(reason);
                  return (
                    <button
                      key={reason}
                      type="button"
                      onClick={() => toggleReason(reason)}
                      className={[
                        "rounded-full border px-5 py-3 text-sm font-semibold transition-colors",
                        selected
                          ? "border-[#C8AC59] bg-[#F8EFD5] text-[#8F6C0B]"
                          : "border-slate-200 bg-white text-slate-500",
                      ].join(" ")}
                    >
                      {t(`reject.reasons.${reason}`)}
                    </button>
                  );
                })}
              </div>
            </div>
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-slate-600">{t("reject.form.notesLabel")}</span>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                className="min-h-44 w-full rounded-2xl border border-slate-100 bg-slate-50 p-5 text-right text-sm outline-none"
                placeholder={t("reject.form.notesPlaceholder")}
              />
            </label>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>{notes.length} / 1000</span>
              <span>{t("reject.form.minHint")}</span>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button
                className="flex-1 h-14 rounded-2xl bg-[#FF4B4B] px-10 text-white hover:bg-[#FF4B4B] shadow-[0px_4px_0px_0px_#D33131]"
                onClick={() => void submit()}
                disabled={submitting}
              >
                <XCircle className="h-5 w-5" />
                {submitting ? t("reject.actions.submitting") : t("reject.actions.confirm")}
              </Button>
              <Button
                variant="outline"
                className="h-14 rounded-2xl border-slate-200 px-10 shadow-[0px_4px_0px_0px_#0000000D]"
                onClick={() => router.push(ROUTES.ADMIN.COURSE_MANAGEMENT.REVIEW(learningPathId))}
              >
                {t("reject.actions.cancel")}
              </Button>
            </div>
          </CourseSectionCard>

          <div className="rounded-2xl border border-[#F8EFD5] bg-[#FFFCF4] p-5 text-right text-sm leading-7 text-slate-700">
            <strong className="text-[#8F6C0B]">{t("reject.after.title")}</strong>
            <p>{t("reject.after.body")}</p>
          </div>
        </main>
        <aside>
          <Card className="rounded-[1.75rem] border-white/80 bg-white shadow-[0px_8px_0px_0px_#0000000D]">
            <CardContent className="space-y-5 p-5">
              <CourseCoverPreview
                tone={detail.coverTone}
                label={detail.coverLabel}
                imageUrl={asideCoverUrl}
                className="h-44 w-full"
              />
              <h2 className="text-2xl font-bold text-slate-800">{detail.title}</h2>
              <div className="space-y-3 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-slate-400" />
                  <span>{detail.teacherName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-slate-400" />
                  <span>{detail.categoryLabel}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-400" />
                  <span>{detail.durationLabel}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
