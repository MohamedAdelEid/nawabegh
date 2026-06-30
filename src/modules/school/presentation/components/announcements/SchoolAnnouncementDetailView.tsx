"use client";

import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  Archive,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileText,
  Printer,
  RefreshCw,
  Target,
  Trash2,
  Users,
} from "lucide-react";
import { Button } from "@/shared/presentation/components/ui/button";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { formatDate, formatNumber } from "@/shared/application/lib/format";
import { notify } from "@/shared/application/lib/toast";
import { resolveFileUrl } from "@/shared/infrastructure/files/fileUrl";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { useSchoolAnnouncementDetail } from "@/modules/school/application/hooks/useSchoolAnnouncementDetail";
import { useSchoolAnnouncementMutations } from "@/modules/school/application/hooks/useSchoolAnnouncementMutations";
import { SchoolStatusBadge } from "@/modules/school/presentation/components/shared/SchoolStatusBadge";
import { SchoolAnnouncementDetailSkeleton } from "@/modules/school/presentation/components/announcements/SchoolAnnouncementDetailSkeleton";
import type { SchoolAnnouncementOperationLogEntry } from "@/modules/school/domain/types/schoolAnnouncements.types";

function logIcon(icon: string) {
  if (icon === "completed") return CheckCircle2;
  if (icon === "processing") return RefreshCw;
  return Clock;
}

