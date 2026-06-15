"use client";

import {
  BookOpen,
  Download,
  Eye,
  FlaskConical,
  Lock,
  Map,
  Pencil,
  PlayCircle,
  Trophy,
  Wallet,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useTeacherCourseDetails } from "@/modules/teacher/application/hooks/useTeacherCourseDetails";
import { CourseStatusBadge } from "@/modules/admin/presentation/components/course-management";
import { teacherCourseStatusToBadge } from "@/modules/teacher/presentation/components/courses/teacherCourseMappers";
import type { TeacherCourseCurriculumItem } from "@/modules/teacher/domain/types/teacher.types";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { DashboardBadge } from "@/shared/presentation/components/dashboard/DashboardBadge";
import { Button } from "@/shared/presentation/components/ui/button";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";
import { UserAvatarImageOrInitials } from "@/shared/presentation/components/user";

function CurriculumItemIcon({ type }: { type: TeacherCourseCurriculumItem["type"] }) {
  if (type === "video") return <PlayCircle className="h-5 w-5 text-[#2C4260]" />;
  if (type === "quiz") return <FileText className="h-5 w-5 text-[#C9A227]" />;
  if (type === "pdf") return <FileText className="h-5 w-5 text-red-500" />;
  return <Lock className="h-5 w-5 text-slate-400" />;
}

export function TeacherCourseDetailsView({ courseId }: { courseId: string }) {
  const t = useTranslations("teacher.dashboard");
  const { data, isLoading, isError } = useTeacherCourseDetails(courseId);

  if (isLoading) {
    return <Skeleton className="h-96 w-full rounded-[2rem]" />;
  }

  if (isError || !data) {
    return <p className="text-sm text-red-600">{t("common.error")}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#1e293b] via-[#2C4260] to-[#334155] p-8 text-white">
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_20%_30%,white_0,transparent_25%),radial-gradient(circle_at_80%_70%,white_0,transparent_20%)]" />
        <div className="relative space-y-4 text-right">
          <div className="flex flex-wrap justify-end gap-2">
            <CourseStatusBadge
              status={teacherCourseStatusToBadge(data.status)}
              label={t(`courses.list.status.${data.status}`)}
            />
            <DashboardBadge tone="neutral">{t(data.gradeKey)}</DashboardBadge>
          </div>
          <h1 className="text-3xl font-bold">{t(data.titleKey)}</h1>
          <p className="text-sm text-white/80">
            {t("courses.details.subjectLine", {
              subject: t(data.subjectKey),
              term: t(data.termKey),
            })}
          </p>
        </div>
      </div>

      <Card className="rounded-[2rem] border-white/80 bg-white shadow-[var(--dashboard-shadow-soft)]">
        <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <UserAvatarImageOrInitials
              trackKey={data.id}
              name={t(data.instructorNameKey)}
              imageUrl={data.instructorAvatarUrl ?? null}
              size="md"
            />
            <div className="text-right">
              <p className="text-sm text-slate-500">{t("courses.details.instructorLabel")}</p>
              <p className="font-semibold text-slate-800">{t(data.instructorNameKey)}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button className="rounded-xl bg-[#2C4260]" asChild>
              <Link href={ROUTES.USER.TEACHER.JOURNEY_EDITOR.EDITOR(courseId)}>
                <Map className="ml-2 h-4 w-4" />
                {t("courses.details.actions.viewJourney")}
              </Link>
            </Button>
            <Button variant="outline" className="rounded-xl" asChild>
              <Link href={ROUTES.USER.TEACHER.COURSES.EDIT(courseId)}>
                <Pencil className="ml-2 h-4 w-4" />
                {t("courses.details.actions.editCourse")}
              </Link>
            </Button>
            <Button variant="secondary" className="rounded-xl" asChild>
              <Link href={ROUTES.USER.TEACHER.COURSES.STATISTICS(courseId)}>
                {t("courses.details.actions.viewStatistics")}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { icon: FlaskConical, label: t(data.subjectLabelKey), value: t(data.subjectKey), tone: "border-blue-500" },
              { icon: Trophy, label: t(data.gradeLabelKey), value: t(data.gradeKey), tone: "border-emerald-500" },
              {
                icon: BookOpen,
                label: t("courses.details.metrics.lessons"),
                value: t("courses.details.metrics.lessonsValue", { count: data.lessonCount }),
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
                <Button variant="link" className="text-[#C9A227]">
                  {t("courses.details.curriculum.viewPath")}
                </Button>
                <h2 className="text-xl font-bold text-slate-800">{t("courses.details.curriculum.title")}</h2>
              </div>

              <div className="space-y-8">
                {data.curriculum.map((unit) => (
                  <div key={unit.id} className="space-y-4">
                    <h3 className="text-right font-bold text-slate-800">{t(unit.titleKey)}</h3>
                    <div className="space-y-3 border-r-2 border-slate-200 pr-6">
                      {unit.items.map((item) => (
                        <div
                          key={item.id}
                          className={`flex items-center justify-between gap-4 rounded-2xl border p-4 ${
                            item.locked ? "border-slate-100 bg-slate-50 opacity-60" : "border-slate-100 bg-slate-50"
                          }`}
                        >
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
                          <div className="flex flex-1 items-center justify-end gap-3 text-right">
                            <div>
                              <p className="font-medium text-slate-800">{t(item.titleKey)}</p>
                              <p className="text-xs text-slate-500">{t(item.metaKey)}</p>
                              {item.subMetaKey ? (
                                <p className="text-xs text-slate-400">{t(item.subMetaKey)}</p>
                              ) : null}
                            </div>
                            <CurriculumItemIcon type={item.type} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit rounded-[2rem] border-transparent bg-[#2C4260] text-white shadow-[var(--dashboard-shadow-soft)]">
          <CardContent className="space-y-6 p-6 text-right">
            <h2 className="text-lg font-bold">{t("courses.details.managementStats.title")}</h2>
            <div className="space-y-2">
              <p className="text-4xl font-bold">{data.registeredStudents}</p>
              <p className="text-sm text-white/70">{t("courses.details.managementStats.registered")}</p>
            </div>
            <div className="space-y-2">
              <p className="text-4xl font-bold">{data.totalRevenueLabel}</p>
              <p className="text-sm text-white/70">{t("courses.details.managementStats.revenue")}</p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>{data.completionRate}%</span>
                <span>{t("courses.details.managementStats.completion")}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-emerald-400"
                  style={{ width: `${data.completionRate}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
