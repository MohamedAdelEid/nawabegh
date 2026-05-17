"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart3, Eye, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  deleteContentFile,
  getContentFileDetailsById,
  type ContentFileDetails,
} from "@/modules/admin/domain/data/contentManagementData";
import { ContentFileDeleteModal } from "@/modules/admin/presentation/components/content-management/ContentFileDeleteModal";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { DashboardBadge, DashboardPageHeader } from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { StatusSwitch } from "@/shared/presentation/components/ui/StatusSwitch";

interface AdminContentManagementDetailsPageProps {
  fileId: string;
  routeConfig?: {
    LIST: string;
    EDIT: (fileId: string) => string;
  };
}

export function AdminContentManagementDetailsPage({
  fileId,
  routeConfig = ROUTES.ADMIN.CONTENT_MANAGEMENT,
}: AdminContentManagementDetailsPageProps) {
  const t = useTranslations("admin.dashboard.contentManagement.details");
  const router = useRouter();
  const [detail, setDetail] = useState<ContentFileDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [showPublicly, setShowPublicly] = useState(true);
  const [downloadable, setDownloadable] = useState(true);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      setLoading(true);
      const data = await getContentFileDetailsById(fileId);
      if (!alive) return;
      setDetail(data);
      if (data) {
        setShowPublicly(data.showPublicly);
        setDownloadable(data.downloadable);
      }
      setLoading(false);
    };
    void load();
    return () => {
      alive = false;
    };
  }, [fileId]);

  const peakIndex = useMemo(() => {
    if (!detail) return -1;
    return detail.readsLastMonth.reduce((best, value, index, arr) => {
      const bestValue = arr[best] ?? -Infinity;
      return value > bestValue ? index : best;
    }, 0);
  }, [detail]);

  const handleDelete = async () => {
    if (!detail) return;
    await deleteContentFile(detail.id);
    setDeleteOpen(false);
    router.push(routeConfig.LIST);
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-slate-500">
        {t("loading")}
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="space-y-4 rounded-2xl border border-red-100 bg-red-50 p-6 text-right">
        <p className="text-lg font-bold text-red-600">{t("notFound.title")}</p>
        <p className="text-sm text-red-500">{t("notFound.description")}</p>
        <Button type="button" variant="outline" onClick={() => router.push(routeConfig.LIST)}>
          {t("notFound.back")}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title={detail.title}
        description={t("description")}
        breadcrumbs={[
          { label: t("breadcrumbs.home"), href: ROUTES.ADMIN.HOME },
          { label: t("breadcrumbs.content"), href: routeConfig.LIST },
          { label: detail.title },
        ]}
        action={
          <div className="flex gap-2">
            <Button
              type="button"
              className="h-12 rounded-xl bg-[#FF4B4B] px-6 text-white shadow-[0px_4px_0px_0px_#D33131] hover:bg-[#EA4343]"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
              {t("actions.delete")}
            </Button>
            <Button
              type="button"
              className="h-12 rounded-xl bg-[#243B5A] px-6 text-white shadow-[0px_4px_0px_0px_#1D3048] hover:bg-[#1E3350]"
              onClick={() => router.push(routeConfig.EDIT(detail.id))}
            >
              <Pencil className="h-4 w-4" />
              {t("actions.edit")}
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[20rem_minmax(0,1fr)]">
        <aside className="space-y-6">
          <Card className="rounded-[1.5rem] border-white/80 bg-white shadow-[0px_8px_0px_0px_#0000000D]">
            <CardContent className="space-y-5 p-5 text-right">
              <h3 className="text-xl font-bold text-[#1E3A66]">{t("side.linkInfo")}</h3>
              <InfoRow label={t("side.course")} value={detail.courseName} />
              <InfoRow label={t("side.teacher")} value={detail.responsibleTeacher} />
              <div className="grid grid-cols-2 gap-3">
                <MiniPill label={t("side.subject")} value={detail.subjectName} />
                <MiniPill label={t("side.grade")} value={detail.gradeName} />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[1.5rem] border-0 bg-[#243B5A] text-white shadow-[0px_8px_0px_0px_#0000000D]">
            <CardContent className="space-y-4 p-5 text-right">
              <h3 className="text-2xl font-bold">{t("side.help.title")}</h3>
              <p className="text-sm text-white/80">{t("side.help.body")}</p>
              <Button type="button" className="h-11 w-full rounded-xl bg-white text-[#243B5A] hover:bg-white/95">
                {t("side.help.button")}
              </Button>
            </CardContent>
          </Card>
        </aside>

        <div className="space-y-6">
          <Card className="rounded-[1.5rem] border-white/80 bg-white shadow-[0px_8px_0px_0px_#0000000D]">
            <CardContent className="space-y-4 p-6 text-right">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-2xl font-extrabold text-[#1E3A66]">{detail.title}</p>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-500">{detail.sizeLabel}</span>
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-700">{detail.extensionLabel}</span>
                  </div>
                </div>
                <DashboardBadge tone="success">{t(detail.statusLabelKey)}</DashboardBadge>
              </div>
              <div className="grid gap-4 sm:grid-cols-4">
                <Metric label={t("hero.uploadDate")} value={detail.uploadDate} />
                <Metric label={t("hero.teacher")} value={detail.teacherName} />
                <Metric label={t("hero.downloads")} value={detail.downloadsLabel} />
                <Metric label={t("hero.version")} value={detail.versionLabel} />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[1.5rem] border-white/80 bg-white shadow-[0px_8px_0px_0px_#0000000D]">
            <CardContent className="space-y-5 p-6 text-right">
              <h3 className="flex items-center justify-end gap-2 text-3xl font-bold text-[#1E3A66]">
                {t("chart.title")}
                <BarChart3 className="h-6 w-6" />
              </h3>
              <div className="flex h-64 items-end gap-3 rounded-xl bg-slate-50 p-4">
                {detail.readsLastMonth.map((value, index) => (
                  <div
                    key={`${value}-${index}`}
                    className={[
                      "flex-1 rounded-t-md",
                      index === peakIndex ? "bg-[#243B5A]" : "bg-slate-200",
                    ].join(" ")}
                    style={{ height: `${Math.max(20, value)}%` }}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="rounded-[1.5rem] border-white/80 bg-white shadow-[0px_8px_0px_0px_#0000000D]">
              <CardContent className="space-y-3 p-5 text-right">
                <h3 className="text-xl font-bold text-[#1E3A66]">{t("quickActions.title")}</h3>
                <Button
                  type="button"
                  variant="outline"
                  className="h-14 w-full rounded-xl border-[#E2E8F0] text-base font-bold text-[#2C4260]"
                  onClick={() => router.push(routeConfig.EDIT(detail.id))}
                >
                  <Pencil className="h-4 w-4" />
                  {t("quickActions.edit")}
                </Button>
                <Button
                  type="button"
                  className="h-14 w-full rounded-xl bg-red-50 text-base font-bold text-[#FF4B4B] hover:bg-red-100"
                  onClick={() => setDeleteOpen(true)}
                >
                  <Trash2 className="h-4 w-4" />
                  {t("quickActions.delete")}
                </Button>
              </CardContent>
            </Card>

            <Card className="rounded-[1.5rem] border-white/80 bg-white shadow-[0px_8px_0px_0px_#0000000D]">
              <CardContent className="space-y-4 p-5 text-right">
                <h3 className="text-xl font-bold text-[#1E3A66]">{t("policy.title")}</h3>
                <PolicySwitch
                  title={t("policy.visibility.title")}
                  subtitle={t("policy.visibility.subtitle")}
                  checked={showPublicly}
                  onChange={setShowPublicly}
                  activeLabel={t("policy.visibility.active")}
                  inactiveLabel={t("policy.visibility.inactive")}
                />
                <PolicySwitch
                  title={t("policy.download.title")}
                  subtitle={t("policy.download.subtitle")}
                  checked={downloadable}
                  onChange={setDownloadable}
                  activeLabel={t("policy.download.active")}
                  inactiveLabel={t("policy.download.inactive")}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <ContentFileDeleteModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={t("deleteModal.title")}
        description={t("deleteModal.description")}
        confirmLabel={t("deleteModal.confirm")}
        cancelLabel={t("deleteModal.cancel")}
        onConfirm={handleDelete}
      />
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1 rounded-xl bg-slate-50 p-3">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="font-bold text-[#1E3A66]">{value}</p>
    </div>
  );
}

function MiniPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-2 text-center">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="font-bold text-[#1E3A66]">{value}</p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1 rounded-xl bg-slate-50 p-3 text-right">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="font-bold text-[#1E3A66]">{value}</p>
    </div>
  );
}

interface PolicySwitchProps {
  title: string;
  subtitle: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  activeLabel: string;
  inactiveLabel: string;
}

function PolicySwitch({
  title,
  subtitle,
  checked,
  onChange,
  activeLabel,
  inactiveLabel,
}: PolicySwitchProps) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
      <div className="flex items-center gap-3">
        <Eye className="h-5 w-5 text-slate-400" />
        <StatusSwitch
          checked={checked}
          onChange={onChange}
          activeLabel={activeLabel}
          inactiveLabel={inactiveLabel}
          activeClassName="bg-emerald-500"
        />
      </div>
      <div className="text-right">
        <p className="font-semibold text-slate-700">{title}</p>
        <p className="text-xs text-slate-400">{subtitle}</p>
      </div>
    </div>
  );
}
