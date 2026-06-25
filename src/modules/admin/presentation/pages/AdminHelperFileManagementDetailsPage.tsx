"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  deleteResourceFile,
  getResourceFileById,
  type ResourceFileDetails,
} from "@/modules/admin/infrastructure/api/resourceFileApi";
import { ContentFileDeleteModal } from "@/modules/admin/presentation/components/content-management/ContentFileDeleteModal";
import { HelperResourceFilePreview } from "@/modules/admin/presentation/components/helper-file-management/HelperResourceFilePreview";
import { useScopedDashboardRoutes } from "@/shared/application/hooks/useScopedDashboardRoutes";
import { notify } from "@/shared/application/lib/toast";
import { DashboardBadge, DashboardPageHeader } from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";

interface AdminHelperFileManagementDetailsPageProps {
  fileId: string;
  journeyContext?: {
    journeyId: string;
    returnHref: string;
  };
}

function formatDate(iso: string) {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("ar-SA", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AdminHelperFileManagementDetailsPage({
  fileId,
  journeyContext,
}: AdminHelperFileManagementDetailsPageProps) {
  const t = useTranslations("admin.dashboard.contentManagement.details");
  const tRoot = useTranslations("admin.dashboard.contentManagement");
  const tJourneyBc = useTranslations("admin.dashboard.journeyEditor.breadcrumbs");
  const router = useRouter();
  const routes = useScopedDashboardRoutes();
  const routeConfig = routes.helperFileManagement;
  const [detail, setDetail] = useState<ResourceFileDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      setLoading(true);
      const result = await getResourceFileById(fileId);
      if (!alive) return;
      if (result.errorMessage) {
        notify.error(result.errorMessage);
      }
      setDetail(result.data);
      setLoading(false);
    };
    void load();
    return () => {
      alive = false;
    };
  }, [fileId]);

  const resolveAccessPolicyLabel = (value: string) => {
    const normalized = value.trim().toLowerCase();
    if (normalized === "0" || normalized === "all" || normalized.includes("public")) {
      return tRoot("policy.public");
    }
    if (normalized === "1" || normalized.includes("subscriber")) {
      return tRoot("policy.subscribersOnly");
    }
    return value || "—";
  };

  const resolveResourceFileTypeLabel = (value: string) => {
    const normalized = value.trim();
    if (normalized === "0" || normalized.toLowerCase().includes("station")) {
      return tRoot("filters.resourceFileType.station");
    }
    if (normalized === "1" || normalized.toLowerCase().includes("course")) {
      return tRoot("filters.resourceFileType.course");
    }
    return value || "—";
  };

  const handleDelete = async () => {
    if (!detail) return;
    const result = await deleteResourceFile(detail.id);
    if (result.errorMessage) {
      notify.error(result.errorMessage);
      return;
    }
    notify.success(t("deleteSuccess"));
    setDeleteOpen(false);
    router.push(journeyContext?.returnHref ?? routeConfig.LIST);
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
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(journeyContext?.returnHref ?? routeConfig.LIST)}
        >
          {t("notFound.back")}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title={detail.fileName}
        description={t("description")}
        breadcrumbs={
          journeyContext
            ? [
                { label: tJourneyBc("home"), href: routes.home },
                {
                  label: tJourneyBc("journeyEditor"),
                  href: journeyContext.returnHref,
                },
                { label: tJourneyBc("helperResourceEditor") },
              ]
            : [
                { label: t("breadcrumbs.home"), href: routes.home },
                { label: t("breadcrumbs.content"), href: routeConfig.LIST },
                { label: detail.fileName },
              ]
        }
        action={
          <Button
            type="button"
            className="h-12 rounded-xl bg-[#FF4B4B] px-6 text-white shadow-[0px_4px_0px_0px_#D33131] hover:bg-[#EA4343]"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
            {t("actions.delete")}
          </Button>
        }
      />

      <Card className="rounded-[1.5rem] border-white/80 bg-white shadow-[0px_8px_0px_0px_#0000000D]">
        <CardContent className="space-y-6 p-6 text-right">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="text-2xl font-extrabold text-[#1E3A66]">{detail.fileName}</p>
              <p className="text-sm text-slate-500">{detail.fileType || "—"}</p>
            </div>
            <DashboardBadge tone="success">{t("readOnlyBadge")}</DashboardBadge>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <InfoRow label={t("fields.station")} value={detail.stationName || "—"} />
            <InfoRow label={t("fields.course")} value={detail.courseTitle || "—"} />
            <InfoRow
              label={t("fields.accessPolicy")}
              value={resolveAccessPolicyLabel(detail.accessPolicy)}
            />
            <InfoRow
              label={t("fields.resourceFileType")}
              value={resolveResourceFileTypeLabel(detail.resourceFileType)}
            />
            <InfoRow label={t("fields.createdAt")} value={formatDate(detail.createdAt)} />
            <InfoRow label={t("fields.updatedAt")} value={formatDate(detail.updatedAt)} />
          </div>

          {detail.fileUrl ? (
            <HelperResourceFilePreview
              fileUrl={detail.fileUrl}
              fileName={detail.fileName}
              fileType={detail.fileType}
            />
          ) : null}
        </CardContent>
      </Card>

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
