"use client";

import {
  BookOpen,
  ChartColumnIncreasing,
  Download,
  Eye,
  FileText,
  FlaskConical,
  FolderOpen,
  Lock,
  Map,
  Pencil,
  PlayCircle,
  Send,
  Trophy,
  Users,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useTeacherCourseDetails } from "@/modules/teacher/application/hooks/useTeacherCourseDetails";
import { useTeacherSendCourseForReview } from "@/modules/teacher/application/hooks/useTeacherCourseMutations";
import { CourseStatusBadge } from "@/modules/admin/presentation/components/course-management";
import { teacherCourseStatusToBadge } from "@/modules/teacher/presentation/components/courses/teacherCourseMappers";
import type { TeacherCourseCurriculumItem } from "@/modules/teacher/domain/types/teacher.types";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { notify } from "@/shared/application/lib/toast";
import { cn } from "@/shared/application/lib/cn";
import { resolveFileUrl } from "@/shared/infrastructure/files/fileUrl";
import { DashboardBadge } from "@/shared/presentation/components/dashboard/DashboardBadge";
import { Button } from "@/shared/presentation/components/ui/button";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { TeacherCourseDetailsSkeleton } from "@/modules/teacher/presentation/components/courses/TeacherCourseDetailsSkeleton";
import { TeacherCourseSubscriberRankingsCard } from "@/modules/teacher/presentation/components/courses/subscribers";
import { UserAvatarImageOrInitials } from "@/shared/presentation/components/user";

function CurriculumItemIcon({ type }: { type: TeacherCourseCurriculumItem["type"] }) {
  if (type === "video") return <PlayCircle className="h-5 w-5 text-[#2C4260]" />;
  if (type === "quiz") return <FileText className="h-5 w-5 text-[#C9A227]" />;
  if (type === "pdf") return <FileText className="h-5 w-5 text-red-500" />;
  return <Lock className="h-5 w-5 text-slate-400" />;
}
import { useRouter } from "next/navigation";

