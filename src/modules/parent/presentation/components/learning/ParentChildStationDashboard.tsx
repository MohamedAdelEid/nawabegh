"use client";

import Link from "next/link";
import { CheckCircle2, Circle, FileText, Layers, ListChecks, Sparkles, Target } from "lucide-react";
import { useTranslations } from "next-intl";
import { useParentStationDetail } from "@/modules/parent/application/hooks/useParentLearning";
import { clampPercent, formatPercent } from "@/modules/parent/application/lib/parentHome.utils";
import { ParentAvatar } from "@/modules/parent/presentation/components/home/ParentAvatar";
import { ParentProgressBar } from "@/modules/parent/presentation/components/home/ParentProgressBar";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { resolveFileUrl } from "@/shared/infrastructure/files/fileUrl";
import { Button } from "@/shared/presentation/components/ui/button";
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";

export function ParentChildStationDashboard({
  studentUserId,
  stationId,
}: {
  studentUserId: string;
  stationId: string;
}) {
  const t = useTranslations("parent.dashboard.learning");
  const tCommon = useTranslations("parent.dashboard.common");
  const stationQuery = useParentStationDetail(studentUserId, stationId);

  if (stationQuery.isLoading) {
    return (
      <div className="mx-auto flex w-full flex-col gap-8 pb-8">
        <Skeleton className="h-16 w-96" />
        <Skeleton className="h-80 rounded-[20px]" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-48 rounded-[20px]" />
          <Skeleton className="h-48 rounded-[20px]" />
        </div>
      </div>
    );
  }

  if (stationQuery.isError || !stationQuery.data) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-[20px] border border-red-100 bg-white p-6">
        <p className="text-sm text-red-600">{tCommon("error")}</p>
        <Button type="button" onClick={() => stationQuery.refetch()}>
          {tCommon("retry")}
        </Button>
      </div>
    );
  }

  const station = stationQuery.data;
  const videoUrl = resolveFileUrl(station.videoUrl ?? null);
  const learningGoals = station.learningGoals ?? [];
  const tasks = station.tasks ?? [];
  const attachments = station.attachments ?? [];

  return (
    <div className="mx-auto flex w-full flex-col gap-8 pb-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="order-2 flex flex-wrap gap-2 sm:order-1">
          {station.courseId ? (
            <Button
              asChild
              variant="outline"
              className="h-11 rounded-xl border-[#e2e8f0] bg-[#f8f9fa] px-5 text-sm font-bold text-[#2b415e]"
            >
              <Link href={ROUTES.USER.PARENT.CHILD_COURSE_JOURNEY(studentUserId, station.courseId)}>
                {t("backToCourses")}
              </Link>
            </Button>
          ) : null}
          {station.quiz ? (
            <Button
              asChild
              variant="outline"
              className="h-11 gap-2 rounded-xl border-[#e2e8f0] bg-[#f8f9fa] px-5 text-sm font-bold text-[#2b415e]"
            >
              <Link href={ROUTES.USER.PARENT.CHILD_QUIZ_REVIEW(studentUserId, stationId)}>
                <Sparkles className="size-4" aria-hidden />
                {t("quizReview")}
              </Link>
            </Button>
          ) : null}
          <Button
            asChild
            variant="outline"
            className="h-11 gap-2 rounded-xl border-[#e2e8f0] bg-[#f8f9fa] px-5 text-sm font-bold text-[#2b415e]"
          >
            <Link href={ROUTES.USER.PARENT.CHILD_FLASHCARDS(studentUserId, stationId)}>
              <Layers className="size-4" aria-hidden />
              {t("flashcards")}
            </Link>
          </Button>
        </div>
        <div className="order-1 text-end sm:order-2">
          <p className="mb-1 text-sm text-[#94a3b8]">{t("breadcrumbStation")}</p>
          <h1 className="text-2xl font-bold text-[#2b415e] md:text-3xl">{station.title}</h1>
          {station.learningPathTitle || station.courseTitle ? (
            <p className="mt-1 text-sm text-[#64748b]">
              {[station.courseTitle, station.learningPathTitle].filter(Boolean).join(" · ")}
            </p>
          ) : null}
        </div>
      </div>

      <article className="overflow-hidden rounded-[20px] border border-[#eef2f6] bg-white shadow-[0px_8px_0px_rgba(0,0,0,0.04)]">
        {videoUrl ? (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <video controls src={videoUrl} className="max-h-[60vh] w-full bg-black" />
        ) : (
          <div className="flex min-h-[220px] flex-col items-center justify-center gap-2 bg-[#f8f9fa] p-8 text-center">
            <FileText className="size-8 text-[#94a3b8]" aria-hidden />
            <p className="text-sm text-[#64748b]">{t("stationVideoEmpty")}</p>
          </div>
        )}
        <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1 text-start">
            {station.description ? (
              <p className="text-sm text-[#64748b]">{station.description}</p>
            ) : null}
            {station.instructorName ? (
              <div className="mt-3 flex items-center gap-2">
                <ParentAvatar
                  url={station.instructorImageUrl}
                  name={station.instructorName}
                  className="size-8"
                  roundedClassName="rounded-full"
                />
                <span className="text-xs font-bold text-[#2b415e]">
                  {t("instructorLabel")}: {station.instructorName}
                </span>
              </div>
            ) : null}
          </div>
          <div className="w-full max-w-[220px] shrink-0 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#2b415e]">
                {formatPercent(clampPercent(station.progressPercent))}
              </span>
              <span className="text-[#64748b]">{t("completionRate")}</span>
            </div>
            <ParentProgressBar value={station.progressPercent} barClassName="bg-[#58cc02]" />
          </div>
        </div>
      </article>

      <div className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-[20px] bg-white p-6 shadow-[0px_8px_0px_rgba(0,0,0,0.05)]">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-[#2b415e]">
            <Target className="size-4 text-[#c7af6d]" aria-hidden />
            {t("learningGoalsTitle")}
          </h2>
          {learningGoals.length === 0 ? (
            <p className="text-sm text-[#64748b]">{t("noStationData")}</p>
          ) : (
            <ul className="space-y-2.5">
              {learningGoals.map((goal, index) => (
                <li key={`${goal}-${index}`} className="flex items-start gap-2.5 text-sm text-[#2b415e]">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#58cc02]" aria-hidden />
                  <span className="text-start">{goal}</span>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="rounded-[20px] bg-white p-6 shadow-[0px_8px_0px_rgba(0,0,0,0.05)]">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-[#2b415e]">
            <ListChecks className="size-4 text-[#1e88e5]" aria-hidden />
            {t("tasksTitle")}
          </h2>
          {tasks.length === 0 ? (
            <p className="text-sm text-[#64748b]">{t("noStationData")}</p>
          ) : (
            <ul className="space-y-2.5">
              {tasks.map((task, index) => (
                <li
                  key={`${task.title}-${index}`}
                  className="flex items-center gap-2.5 text-sm text-[#2b415e]"
                >
                  {task.isCompleted ? (
                    <CheckCircle2 className="size-4 shrink-0 text-[#58cc02]" aria-hidden />
                  ) : (
                    <Circle className="size-4 shrink-0 text-[#cbd5e1]" aria-hidden />
                  )}
                  <span className="text-start">{task.title}</span>
                </li>
              ))}
            </ul>
          )}
        </article>
      </div>

      {attachments.length > 0 ? (
        <article className="rounded-[20px] bg-white p-6 shadow-[0px_8px_0px_rgba(0,0,0,0.05)]">
          <h2 className="mb-4 text-sm font-bold text-[#2b415e]">{t("attachmentsTitle")}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {attachments.map((attachment) => (
              <Link
                key={attachment.resourceId}
                href={ROUTES.USER.PARENT.CHILD_RESOURCE_VIEW(
                  studentUserId,
                  attachment.resourceId,
                  attachment.mediaKind,
                )}
                className="flex items-center gap-3 rounded-xl border border-[#eef2f6] bg-[#f8f9fa] p-3 transition hover:border-[#dbe3f3]"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white text-[#1e88e5]">
                  <FileText className="size-5" aria-hidden />
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-bold text-[#2b415e]">
                  {attachment.title}
                </span>
              </Link>
            ))}
          </div>
        </article>
      ) : null}
    </div>
  );
}
