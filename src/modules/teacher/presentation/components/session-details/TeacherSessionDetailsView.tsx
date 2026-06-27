"use client";

import { Download, ExternalLink, Video } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useTeacherSessionDetails } from "@/modules/teacher/application/hooks/useTeacherSessionDetails";
import { HelperResourceFilePreview } from "@/modules/admin/presentation/components/helper-file-management";
import { DashboardPageHeader } from "@/shared/presentation/components/dashboard/DashboardPageHeader";
import { DashboardBadge } from "@/shared/presentation/components/dashboard/DashboardBadge";
import { Button } from "@/shared/presentation/components/ui/button";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { useScopedDashboardRoutes } from "@/shared/application/hooks/useScopedDashboardRoutes";
import { TeacherSessionDetailsSkeleton } from "@/modules/teacher/presentation/components/session-details/TeacherSessionDetailsSkeleton";

function isResourceFileId(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value.trim());
}

function getBroadcastHref(data: {
  courseId?: string;
  stationId?: string;
  hostTokenPath?: string;
}): string | null {
  if (data.courseId && data.stationId) {
    return ROUTES.USER.TEACHER.JOURNEY_EDITOR.LIVE_BROADCAST_VIEW(data.courseId, data.stationId);
  }
  if (data.hostTokenPath) {
    return data.hostTokenPath.startsWith("http")
      ? data.hostTokenPath
      : `${process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ?? ""}${data.hostTokenPath}`;
  }
  return null;
}

