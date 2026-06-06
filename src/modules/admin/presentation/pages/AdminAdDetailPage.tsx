"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAdDetail } from "@/modules/admin/application/hooks/useAdDetail";
import {
  AdDeleteConfirmModal,
  AdDetailView,
} from "@/modules/admin/presentation/components/ad-management";
import { AdManagementDashboardSkeleton } from "@/modules/admin/presentation/components/ad-management/AdManagementDashboardSkeleton";
import type { AdTableRow } from "@/modules/admin/domain/types/adManagement.types";
import { DashboardPageHeader } from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";
import { ROUTES } from "@/shared/infrastructure/config/routes";

type AdminAdDetailPageProps = {
  adId: string;
};

export function AdminAdDetailPage({ adId }: AdminAdDetailPageProps) {
  const t = useTranslations("admin.dashboard.adManagement.detail");
  const tList = useTranslations("admin.dashboard.adManagement");
  const router = useRouter();
  const { detail, analytics, status, remove, pause, isDeleting, isPausing } = useAdDetail(adId);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (status === "loading") {
    return (
      <div className="space-y-6">
        <DashboardPageHeader
          title={t("loadingTitle")}
          breadcrumbs={[
            { label: tList("breadcrumbs.home"), href: ROUTES.ADMIN.HOME },
            { label: tList("page.title"), href: ROUTES.ADMIN.ADS.LIST },
          ]}
        />
        <AdManagementDashboardSkeleton />
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="space-y-6 text-center">
        <p className="text-lg font-semibold text-slate-700">{t("states.error")}</p>
        <Button type="button" onClick={() => router.push(ROUTES.ADMIN.ADS.LIST)}>
          {t("backToList")}
        </Button>
      </div>
    );
  }

  const deleteRow: AdTableRow = {
    id: detail.id,
    displayId: detail.displayId,
    title: detail.title,
    thumbnailUrl: detail.mediaUrl,
    type: detail.type,
    audiences: detail.audiences,
    status: detail.status,
    createdAt: detail.createdAt,
    views: detail.views,
    clicks: detail.clicks,
  };

  const handleDelete = async () => {
    const ok = await remove();
    if (ok) router.push(ROUTES.ADMIN.ADS.LIST);
  };

  return (
    <div className="space-y-6">
      <AdDetailView
        detail={detail}
        analytics={analytics}
        onPause={() => void pause()}
        onDelete={() => setDeleteOpen(true)}
        isDeleting={isDeleting}
        isPausing={isPausing}
      />

      <AdDeleteConfirmModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        ad={deleteRow}
        title={tList("deleteModal.title")}
        description={tList("deleteModal.description")}
        confirmLabel={tList("deleteModal.confirm")}
        cancelLabel={tList("deleteModal.cancel")}
        typeLabel={tList(`types.${deleteRow.type}`)}
        audienceLabel={tList("deleteModal.audienceLabel")}
        createdLabel={tList("deleteModal.createdLabel")}
        onConfirm={() => void handleDelete()}
        isConfirming={isDeleting}
      />

      {status === "NotFound" ? (
        <div className="text-center">
          <Button type="button" onClick={() => router.push(ROUTES.ADMIN.ADS.LIST)}>
            {t("backToList")}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
