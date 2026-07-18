"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  Archive,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileText,
  Pencil,
  Percent,
  Printer,
  RefreshCw,
  SendHorizontal,
  Target,
  Trash2,
  Users,
} from "lucide-react";
import { Button } from "@/shared/presentation/components/ui/button";
import { ModalShell, ModalTitle } from "@/shared/presentation/components/ui/modal-shell";
import {
  DashboardBadge,
  DashboardPageHeader,
  DashboardStatCard,
  DashboardTableCard,
} from "@/shared/presentation/components/dashboard";
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
    <li className="flex items-start justify-between gap-4 border-b border-slate-50 px-6 py-4 last:border-0">
      <div className="flex flex-1 items-start gap-3 text-start">
        <span
          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-50 ${tone}`}
        >
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <p className="font-semibold text-slate-800">{entry.eventLabel}</p>
          {entry.description ? (
            <p className="mt-0.5 text-xs text-slate-400">{entry.description}</p>
          ) : null}
        </div>
      </div>
      <div className="text-start text-xs text-slate-400">
        {entry.occurredAt ? formatDate(entry.occurredAt, locale) : "—"}
      </div>
    </li>
  );
}

export function SchoolAnnouncementDetailView({ announcementId }: { announcementId: string }) {
  const t = useTranslations("school.dashboard");
  const locale = useLocale();
  const router = useRouter();
  const { data, isLoading, isError } = useSchoolAnnouncementDetail(announcementId);
  const { sendDraft, resend, archive, remove } = useSchoolAnnouncementMutations();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

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
    } catch (error) {
      notify.error(error instanceof Error ? error.message : t("detailPage.messages.resendError"));
    }
  };

  const handleSendDraft = async () => {
    try {
      await sendDraft.mutateAsync(data.id);
      notify.success(t("detailPage.messages.sendSuccess"));
    } catch (error) {
      notify.error(error instanceof Error ? error.message : t("detailPage.messages.sendError"));
    }
  };

  const handleArchive = async () => {
    try {
      await archive.mutateAsync(data.id);
      notify.success(t("detailPage.messages.archiveSuccess"));
      router.push(ROUTES.USER.SCHOOL.ANNOUNCEMENTS.LIST);
    } catch (error) {
      notify.error(error instanceof Error ? error.message : t("detailPage.messages.archiveError"));
    }
  };

  const handleDelete = async () => {
    try {
      await remove.mutateAsync(data.id);
      notify.success(t("detailPage.messages.deleteSuccess"));
      router.push(ROUTES.USER.SCHOOL.ANNOUNCEMENTS.LIST);
    } catch (error) {
      notify.error(error instanceof Error ? error.message : t("detailPage.messages.deleteError"));
    } finally {
      setIsDeleteOpen(false);
    }
  };

  const headerActions = (
    <div className="flex flex-wrap items-center gap-3">
      {data.actions.canPrintReport ? (
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(ROUTES.USER.SCHOOL.ANNOUNCEMENTS.REPORT(data.id))}
          className="h-12 rounded-2xl border-slate-200"
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
          className="h-12 rounded-2xl bg-[#2C4260] text-white hover:bg-[#243751]"
        >
          <RefreshCw className="h-4 w-4" />
          {t("detailPage.actions.resend")}
        </Button>
      ) : null}
      {data.statusTone === "draft" ? (
        <Button
          type="button"
          disabled={sendDraft.isPending}
          onClick={() => void handleSendDraft()}
          className="h-12 rounded-2xl bg-[#2C4260] text-white hover:bg-[#243751]"
        >
          <SendHorizontal className="h-4 w-4" />
          {t("detailPage.actions.sendDraft")}
        </Button>
      ) : null}
      {data.actions.canEdit ? (
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(ROUTES.USER.SCHOOL.ANNOUNCEMENTS.EDIT(data.id))}
          className="h-12 rounded-2xl border-slate-200"
        >
          <Pencil className="h-4 w-4" />
          {t("detailPage.actions.edit")}
        </Button>
      ) : null}
    </div>
  );

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title={data.title}
        description={referenceLine}
        breadcrumbs={[
          { label: t("sidebar.nav.announcements"), href: ROUTES.USER.SCHOOL.ANNOUNCEMENTS.LIST },
          { label: data.title },
        ]}
        action={
          <div className="flex flex-col items-end gap-3">
            {/* <SchoolStatusBadge tone={data.statusTone} label={data.statusLabel} withDot /> */}
            {headerActions}
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <DashboardStatCard
          label={t("detailPage.stats.deliveryRate")}
          value={`${formatNumber(data.statistics.deliveryRate, locale)}%`}
          icon={Percent}
          iconTone="success"
        />
        <DashboardStatCard
          label={t("detailPage.stats.totalRecipients")}
          value={formatNumber(data.statistics.totalRecipients, locale)}
          icon={Users}
          iconTone="primary"
        />
        <DashboardStatCard
          label={t("detailPage.stats.deliveredSuccess")}
          value={formatNumber(data.statistics.successCount, locale)}
          indicator={
            data.statistics.failureCount > 0
              ? `${formatNumber(data.statistics.failureCount, locale)} ${t("detailPage.stats.failedSuffix")}`
              : undefined
          }
          indicatorClassName="text-red-500"
          icon={CheckCircle2}
          iconTone="success"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_30rem]">
        <div className="space-y-6">
          <DashboardTableCard
            title={t("detailPage.content.title")}
            actions={<FileText className="h-5 w-5 text-[#2C4260]" aria-hidden />}
          >
            <div className="p-6">
              <div
                className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-5 text-start text-sm leading-relaxed text-slate-700"
                dangerouslySetInnerHTML={{ __html: data.bodyHtml || data.body }}
              />
            </div>
          </DashboardTableCard>

          {data.attachments.length > 0 ? (
            <DashboardTableCard
              title={t("detailPage.attachments.title", { count: data.attachments.length })}
            >
              <ul className="space-y-3 p-6">
                {data.attachments.map((file) => {
                  const url = resolveFileUrl(file.fileUrl);
                  const isPdf = file.mimeType.includes("pdf");
                  return (
                    <li
                      key={file.id}
                      className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 p-4"
                    >
                      <div className="flex items-center gap-3 text-start">
                        <span
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                            isPdf ? "bg-red-50 text-red-600" : "bg-sky-50 text-sky-600"
                          }`}
                        >
                          {isPdf ? "PDF" : "IMG"}
                        </span>
                        <div>
                          <p className="font-semibold text-slate-800">{file.fileName}</p>
                          <p className="text-xs text-slate-400">{file.fileSizeLabel}</p>
                        </div>
                      </div>
                      {url ? (
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                          aria-label={
                            isPdf
                              ? t("detailPage.attachments.download")
                              : t("detailPage.attachments.view")
                          }
                        >
                          {isPdf ? <Download className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </a>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </DashboardTableCard>
          ) : null}
        </div>

        <div className="space-y-6">
          <div
            className="rounded-[2rem] border border-[#2C4260] bg-[#2C4260] p-6 text-white shadow-[0_18px_40px_rgba(44,66,96,0.24)]"
          >
            <div className="mb-5 flex items-center justify-between gap-2">
              <h2 className="text-lg font-bold">{t("detailPage.targetGroups.title")}</h2>
              <Target className="h-5 w-5 text-[#C9A227]" aria-hidden />
            </div>
            <ul className="space-y-3">
              {data.studentsCount > 0 ? (
                <li className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-3">
                  <span className="text-sm">{t("detailPage.targetGroups.students")}</span>
                  <span className="font-bold">{formatNumber(data.studentsCount, locale)}</span>
                </li>
              ) : null}
              {data.parentsCount > 0 ? (
                <li className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-3">
                  <span className="text-sm">{t("detailPage.targetGroups.parents")}</span>
                  <span className="font-bold">{formatNumber(data.parentsCount, locale)}</span>
                </li>
              ) : null}
              {data.teachersCount > 0 ? (
                <li className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-3">
                  <span className="text-sm">{t("detailPage.targetGroups.teachers")}</span>
                  <span className="font-bold">{formatNumber(data.teachersCount, locale)}</span>
                </li>
              ) : null}
            </ul>
            {data.channels.some((channel) => channel.enabled) ? (
              <div className="mt-4 border-t border-white/15 pt-4">
                <p className="mb-2 text-xs text-white/60">
                  {t("detailPage.targetGroups.channelsTitle")}
                </p>
                <div className="flex flex-wrap gap-2">
                  {data.channels
                    .filter((channel) => channel.enabled)
                    .map((channel) => (
                      <DashboardBadge key={channel.code} tone="neutral">
                        {channel.label}
                      </DashboardBadge>
                    ))}
                </div>
              </div>
            ) : null}
          </div>

          <DashboardTableCard title={t("detailPage.operationLog.title")}>
            <ul>
              {data.operationLog.map((entry) => (
                <OperationLogItem key={entry.id} entry={entry} />
              ))}
            </ul>
          </DashboardTableCard>

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
                onClick={() => setIsDeleteOpen(true)}
                className="h-12 rounded-2xl border-red-200 text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
                {t("detailPage.actions.delete")}
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      <ModalShell open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <div className="space-y-5 text-start">
          <ModalTitle className="text-xl font-bold text-slate-800">
            {t("listPage.delete.title")}
          </ModalTitle>
          <p className="text-sm text-slate-500">
            {t("listPage.delete.description", { title: data.title })}
          </p>
          <div className="flex justify-start gap-3">
            <Button
              type="button"
              disabled={remove.isPending}
              onClick={() => void handleDelete()}
              className="rounded-xl bg-red-600 text-white hover:bg-red-700"
            >
              {t("listPage.delete.confirm")}
            </Button>
            <Button type="button" variant="outline" onClick={() => setIsDeleteOpen(false)}>
              {t("listPage.delete.cancel")}
            </Button>
          </div>
        </div>
      </ModalShell>
    </div>
  );
}