export function TeacherSessionDetailsView({ sessionId }: { sessionId: string }) {
  const t = useTranslations("teacher.dashboard");
  const routes = useScopedDashboardRoutes();
  const { data, isLoading, isError } = useTeacherSessionDetails(sessionId);

  if (isLoading) {
    return <TeacherSessionDetailsSkeleton label={t("common.loading")} />;
  }

  if (isError || !data) {
    return (
      <Card className="rounded-[2rem] p-8 text-center">
        <h2 className="text-xl font-bold text-slate-800">{t("sessionDetails.notFound.title")}</h2>
        <p className="mt-2 text-slate-500">{t("sessionDetails.notFound.description")}</p>
        <Button className="mt-6 rounded-xl bg-[#2C4260]" asChild>
          <Link href={`${ROUTES.USER.TEACHER.LIVE_SESSIONS}?tab=manage`}>
            {t("sessionDetails.notFound.back")}
          </Link>
        </Button>
      </Card>
    );
  }

  const breadcrumbContext = [data.courseTitle, data.subjectName, data.gradeName]
    .filter(Boolean)
    .join(" · ");

  const broadcastHref = getBroadcastHref(data);
  const editHref =
    data.courseId && data.stationId
      ? ROUTES.USER.TEACHER.JOURNEY_EDITOR.LIVE_BROADCAST_VIEW(data.courseId, data.stationId)
      : data.courseId
        ? ROUTES.USER.TEACHER.JOURNEY_EDITOR.EDITOR(data.courseId)
        : null;

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        breadcrumbs={[
          {
            label: t("sessionDetails.breadcrumbLiveSessions"),
            href: `${ROUTES.USER.TEACHER.LIVE_SESSIONS}?tab=manage`,
          },
          { label: t("sessionDetails.breadcrumbDetails") },
        ]}
        title={data.title}
        description={breadcrumbContext || undefined}
        action={
          <div className="flex flex-wrap gap-3">
            {editHref ? (
              <Button variant="outline" className="rounded-md bg-[#C7AF6D] hover:bg-[#C7AF6D]/90 border-none border-b border-[#2C4260] text-[#fff] hover:text-[#fff]" asChild>
                <Link href={editHref}>{t("sessionDetails.editSession")}</Link>
              </Button>
            ) : null}
            {(data.canStartBroadcast || data.status === "live") && broadcastHref ? (
              <Button className="rounded-xl bg-[#2C4260]" asChild>
                <Link href={broadcastHref}>
                  <Video className="ml-2 h-4 w-4" />
                  {t("sessionDetails.joinLive")}
                </Link>
              </Button>
            ) : null}
          </div>
        }
      />

      {/* <div className="flex flex-wrap items-center justify-end gap-3">
        <DashboardBadge tone={statusTone[data.status]} withDot={data.status === "live"}>
          {data.relativeLabel ||
            t(`sessionDetails.${data.status === "live" ? "liveNow" : data.status}`)}
        </DashboardBadge>
        <p className="text-sm text-slate-500">{data.instructor}</p>
      </div> */}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        
        <div className="space-y-6">
          <Card className="rounded-[2rem] border-white/80 bg-white shadow-[var(--dashboard-shadow-soft)]">
            <CardContent className="space-y-6 p-6 text-right">
              <h2 className="text-xl font-bold text-slate-800">
                {t("sessionDetails.overview.title")}
              </h2>
              <p className="text-sm leading-7 text-slate-600">{data.overview}</p>
              {data.goals.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {data.goals.map((goal) => (
                    <div
                      key={goal}
                      className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-700"
                    >
                      {goal}
                    </div>
                  ))}
                </div>
              ) : null}
            </CardContent>
          </Card>

          {data.resources.length > 0 ? (
            <Card className="rounded-[2rem] border-white/80 bg-white shadow-[var(--dashboard-shadow-soft)]">
              <CardContent className="space-y-6 p-6">
                <h2 className="text-right text-xl font-bold text-slate-800">
                  {t("sessionDetails.resources.title")}
                </h2>
                <div className="space-y-8">
                  {data.resources.map((resource) => (
                    <div key={resource.id} className="space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-3 text-right">
                        <div className="space-y-1">
                          <p className="text-lg font-bold text-slate-800">{resource.title}</p>
                          <p className="text-xs text-slate-500">
                            {[resource.fileType, resource.sizeLabel !== "—" ? resource.sizeLabel : null]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          {isResourceFileId(resource.id) ? (
                            <Button variant="ghost" size="sm" className="rounded-xl" asChild>
                              <Link href={routes.helperFileManagement.VIEW(resource.id)}>
                                <ExternalLink className="ml-2 h-4 w-4" />
                                {t("sessionDetails.resources.openInHelperFiles")}
                              </Link>
                            </Button>
                          ) : null}
                          {resource.fileUrl ? (
                            <Button variant="outline" size="sm" className="rounded-xl" asChild>
                              <a href={resource.fileUrl} download target="_blank" rel="noreferrer">
                                <Download className="ml-2 h-4 w-4" />
                                {t("sessionDetails.resources.download")}
                              </a>
                            </Button>
                          ) : null}
                        </div>
                      </div>
                      {resource.fileUrl ? (
                        <HelperResourceFilePreview
                          fileUrl={resource.fileUrl}
                          fileName={resource.title}
                          fileType={resource.fileType}
                          mediaKind={resource.mediaKind}
                        />
                      ) : (
                        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
                          {t("sessionDetails.resources.unavailable")}
                        </div>
                      )}
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
                      <div
                        className="h-28 bg-gradient-to-br from-[#2C4260] to-[#4A6280] bg-cover bg-center"
                        style={lesson.imageUrl ? { backgroundImage: `url(${lesson.imageUrl})` } : undefined}
                      />
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
                          <p className="font-semibold text-slate-800">{lesson.title}</p>
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

        <div className="space-y-6">
          <Card className="rounded-[2rem] border-white/80 bg-white shadow-[var(--dashboard-shadow-soft)]">
            <CardContent className="space-y-4 p-6 text-right">
              <h2 className="font-bold text-slate-800">{t("sessionDetails.lessonInfo.title")}</h2>
              <p className="text-sm text-slate-600">{data.dateLabel}</p>
              <p className="text-sm text-slate-600">{data.timeRangeLabel}</p>
              {data.durationLabel ? (
                <p className="text-sm text-slate-600">{data.durationLabel}</p>
              ) : null}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-600">
                    {data.attendanceCount ?? 0}
                    {data.enrolledCount ? ` / ${data.enrolledCount}` : ""}
                  </span>
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
                      {task.label}
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

      </div>
    </div>
  );
}