function OperationLogItem({ entry }: { entry: SchoolAnnouncementOperationLogEntry }) {
  const locale = useLocale();
  const Icon = logIcon(entry.icon);
  const tone =
    entry.icon === "completed"
      ? "text-emerald-500"
      : entry.icon === "processing"
        ? "text-sky-500"
        : "text-amber-500";

  return (
    <li className="flex items-start justify-between gap-4 border-b border-slate-50 py-3 last:border-0">
      <div className="text-left text-xs text-slate-400">
        {entry.occurredAt ? formatDate(entry.occurredAt, locale) : "—"}
      </div>
      <div className="flex flex-1 items-start justify-end gap-3 text-right">
        <div>
          <p className="font-semibold text-slate-800">{entry.eventLabel}</p>
          {entry.description ? (
            <p className="mt-0.5 text-xs text-slate-400">{entry.description}</p>
          ) : null}
        </div>
        <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-50 ${tone}`}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
    </li>
  );
}

export function SchoolAnnouncementDetailView({ announcementId }: { announcementId: string }) {
  const t = useTranslations("school.dashboard");
  const locale = useLocale();
  const router = useRouter();
  const { data, isLoading, isError } = useSchoolAnnouncementDetail(announcementId);
  const { resend, archive, remove } = useSchoolAnnouncementMutations();

  if (isLoading) return <SchoolAnnouncementDetailSkeleton />;
  if (isError || !data) {
    return <p className="text-sm text-red-600">{t("detailPage.notFound")}</p>;
  }

  const sentLabel = data.sentAt ?? data.createdAt;
  const referenceLine = t("detailPage.referenceLine", {
    code: data.referenceCode,
    date: sentLabel ? formatDate(sentLabel, locale) : "—",
  });

  const handleResend = async () => {
    try {
      await resend.mutateAsync(data.id);
      notify.success(t("detailPage.messages.resendSuccess"));
    } catch {
      notify.error(t("detailPage.messages.resendError"));
    }
  };

  const handleArchive = async () => {
    try {
      await archive.mutateAsync(data.id);
      notify.success(t("detailPage.messages.archiveSuccess"));
      router.push(ROUTES.USER.SCHOOL.ANNOUNCEMENTS.LIST);
    } catch {
      notify.error(t("detailPage.messages.archiveError"));
    }
  };

  const handleDelete = async () => {
    try {
      await remove.mutateAsync(data.id);
      notify.success(t("detailPage.messages.deleteSuccess"));
      router.push(ROUTES.USER.SCHOOL.ANNOUNCEMENTS.LIST);
    } catch {
      notify.error(t("detailPage.messages.deleteError"));
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {data.actions.canPrintReport ? (
            <Button
              type="button"
              variant="outline"
              onClick={handlePrint}
              className="h-11 rounded-2xl border-slate-200"
            >
              <Printer className="h-4 w-4" />
              {t("detailPage.actions.printReport")}
            </Button>
          ) : null}
          {data.actions.canResend ? (
            <Button
              type="button"
              disabled={resend.isPending}
              onClick={() => void handleResend()}
              className="h-11 rounded-2xl bg-[#2C4260] text-white hover:bg-[#243751]"
            >
              <RefreshCw className="h-4 w-4" />
              {t("detailPage.actions.resend")}
            </Button>
          ) : null}
        </div>
        <div className="text-right">
          <div className="flex items-center justify-end gap-3">
            <SchoolStatusBadge tone={data.statusTone} label={data.statusLabel} withDot />
            <h1 className="text-2xl font-bold text-slate-800">{data.title}</h1>
          </div>
          <p className="mt-2 text-sm text-slate-400">{referenceLine}</p>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="rounded-[1.75rem] border-white/80 bg-white shadow-[var(--dashboard-shadow-soft)]">
          <CardContent className="flex flex-col items-center justify-center gap-2 p-6 text-center">
            <div className="relative flex h-20 w-20 items-center justify-center">
              <svg className="h-20 w-20 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="#E2E8F0" strokeWidth="3" />
                <circle
                  cx="18"
                  cy="18"
                  r="15.5"
                  fill="none"
                  stroke="#58CC02"
                  strokeWidth="3"
                  strokeDasharray={`${data.statistics.deliveryRate} 100`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-lg font-bold text-slate-800">
                {formatNumber(data.statistics.deliveryRate, locale)}%
              </span>
            </div>
            <p className="text-sm text-slate-500">{t("detailPage.stats.deliveryRate")}</p>
          </CardContent>
        </Card>

        <Card className="rounded-[1.75rem] border-white/80 bg-white shadow-[var(--dashboard-shadow-soft)]">
          <CardContent className="flex flex-col items-center justify-center gap-2 p-6 text-center">
            <Users className="h-8 w-8 text-[#2C4260]" />
            <p className="text-3xl font-bold text-slate-800">
              {formatNumber(data.statistics.totalRecipients, locale)}
            </p>
            <p className="text-sm text-slate-500">{t("detailPage.stats.totalRecipients")}</p>
          </CardContent>
        </Card>

        <Card className="rounded-[1.75rem] border-white/80 bg-white shadow-[var(--dashboard-shadow-soft)]">
          <CardContent className="flex flex-col items-center justify-center gap-2 p-6 text-center">
            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            <p className="text-3xl font-bold text-emerald-600">
              {formatNumber(data.statistics.successCount, locale)}
            </p>
            <p className="text-sm text-slate-500">{t("detailPage.stats.deliveredSuccess")}</p>
            {data.statistics.failureCount > 0 ? (
              <p className="text-xs text-red-500">
                {formatNumber(data.statistics.failureCount, locale)}{" "}
                {t("detailPage.stats.failedSuffix")}
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card className="rounded-[1.75rem] border-white/80 bg-white shadow-[var(--dashboard-shadow-soft)]">
            <CardContent className="space-y-4 p-6">
              <h2 className="flex items-center justify-end gap-2 text-lg font-bold text-slate-800">
                {t("detailPage.content.title")}
                <FileText className="h-5 w-5 text-[#2C4260]" />
              </h2>
              <div
                className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-5 text-right text-sm leading-relaxed text-slate-700"
                dangerouslySetInnerHTML={{ __html: data.bodyHtml || data.body }}
              />
            </CardContent>
          </Card>

          {data.attachments.length > 0 ? (
            <Card className="rounded-[1.75rem] border-white/80 bg-white shadow-[var(--dashboard-shadow-soft)]">
              <CardContent className="space-y-4 p-6">
                <h2 className="text-lg font-bold text-slate-800">
                  {t("detailPage.attachments.title", { count: data.attachments.length })}
                </h2>
                <ul className="space-y-3">
                  {data.attachments.map((file) => {
                    const url = resolveFileUrl(file.fileUrl);
                    const isPdf = file.mimeType.includes("pdf");
                    return (
                      <li
                        key={file.id}
                        className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 p-4"
                      >
                        <div className="flex items-center gap-2">
                          {url ? (
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                              aria-label={t("detailPage.attachments.view")}
                            >
                              {isPdf ? (
                                <Download className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </a>
                          ) : null}
                        </div>
                        <div className="flex items-center gap-3 text-right">
                          <div>
                            <p className="font-semibold text-slate-800">{file.fileName}</p>
                            <p className="text-xs text-slate-400">{file.fileSizeLabel}</p>
                          </div>
                          <span
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                              isPdf ? "bg-red-50 text-red-600" : "bg-sky-50 text-sky-600"
                            }`}
                          >
                            {isPdf ? "PDF" : "IMG"}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </CardContent>
            </Card>
          ) : null}
        </div>

        <div className="space-y-6">
          <Card className="rounded-[1.75rem] border-transparent bg-[#2C4260] text-white shadow-[var(--dashboard-shadow-soft)]">
            <CardContent className="space-y-5 p-6 text-right">
              <h2 className="flex items-center justify-end gap-2 text-lg font-bold">
                {t("detailPage.targetGroups.title")}
                <Target className="h-5 w-5 text-[#C9A227]" />
              </h2>
              <ul className="space-y-3">
                {data.studentsCount > 0 ? (
                  <li className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-3">
                    <span className="font-bold">{formatNumber(data.studentsCount, locale)}</span>
                    <span className="text-sm">{t("detailPage.targetGroups.students")}</span>
                  </li>
                ) : null}
                {data.parentsCount > 0 ? (
                  <li className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-3">
                    <span className="font-bold">{formatNumber(data.parentsCount, locale)}</span>
                    <span className="text-sm">{t("detailPage.targetGroups.parents")}</span>
                  </li>
                ) : null}
                {data.teachersCount > 0 ? (
                  <li className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-3">
                    <span className="font-bold">{formatNumber(data.teachersCount, locale)}</span>
                    <span className="text-sm">{t("detailPage.targetGroups.teachers")}</span>
                  </li>
                ) : null}
              </ul>
              {data.channels.length > 0 ? (
                <div className="border-t border-white/15 pt-4">
                  <p className="mb-2 text-xs text-white/60">
                    {t("detailPage.targetGroups.channelsTitle")}
                  </p>
                  <div className="flex flex-wrap justify-end gap-2">
                    {data.channels
                      .filter((channel) => channel.enabled)
                      .map((channel) => (
                        <span
                          key={channel.code}
                          className="rounded-full bg-white/15 px-3 py-1 text-xs"
                        >
                          {channel.label}
                        </span>
                      ))}
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card className="rounded-[1.75rem] border-white/80 bg-white shadow-[var(--dashboard-shadow-soft)]">
            <CardContent className="space-y-2 p-6">
              <h2 className="mb-3 text-lg font-bold text-slate-800">
                {t("detailPage.operationLog.title")}
              </h2>
              <ul>
                {data.operationLog.map((entry) => (
                  <OperationLogItem key={entry.id} entry={entry} />
                ))}
              </ul>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-3">
            {data.actions.canArchive ? (
              <Button
                type="button"
                variant="outline"
                disabled={archive.isPending}
                onClick={() => void handleArchive()}
                className="h-12 rounded-2xl border-slate-200"
              >
                <Archive className="h-4 w-4" />
                {t("detailPage.actions.archive")}
              </Button>
            ) : null}
            {data.actions.canDelete ? (
              <Button
                type="button"
                variant="outline"
                disabled={remove.isPending}
                onClick={() => void handleDelete()}
                className="h-12 rounded-2xl border-red-200 text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
                {t("detailPage.actions.delete")}
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
