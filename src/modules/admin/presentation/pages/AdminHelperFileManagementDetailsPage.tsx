"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, FileText, Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  deleteResourceFile,
  getResourceFileBatches,
  getResourceFileById,
  type ResourceFileBatchFile,
  type ResourceFileDetails,
} from "@/modules/admin/infrastructure/api/resourceFileApi";
import { ContentFileDeleteModal } from "@/modules/admin/presentation/components/content-management/ContentFileDeleteModal";
import { HelperResourceFilePreview } from "@/modules/admin/presentation/components/helper-file-management/HelperResourceFilePreview";
import { useScopedDashboardRoutes } from "@/shared/application/hooks/useScopedDashboardRoutes";
import { cn } from "@/shared/application/lib/cn";
import { notify } from "@/shared/application/lib/toast";
import { DashboardBadge, DashboardPageHeader } from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";

interface AdminHelperFileManagementDetailsPageProps {
  fileId: string;
  journeyContext?: {
    journeyId: string;
    returnHref: string;
  };
}

function formatDate(iso: string, locale: string) {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString(locale.startsWith("ar") ? "ar-SA" : "en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatFileSize(bytes: number | null | undefined, locale: string) {
  if (bytes == null || !Number.isFinite(bytes) || bytes < 0) return null;
  const units = locale.startsWith("ar")
    ? ["بايت", "ك.ب", "م.ب", "ج.ب"]
    : ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  const rounded = value >= 10 || unitIndex === 0 ? Math.round(value) : Math.round(value * 10) / 10;
  return `${rounded} ${units[unitIndex]}`;
}

export function AdminHelperFileManagementDetailsPage({
  fileId,
  journeyContext,
}: AdminHelperFileManagementDetailsPageProps) {
  const t = useTranslations("admin.dashboard.contentManagement.details");
  const tRoot = useTranslations("admin.dashboard.contentManagement");
  const tJourneyBc = useTranslations("admin.dashboard.journeyEditor.breadcrumbs");
  const locale = useLocale();
  const router = useRouter();
  const routes = useScopedDashboardRoutes();
  const routeConfig = routes.helperFileManagement;
  const [detail, setDetail] = useState<ResourceFileDetails | null>(null);
  const [batchFiles, setBatchFiles] = useState<ResourceFileBatchFile[]>([]);
  const [activeFileId, setActiveFileId] = useState(fileId);
  const [initialLoading, setInitialLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const batchLoadedForIdRef = useRef<string | null>(null);
  const hasLoadedOnceRef = useRef(false);

  useEffect(() => {
    setActiveFileId(fileId);
    batchLoadedForIdRef.current = null;
    hasLoadedOnceRef.current = false;
  }, [fileId]);

  useEffect(() => {
    let alive = true;
    const isInitial = !hasLoadedOnceRef.current;

    const load = async () => {
      if (isInitial) setInitialLoading(true);
      else setContentLoading(true);

      const result = await getResourceFileById(activeFileId);
      if (!alive) return;

      if (result.errorMessage) {
        notify.error(result.errorMessage);
        if (isInitial) {
          setDetail(null);
          setBatchFiles([]);
        }
        setInitialLoading(false);
        setContentLoading(false);
        return;
      }

      const nextDetail = result.data;
      setDetail(nextDetail);

      const batchId = nextDetail?.uploadBatchId?.trim();
      const shouldLoadBatch =
        Boolean(batchId) && batchLoadedForIdRef.current !== batchId;

      if (shouldLoadBatch && batchId) {
        const batchResult = await getResourceFileBatches({
          uploadBatchId: batchId,
          pageNumber: 1,
          pageSize: 1,
        });
        if (!alive) return;
        const batch = batchResult.data?.items[0];
        setBatchFiles(batch?.files?.length ? batch.files : nextDetail ? [toBatchFile(nextDetail)] : []);
        batchLoadedForIdRef.current = batchId;
      } else if (!batchId && nextDetail && batchFiles.length === 0) {
        setBatchFiles([toBatchFile(nextDetail)]);
      }

      hasLoadedOnceRef.current = true;
      setInitialLoading(false);
      setContentLoading(false);
    };

    void load();
    return () => {
      alive = false;
    };
    // batchFiles intentionally omitted — only used as a fallback guard
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFileId]);

  const activeIndex = useMemo(
    () => batchFiles.findIndex((file) => file.id === activeFileId),
    [batchFiles, activeFileId],
  );

  const hasBatch = batchFiles.length > 1;
  const previousFile = activeIndex > 0 ? batchFiles[activeIndex - 1] : null;
  const nextFile =
    activeIndex >= 0 && activeIndex < batchFiles.length - 1 ? batchFiles[activeIndex + 1] : null;

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

  const syncUrl = (id: string) => {
    if (journeyContext) return;
    const nextUrl = routeConfig.VIEW(id);
    if (typeof window !== "undefined" && window.location.pathname !== nextUrl) {
      window.history.replaceState(window.history.state, "", nextUrl);
    }
  };

  const openFile = (id: string) => {
    if (!id || id === activeFileId || contentLoading) return;
    setActiveFileId(id);
    syncUrl(id);
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

    const remaining = batchFiles.filter((file) => file.id !== detail.id);
    if (remaining[0]) {
      setBatchFiles(remaining);
      setActiveFileId(remaining[0].id);
      syncUrl(remaining[0].id);
      return;
    }
    router.push(journeyContext?.returnHref ?? routeConfig.LIST);
  };

  if (initialLoading) {
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

  const fileSizeLabel = formatFileSize(detail.fileSizeBytes, locale);

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title={detail.fileName}
        description={
          hasBatch
            ? t("batch.description", {
                current: Math.max(activeIndex, 0) + 1,
                total: batchFiles.length,
              })
            : t("description")
        }
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

      {hasBatch ? (
        <Card className="rounded-[1.5rem] border-white/80 bg-white shadow-[0px_8px_0px_0px_#0000000D]">
          <CardContent className="space-y-4 p-5 text-right">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-[#1E3A66]">{t("batch.title")}</p>
                <p className="text-xs text-slate-400">
                  {t("batch.hint", { total: batchFiles.length })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 rounded-xl border-slate-200 px-3"
                  disabled={!previousFile || contentLoading}
                  onClick={() => previousFile && openFile(previousFile.id)}
                >
                  <ChevronRight className="h-4 w-4" />
                  <span className="text-xs">{t("batch.previous")}</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 rounded-xl border-slate-200 px-3"
                  disabled={!nextFile || contentLoading}
                  onClick={() => nextFile && openFile(nextFile.id)}
                >
                  <span className="text-xs">{t("batch.next")}</span>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {batchFiles.map((file, index) => {
                const selected = file.id === activeFileId;
                return (
                  <button
                    key={file.id}
                    type="button"
                    disabled={contentLoading}
                    onClick={() => openFile(file.id)}
                    className={cn(
                      "min-w-[11rem] max-w-[14rem] shrink-0 rounded-2xl border-2 p-3 text-right transition",
                      selected
                        ? "border-[#C8AC59] bg-[#F8EFD5] shadow-[0px_4px_0px_0px_#E8D7A0]"
                        : "border-slate-100 bg-slate-50 hover:border-slate-200 hover:bg-white",
                      contentLoading && "opacity-70",
                    )}
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span
                        className={cn(
                          "inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold",
                          selected ? "bg-[#C8AC59] text-white" : "bg-white text-slate-500",
                        )}
                      >
                        {index + 1}
                      </span>
                      <FileText
                        className={cn("h-4 w-4", selected ? "text-[#8F6C0B]" : "text-slate-400")}
                      />
                    </div>
                    <p className="truncate text-sm font-semibold text-slate-800">{file.fileName}</p>
                    <p className="mt-1 truncate text-[11px] text-slate-400">
                      {file.mediaKind || file.fileType || "—"}
                    </p>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card className="relative rounded-[1.5rem] border-white/80 bg-white shadow-[0px_8px_0px_0px_#0000000D]">
        <CardContent className="space-y-6 p-6 text-right">
          {contentLoading ? (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-[1.5rem] bg-white/70 backdrop-blur-[1px]">
              <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm text-[#1E3A66] shadow-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("loading")}
              </div>
            </div>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              {contentLoading ? (
                <>
                  <Skeleton className="h-8 w-56 rounded-lg" />
                  <Skeleton className="h-4 w-32 rounded-lg" />
                </>
              ) : (
                <>
                  <p className="text-2xl font-extrabold text-[#1E3A66]">{detail.fileName}</p>
                  <p className="text-sm text-slate-500">
                    {[detail.mediaKind || detail.fileType || "—", fileSizeLabel]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {hasBatch ? (
                <DashboardBadge tone="warning">
                  {t("batch.badge", {
                    current: Math.max(activeIndex, 0) + 1,
                    total: batchFiles.length,
                  })}
                </DashboardBadge>
              ) : null}
              <DashboardBadge tone="success">{t("readOnlyBadge")}</DashboardBadge>
            </div>
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
            <InfoRow label={t("fields.createdAt")} value={formatDate(detail.createdAt, locale)} />
            <InfoRow label={t("fields.updatedAt")} value={formatDate(detail.updatedAt, locale)} />
          </div>

          {detail.fileUrl ? (
            <HelperResourceFilePreview
              key={detail.id}
              fileUrl={detail.fileUrl}
              fileName={detail.fileName}
              fileType={detail.fileType}
              mediaKind={detail.mediaKind}
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

function toBatchFile(detail: ResourceFileDetails): ResourceFileBatchFile {
  return {
    id: detail.id,
    fileName: detail.fileName,
    fileUrl: detail.fileUrl,
    fileType: detail.fileType,
    thumbnailUrl: detail.thumbnailUrl,
    mediaKind: detail.mediaKind,
    fileSizeBytes: detail.fileSizeBytes,
    createdAt: detail.createdAt,
  };
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1 rounded-xl bg-slate-50 p-3">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="font-bold text-[#1E3A66]">{value}</p>
    </div>
  );
}
