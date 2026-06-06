"use client";

import { Award, Download } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useStudentResultsCertificates } from "@/modules/admin/application/hooks/useStudentResultsCertificates";
import { formatPercent } from "@/modules/admin/domain/utils/resultsAnalyticsDisplay";
import { DisabledFeatureButton } from "@/modules/admin/presentation/components/results-analytics/DisabledFeatureButton";
import { DashboardBadge } from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";

export type StudentResultsCertificatesTabProps = {
  studentId: string;
};

export function StudentResultsCertificatesTab({ studentId }: StudentResultsCertificatesTabProps) {
  const t = useTranslations("admin.dashboard.resultsAnalytics");
  const locale = useLocale();
  const certificates = useStudentResultsCertificates(studentId, true);
  const rows = certificates.data?.certificates ?? [];
  const totalCount = certificates.data?.totalCount ?? 0;

  return (
    <Card
      className="overflow-hidden rounded-[2rem] border-white/80 bg-white"
      style={{ boxShadow: "0px 8px 0px 0px #0000000D" }}
    >
      <CardContent className="space-y-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2 text-right">
          <div className="flex items-center gap-2">
            <DashboardBadge tone="gold">{totalCount}</DashboardBadge>
            <h3 className="text-xl font-bold text-slate-800">{t("student.certificatesTab.title")}</h3>
          </div>
          <p className="text-sm text-slate-500">{t("student.certificatesTab.description")}</p>
        </div>
        <DisabledFeatureButton
          label={t("student.certificatesTab.downloadZip")}
          tooltip={t("comingSoon")}
          icon={Download}
          variant="ghost"
          className="rounded-xl"
        />
      </div>

      {certificates.isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <Skeleton key={index} className="h-64 rounded-[1.75rem]" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <p className="py-12 text-center text-sm text-slate-500">{t("student.certificatesTab.empty")}</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {rows.map((certificate) => (
            <Card
              key={certificate.certificateId}
              className="rounded-[1.75rem] border-[#C7AF6E]/40 bg-white shadow-[var(--dashboard-shadow-soft)]"
            >
              <CardContent className="space-y-5 p-6">
                <div className="flex items-start justify-between gap-3">
                  <DashboardBadge tone="success">{t("student.certificatesTab.certified")}</DashboardBadge>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F8EFD5] text-[#8F6C0B]">
                    <Award className="h-6 w-6" aria-hidden />
                  </div>
                </div>

                <div className="space-y-2 text-right">
                  <h4 className="text-lg font-bold text-slate-800">{certificate.certificateTitle}</h4>
                  <p className="text-sm text-slate-500">
                    {t("student.certificatesTab.issueDate")}:{" "}
                    {new Date(certificate.issueDateUtc).toLocaleDateString(locale)}
                  </p>
                  <p className="text-sm font-semibold text-emerald-600">
                    {t("student.certificatesTab.finalGrade")}:{" "}
                    {formatPercent(certificate.finalScorePercent, locale)} ({certificate.gradeLabel})
                  </p>
                  <p className="text-xs text-slate-400">
                    {t("student.certificatesTab.serialNumber")}: {certificate.serialNumber}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {certificate.certificateUrl ? (
                    <Button type="button" size="sm" className="rounded-xl" asChild>
                      <a href={certificate.certificateUrl} target="_blank" rel="noreferrer">
                        <Download className="h-4 w-4" aria-hidden />
                        {t("student.certificatesTab.downloadPdf")}
                      </a>
                    </Button>
                  ) : (
                    <DisabledFeatureButton
                      label={t("student.certificatesTab.downloadPdf")}
                      tooltip={t("student.certificatesTab.pdfUnavailable")}
                      icon={Download}
                      variant="default"
                      className="rounded-xl"
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      </CardContent>
    </Card>
  );
}
