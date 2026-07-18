"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import {
  ArrowRight,
  CheckCircle2,
  Download,
  FileText,
  Paperclip,
  Percent,
  Printer,
  Target,
  Users,
} from "lucide-react";
import { Button } from "@/shared/presentation/components/ui/button";
import {
  DashboardBadge,
  DashboardPageHeader,
  DashboardStatCard,
  DashboardTableCard,
} from "@/shared/presentation/components/dashboard";
import { formatDate, formatNumber } from "@/shared/application/lib/format";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { resolveFileUrl } from "@/shared/infrastructure/files/fileUrl";
import { useSchoolAnnouncementDetail } from "@/modules/school/application/hooks/useSchoolAnnouncementDetail";
import { useSchoolAnnouncementReport } from "@/modules/school/application/hooks/useSchoolAnnouncementReport";
import { SchoolAnnouncementDetailSkeleton } from "@/modules/school/presentation/components/announcements/SchoolAnnouncementDetailSkeleton";
import { audienceText } from "@/modules/school/presentation/lib/schoolAnnouncementLabels";

export function SchoolAnnouncementReportPage({ announcementId }: { announcementId: string }) {
  const t = useTranslations("school.dashboard");
  const locale = useLocale();
  const { data, isLoading, isError } = useSchoolAnnouncementReport(announcementId);
  const detailQuery = useSchoolAnnouncementDetail(announcementId);

  if (isLoading || detailQuery.isLoading) return <SchoolAnnouncementDetailSkeleton />;
  if (isError || !data) {
    return <p className="text-sm text-red-600">{t("reportPage.loadError")}</p>;
  }

  return (
    <div className="space-y-6 print:space-y-4">
      <DashboardPageHeader
        title={data.title}
        description={`${t("reportPage.reference", { code: data.referenceCode })}${
          data.sentAt ? ` • ${formatDate(data.sentAt, locale)}` : ""
        }`}
        breadcrumbs={[
          {
            label: t("sidebar.nav.announcements"),
            href: ROUTES.USER.SCHOOL.ANNOUNCEMENTS.LIST,
          },
          {
            label: data.title,
            href: ROUTES.USER.SCHOOL.ANNOUNCEMENTS.VIEW(announcementId),
          },
          { label: t("reportPage.eyebrow") },
        ]}
        action={
          <div className="flex items-center gap-3 print:hidden">
            <Button
              type="button"
              onClick={() => window.print()}
              className="h-12 rounded-2xl bg-[#2C4260] text-white hover:bg-[#243751]"
            >
              <Printer className="h-4 w-4" />
              {t("reportPage.print")}
            </Button>
            <Button asChild type="button" variant="outline" className="h-12 rounded-2xl">
              <Link href={ROUTES.USER.SCHOOL.ANNOUNCEMENTS.VIEW(announcementId)}>
                <ArrowRight className="h-4 w-4" />
                {t("common.back")}
              </Link>
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <DashboardStatCard
          label={t("reportPage.stats.deliveryRate")}
          value={`${formatNumber(data.statistics.deliveryRate, locale)}%`}
          icon={Percent}
          iconTone="success"
        />
        <DashboardStatCard
          label={t("reportPage.stats.totalRecipients")}
          value={formatNumber(data.statistics.totalRecipients, locale)}
          icon={Users}
          iconTone="primary"
        />
        <DashboardStatCard
          label={t("reportPage.stats.delivered")}
          value={formatNumber(data.statistics.successCount, locale)}
          icon={CheckCircle2}
          iconTone="success"
        />
      </div>

      <DashboardTableCard
        title={t("reportPage.content")}
        actions={<FileText className="h-5 w-5 text-[#2C4260]" aria-hidden />}
      >
        <div className="space-y-5 p-6 text-start">
          <div>
            <div
              className="mt-3 rounded-2xl bg-slate-50 p-5 text-sm leading-8 text-slate-700"
              dangerouslySetInnerHTML={{ __html: data.bodyHtml || data.body }}
            />
          </div>
          <div className="grid gap-3 border-t border-slate-100 pt-5 sm:grid-cols-2">
            <p className="text-sm text-slate-600">
              <span className="font-semibold text-slate-800">{t("reportPage.audience")}: </span>
              {audienceText(t, data.audience, data.audienceLabel)}
            </p>
            <p className="text-sm text-slate-600">
              <span className="font-semibold text-slate-800">{t("reportPage.duration")}: </span>
              {t("reportPage.durationHours", { value: data.displayDurationHours })}
            </p>
          </div>
        </div>
      </DashboardTableCard>

      {detailQuery.data?.attachments.length ? (
        <DashboardTableCard
          title={t("detailPage.attachments.title", {
            count: detailQuery.data.attachments.length,
          })}
          actions={<Paperclip className="h-5 w-5 text-[#2C4260]" aria-hidden />}
        >
          <ul className="grid gap-3 p-6 sm:grid-cols-2">
            {detailQuery.data.attachments.map((file) => {
              const url = resolveFileUrl(file.fileUrl);
              const isPdf = file.mimeType.includes("pdf");

              return (
                <li key={file.id}>
                  <a
                    href={url || undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={url ? file.fileName : undefined}
                    aria-disabled={!url}
                    className={`flex items-center justify-between gap-4 rounded-2xl border border-slate-100 p-4 text-inherit transition-colors ${
                      url
                        ? "cursor-pointer hover:border-[#2C4260]/25 hover:bg-slate-50"
                        : "cursor-not-allowed opacity-60"
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-3 text-start">
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                          isPdf ? "bg-red-50 text-red-600" : "bg-sky-50 text-sky-600"
                        }`}
                      >
                        {isPdf ? "PDF" : "IMG"}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-800">{file.fileName}</p>
                        <p className="text-xs text-slate-400">{file.fileSizeLabel}</p>
                      </div>
                    </div>
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400"
                      aria-hidden
                    >
                      <Download className="h-4 w-4" />
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </DashboardTableCard>
      ) : null}

      <DashboardTableCard
        title={t("detailPage.targetGroups.title")}
        actions={<Target className="h-5 w-5 text-[#2C4260]" aria-hidden />}
      >
        <div className="space-y-4 p-6 text-start">
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ["students", data.studentsCount],
              ["parents", data.parentsCount],
              ["teachers", data.teachersCount],
            ].map(([key, count]) => (
              <div key={String(key)} className="rounded-xl bg-slate-50 p-3">
                <p className="text-lg font-bold text-slate-800">
                  {formatNumber(Number(count), locale)}
                </p>
                <p className="text-xs text-slate-500">
                  {t(`detailPage.targetGroups.${key}`)}
                </p>
              </div>
            ))}
          </div>
          {data.channels.some((channel) => channel.enabled) ? (
            <div className="space-y-2 text-sm text-slate-600">
              <span className="font-semibold text-slate-800">
                {t("detailPage.targetGroups.channelsTitle")}:
              </span>
              <div className="flex flex-wrap gap-2">
                {data.channels
                  .filter((channel) => channel.enabled)
                  .map((channel) => (
                    <DashboardBadge key={channel.code} tone="primary">
                      {channel.label}
                    </DashboardBadge>
                  ))}
              </div>
            </div>
          ) : null}
        </div>
      </DashboardTableCard>

      {data.generatedAt ? (
        <p className="text-xs text-slate-400">
          {t("reportPage.generatedAt", { date: formatDate(data.generatedAt, locale) })}
        </p>
      ) : null}
    </div>
  );
}
