"use client";

import Link from "next/link";
import { Download, ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";
import { useParentChildResources } from "@/modules/parent/application/hooks/useParentLearning";
import { resolveResourceViewerKind } from "@/modules/parent/application/lib/parentLearning.utils";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { resolveFileUrl } from "@/shared/infrastructure/files/fileUrl";
import { Button } from "@/shared/presentation/components/ui/button";
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";

export function ParentResourceViewerDashboard({
  studentUserId,
  resourceId,
  kindHint,
}: {
  studentUserId: string;
  resourceId: string;
  kindHint?: string | null;
}) {
  const t = useTranslations("parent.dashboard.learning");
  const tCommon = useTranslations("parent.dashboard.common");
  const resourcesQuery = useParentChildResources(studentUserId, { pageSize: 100 });

  if (resourcesQuery.isLoading) {
    return (
      <div className="mx-auto flex w-full flex-col gap-6 pb-8">
        <Skeleton className="h-14 w-96" />
        <Skeleton className="h-[520px] w-full rounded-[20px]" />
      </div>
    );
  }

  if (resourcesQuery.isError || !resourcesQuery.data) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-[20px] border border-red-100 bg-white p-6">
        <p className="text-sm text-red-600">{tCommon("error")}</p>
        <Button type="button" onClick={() => resourcesQuery.refetch()}>
          {tCommon("retry")}
        </Button>
      </div>
    );
  }

  const resource = resourcesQuery.data.items.find((item) => item.resourceId === resourceId);

  if (!resource) {
    return (
      <div className="mx-auto flex w-full flex-col gap-6 pb-8">
        <Button
          asChild
          variant="outline"
          className="h-11 w-fit rounded-xl border-[#e2e8f0] bg-[#f8f9fa] px-5 text-sm font-bold text-[#2b415e]"
        >
          <Link href={ROUTES.USER.PARENT.CHILD_RESOURCES(studentUserId)}>{t("backToCourses")}</Link>
        </Button>
        <p className="rounded-2xl bg-white p-10 text-center text-[#64748b] shadow-[0px_8px_0px_rgba(0,0,0,0.04)]">
          {t("resourceNotFound")}
        </p>
      </div>
    );
  }

  const fileUrl = resolveFileUrl(resource.fileUrl ?? null);
  const viewerKind = resolveResourceViewerKind(resource.mediaKind || kindHint);

  return (
    <div className="mx-auto flex w-full flex-col gap-6 pb-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <Button
          asChild
          variant="outline"
          className="order-2 h-11 w-fit rounded-xl border-[#e2e8f0] bg-[#f8f9fa] px-5 text-sm font-bold text-[#2b415e] sm:order-1"
        >
          <Link href={ROUTES.USER.PARENT.CHILD_RESOURCES(studentUserId)}>{t("backToCourses")}</Link>
        </Button>
        <div className="order-1 text-end sm:order-2">
          <p className="mb-1 text-sm text-[#94a3b8]">{t("breadcrumbResources")}</p>
          <h1 className="text-xl font-bold text-[#2b415e] md:text-2xl">{resource.title}</h1>
          <p className="mt-1 text-sm text-[#64748b]">
            {[resource.courseTitle, resource.stationName].filter(Boolean).join(" · ")}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap justify-end gap-2">
        {fileUrl ? (
          <>
            <a
              href={fileUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#e2e8f0] bg-[#f8f9fa] px-4 text-sm font-bold text-[#2b415e] hover:bg-[#eef1f4]"
            >
              <ExternalLink className="size-4" aria-hidden />
              {t("resourceViewerOpenOriginal")}
            </a>
            <a
              href={fileUrl}
              download
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#2b415e] px-4 text-sm font-bold text-white hover:bg-[#24384f]"
            >
              <Download className="size-4" aria-hidden />
              {t("resourceViewerDownload")}
            </a>
          </>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-[20px] border border-[#eef2f6] bg-white shadow-[0px_8px_0px_rgba(0,0,0,0.04)]">
        {!fileUrl ? (
          <p className="p-10 text-center text-sm text-[#64748b]">{t("resourceViewerUnsupported")}</p>
        ) : viewerKind === "video" ? (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <video controls src={fileUrl} className="max-h-[70vh] w-full bg-black" />
        ) : viewerKind === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={fileUrl} alt={resource.title} className="w-full object-contain" />
        ) : viewerKind === "pdf" ? (
          <iframe src={fileUrl} title={resource.title} className="h-[70vh] w-full" />
        ) : (
          <p className="p-10 text-center text-sm text-[#64748b]">{t("resourceViewerUnsupported")}</p>
        )}
      </div>
    </div>
  );
}
