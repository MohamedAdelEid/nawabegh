"use client";

import { Download, FileText, Presentation, Video } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useTeacherSessionDetails } from "@/modules/teacher/application/hooks/useTeacherSessionDetails";
import { DashboardPageHeader } from "@/shared/presentation/components/dashboard/DashboardPageHeader";
import { DashboardBadge } from "@/shared/presentation/components/dashboard/DashboardBadge";
import { Button } from "@/shared/presentation/components/ui/button";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";

const statusTone = {
  live: "danger",
  upcoming: "gold",
  ended: "neutral",
} as const;

export function TeacherSessionDetailsView({ sessionId }: { sessionId: string }) {
  const t = useTranslations("teacher.dashboard");
  const { data, isLoading, isError } = useTeacherSessionDetails(sessionId);

  if (isLoading) {
    return <Skeleton className="h-96 w-full rounded-[2rem]" />;
  }

  if (isError || !data) {
    return (
      <Card className="rounded-[2rem] p-8 text-center">
        <h2 className="text-xl font-bold text-slate-800">{t("sessionDetails.notFound.title")}</h2>
        <p className="mt-2 text-slate-500">{t("sessionDetails.notFound.description")}</p>
        <Button className="mt-6 rounded-xl bg-[#2C4260]" asChild>
          <Link href={ROUTES.USER.TEACHER.SCHEDULE}>{t("sessionDetails.notFound.back")}</Link>
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        breadcrumbs={[
          { label: t("sessionDetails.breadcrumbSchedule"), href: ROUTES.USER.TEACHER.SCHEDULE },
          { label: t("sessionDetails.breadcrumbDetails") },
        ]}
        title={t(data.titleKey)}
        action={
          data.status === "live" ? (
            <Button className="rounded-xl bg-[#2C4260]">
              <Video className="ml-2 h-4 w-4" />
              {t("sessionDetails.joinLive")}
            </Button>
          ) : null
        }
      />

      <div className="flex flex-wrap items-center justify-end gap-3">
        <DashboardBadge tone={statusTone[data.status]} withDot={data.status === "live"}>
          {t(`sessionDetails.${data.status === "live" ? "liveNow" : data.status}`)}
        </DashboardBadge>
        <p className="text-sm text-slate-500">{t(data.instructorKey)}</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[300px_1fr]">
        <div className="space-y-6">
          <Card className="rounded-[2rem] border-white/80 bg-white shadow-[var(--dashboard-shadow-soft)]">
            <CardContent className="space-y-4 p-6 text-right">
              <h2 className="font-bold text-slate-800">{t("sessionDetails.lessonInfo.title")}</h2>
              <p className="text-sm text-slate-600">{data.dateLabel}</p>
              <p className="text-sm text-slate-600">{data.timeRangeLabel}</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-600">{t("sessionDetails.lessonInfo.active")}</span>
                  <span className="text-slate-500">{t("sessionDetails.lessonInfo.attendance")}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{ width: `${data.attendancePercent}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {data.tasks.length > 0 ? (
            <Card className="rounded-[2rem] border-white/80 bg-white shadow-[var(--dashboard-shadow-soft)]">
              <CardContent className="space-y-4 p-6">
                <h2 className="text-right font-bold text-slate-800">
                  {t("sessionDetails.tasks.title")}
                </h2>
                {data.tasks.map((task) => (
                  <label
                    key={task.id}
                    className="flex cursor-pointer items-center justify-end gap-3 text-right"
                  >
                    <span
                      className={`text-sm ${task.completed ? "text-slate-400 line-through" : "text-slate-700"}`}
                    >
                      {t(task.labelKey)}
                    </span>
                    <input
                      type="checkbox"
                      checked={task.completed}
                      readOnly
                      className="h-4 w-4 rounded border-slate-300"
                    />
                  </label>
                ))}
              </CardContent>
            </Card>
          ) : null}

          <Card className="rounded-[2rem] border-white/80 bg-slate-50 shadow-[var(--dashboard-shadow-soft)]">
            <CardContent className="space-y-3 p-6 text-right">
              <h3 className="font-bold text-slate-800">{t("sessionDetails.help.title")}</h3>
              <Button variant="outline" className="w-full rounded-xl">
                {t("sessionDetails.help.cta")}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-[2rem] border-white/80 bg-white shadow-[var(--dashboard-shadow-soft)]">
            <CardContent className="space-y-6 p-6 text-right">
              <h2 className="text-xl font-bold text-slate-800">
                {t("sessionDetails.overview.title")}
              </h2>
              <p className="text-sm leading-7 text-slate-600">{t(data.overviewKey)}</p>
              {data.goals.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {data.goals.map((goalKey) => (
                    <div
                      key={goalKey}
                      className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-700"
                    >
                      {t(goalKey)}
                    </div>
                  ))}
                </div>
              ) : null}
            </CardContent>
          </Card>

          {data.resources.length > 0 ? (
            <Card className="rounded-[2rem] border-white/80 bg-white shadow-[var(--dashboard-shadow-soft)]">
              <CardContent className="space-y-4 p-6">
                <h2 className="text-right text-xl font-bold text-slate-800">
                  {t("sessionDetails.resources.title")}
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {data.resources.map((resource) => (
                    <div
                      key={resource.id}
                      className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 p-4"
                    >
                      <Button size="icon" variant="ghost" aria-label={t("sessionDetails.resources.download")}>
                        <Download className="h-4 w-4" />
                      </Button>
                      <div className="flex items-center gap-3 text-right">
                        <div>
                          <p className="font-medium text-slate-800">{t(resource.titleKey)}</p>
                          <p className="text-xs text-slate-500">{resource.sizeLabel}</p>
                        </div>
                        {resource.fileType === "pdf" ? (
                          <FileText className="h-8 w-8 text-red-500" />
                        ) : (
                          <Presentation className="h-8 w-8 text-orange-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : null}

          {data.relatedLessons.length > 0 ? (
            <Card className="rounded-[2rem] border-white/80 bg-white shadow-[var(--dashboard-shadow-soft)]">
              <CardContent className="space-y-4 p-6">
                <h2 className="text-right text-xl font-bold text-slate-800">
                  {t("sessionDetails.related.title")}
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {data.relatedLessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className="overflow-hidden rounded-2xl border border-slate-100"
                    >
                      <div className="h-28 bg-gradient-to-br from-[#2C4260] to-[#4A6280]" />
                      <div className="space-y-3 p-4 text-right">
                        <div className="flex items-center justify-between gap-2">
                          <DashboardBadge
                            tone={lesson.status === "watched" ? "success" : "info"}
                          >
                            {t(
                              lesson.status === "watched"
                                ? "sessionDetails.related.watched"
                                : "sessionDetails.related.comingSoon",
                            )}
                          </DashboardBadge>
                          <p className="font-semibold text-slate-800">{t(lesson.titleKey)}</p>
                        </div>
                        <Button
                          variant="outline"
                          className="w-full rounded-xl"
                          asChild
                        >
                          <Link href={ROUTES.USER.TEACHER.SESSION_DETAILS(lesson.id)}>
                            {t(
                              lesson.status === "watched"
                                ? "sessionDetails.related.review"
                                : "sessionDetails.related.viewDetails",
                            )}
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