export function TeacherCourseDetailsView({ courseId }: { courseId: string }) {
  const t = useTranslations("teacher.dashboard");
  const router = useRouter();
  const { data, isLoading, isError } = useTeacherCourseDetails(courseId);
  const sendForReviewMutation = useTeacherSendCourseForReview(courseId);

  const handleSendForReview = async () => {
    try {
      await sendForReviewMutation.mutateAsync();
      notify.success(t("courses.details.actions.sendForReviewSuccess"));
    } catch (error) {
      notify.error(error instanceof Error ? error.message : t("common.error"));
    }
  };

  if (isLoading) {
    return <TeacherCourseDetailsSkeleton label={t("common.loading")} />;
  }

  if (isError || !data) {
    return <p className="text-sm text-red-600">{t("common.error")}</p>;
  }

  const coverImageSrc = resolveFileUrl(data.coverImageUrl);

  return (
    <div className="space-y-6">
      <div
        className={cn(
          "relative min-h-[16rem] overflow-hidden rounded-[2rem] p-8 text-white flex-col",
          coverImageSrc
            ? "bg-[#2C4260]"
            : "bg-gradient-to-br from-[#1e293b] via-[#2C4260] to-[#334155]",
        )}
      >
        {coverImageSrc ? (
          <>
            <img
              src={coverImageSrc}
              alt={data.title}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1a2a3a]/95 via-[#2C4260]/55 to-[#2C4260]/25" />
          </>
        ) : (
          <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_20%_30%,white_0,transparent_25%),radial-gradient(circle_at_80%_70%,white_0,transparent_20%)]" />
        )}
        <div className="flex flex-col relative z-10 space-y-4 flex-1">
          <div className="flex flex-wrap justify-end gap-2">
            <CourseStatusBadge
              status={teacherCourseStatusToBadge(data.status)}
              label={t(`courses.list.status.${data.status}`)}
            />
            {data.isPublished ? (
              <DashboardBadge tone="success">{t("courses.details.published")}</DashboardBadge>
            ) : null}
            <DashboardBadge tone="neutral">{data.termLabel}</DashboardBadge>
          </div>
          <div>
            <h1 className="text-3xl font-bold">{data.title}</h1>
            <p className="text-sm text-white/80">
              {t("courses.details.subjectLine", {
                subject: data.subject,
                term: data.termLabel,
              })}
            </p>
            {data.rejectionNotes ? (
              <p className="rounded-xl bg-red-500/20 px-4 py-2 text-sm text-red-100">{data.rejectionNotes}</p>
            ) : null}
          </div>
        </div>
      </div>

      <Card className="rounded-[2rem] border-white/80 bg-white shadow-[var(--dashboard-shadow-soft)]">
        <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <UserAvatarImageOrInitials
              trackKey={data.id}
              name={data.instructorName}
              imageUrl={data.instructorAvatarUrl ?? null}
              size="md"
            />
            <div className="text-right">
              <p className="text-sm text-slate-500">{t("courses.details.instructorLabel")}</p>
              <p className="font-semibold text-slate-800">{data.instructorName}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button 
              className="h-10 rounded-xl bg-[#2C4260] px-6 text-base font-semibold text-white hover:bg-[#243751] cursor-pointer shadow-[var(--dashboard-shadow-button)]"
              onClick={() => router.push(ROUTES.USER.TEACHER.JOURNEY_EDITOR.EDITOR(courseId))}
            >
              <Map className="h-5 w-5" aria-hidden />
              {t("courses.details.actions.viewJourney")}
            </Button>
            {data.canEditContent ? (
              <Button 
                className="h-10 rounded-xl border-slate-200 bg-white px-6 text-slate-700 hover:bg-slate-50 shadow-[var(--dashboard-shadow-button)]" 
                onClick={() => router.push(ROUTES.USER.TEACHER.COURSES.EDIT(courseId))}
              >
                <Pencil className="h-5 w-5" aria-hidden />
                {t("courses.details.actions.editCourse")}
              </Button>
            ) : null}
            <Button 
              className="h-10 rounded-xl border-slate-200 bg-white px-6 text-slate-700 hover:bg-slate-50 shadow-[var(--dashboard-shadow-button)]" 
              onClick={() => router.push(ROUTES.USER.TEACHER.COURSES.STATISTICS(courseId))}
            >
              <ChartColumnIncreasing className="h-5 w-5" aria-hidden />
              {t("courses.details.actions.viewStatistics")}
            </Button>
            {data.canSendForReview ? (
              <Button
                className="rounded-xl bg-[#C9A227] text-[#2C4260] hover:bg-[#C9A227]/90"
                disabled={sendForReviewMutation.isPending}
                onClick={() => void handleSendForReview()}
              >
                <Send className="ml-2 h-4 w-4" />
                {t("courses.details.actions.sendForReview")}
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { icon: FlaskConical, label: t("courses.details.labels.subject"), value: data.subject, tone: "border-blue-500" },
              { icon: Trophy, label: t("courses.details.labels.grade"), value: data.grade, tone: "border-emerald-500" },
              {
                icon: BookOpen,
                label: t("courses.details.metrics.stations"),
                value: t("courses.details.metrics.stationsValue", { count: data.lessonCount }),
                tone: "border-amber-500",
              },
              {
                icon: Wallet,
                label: t("courses.details.metrics.price"),
                value: data.priceLabel,
                tone: "border-emerald-500",
              },
            ].map((metric) => (
              <Card
                key={metric.label}
                className={`rounded-[1.5rem] border-b-4 ${metric.tone} border-white/80 bg-white shadow-[var(--dashboard-shadow-soft)]`}
              >
                <CardContent className="space-y-3 p-5 text-right">
                  <metric.icon className="h-6 w-6 text-[#2C4260]" />
                  <p className="text-sm text-slate-500">{metric.label}</p>
                  <p className="text-xl font-bold text-slate-800">{metric.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="rounded-[2rem] border-white/80 bg-white shadow-[var(--dashboard-shadow-soft)]">
            <CardContent className="space-y-6 p-6">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-xl font-bold text-slate-800">{t("courses.details.curriculum.title")}</h2>
                <Button variant="link" className="text-[#C9A227]" asChild>
                  <Link href={ROUTES.USER.TEACHER.JOURNEY_EDITOR.EDITOR(courseId)}>
                    {t("courses.details.curriculum.viewPath")}
                  </Link>
                </Button>
              </div>

              {data.curriculum.length === 0 ? (
                <p className="text-center text-sm text-slate-500">{t("courses.details.curriculum.empty")}</p>
              ) : (
                <div className="space-y-8">
                  {data.curriculum.map((unit) => (
                    <div key={unit.id} className="space-y-4">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-800">{unit.title}</h3>
                        {unit.status ? (
                          <DashboardBadge tone="neutral">{t(`courses.list.status.${unit.status}`)}</DashboardBadge>
                        ) : null}
                      </div>
                      <div className="space-y-3 border-r-2 border-slate-200 pr-6">
                        {unit.items.map((item) => (
                          <div
                            key={item.id}
                            className={`flex items-center justify-between gap-4 rounded-2xl border p-4 ${
                              item.locked ? "border-slate-100 bg-slate-50 opacity-60" : "border-slate-100 bg-slate-50"
                            }`}
                          >
                            <div className="flex flex-1 items-center gap-3 text-right">
                              <CurriculumItemIcon type={item.type} />
                              <div>
                                <p className="font-medium text-slate-800">{item.title}</p>
                                <p className="text-xs text-slate-500">{item.metaLabel}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {item.type === "pdf" ? (
                                <Button variant="ghost" size="icon" className="rounded-xl">
                                  <Download className="h-4 w-4" />
                                </Button>
                              ) : (
                                <Button variant="ghost" size="icon" className="rounded-xl">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="h-fit rounded-[2rem] border-transparent bg-[#2C4260] text-white shadow-[var(--dashboard-shadow-soft)]">
            <CardContent className="space-y-6 p-6 text-right">
              <h2 className="text-lg font-bold">{t("courses.details.managementStats.title")}</h2>
              <div className="space-y-2">
                <Users className="mb-1 h-5 w-5 text-white/70" />
                <p className="text-4xl font-bold">{data.registeredStudents}</p>
                <p className="text-sm text-white/70">{t("courses.details.managementStats.registered")}</p>
              </div>
              <div className="space-y-2">
                <Map className="mb-1 h-5 w-5 text-white/70" />
                <p className="text-4xl font-bold">{data.learningPathCount}</p>
                <p className="text-sm text-white/70">{t("courses.details.managementStats.learningPaths")}</p>
              </div>
              <div className="space-y-2">
                <FolderOpen className="mb-1 h-5 w-5 text-white/70" />
                <p className="text-4xl font-bold">{data.fileCount}</p>
                <p className="text-sm text-white/70">{t("courses.details.managementStats.files")}</p>
              </div>
            </CardContent>
          </Card>

          <TeacherCourseSubscriberRankingsCard courseId={courseId} />
        </div>
      </div>
    </div>
  );
}
