"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Download,
  FileImage,
  FileText,
  Presentation as PresentationIcon,
  Search,
  Video,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useParentChildResources } from "@/modules/parent/application/hooks/useParentLearning";
import {
  RESOURCE_MEDIA_KIND_OPTIONS,
  resolveResourceViewerKind,
  resourceFilterLabelKey,
  type ResourceMediaKindOption,
} from "@/modules/parent/application/lib/parentLearning.utils";
import type { ParentResourceItem } from "@/modules/parent/domain/types/parentLearning.types";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { resolveFileUrl } from "@/shared/infrastructure/files/fileUrl";
import { Button } from "@/shared/presentation/components/ui/button";
import { Input } from "@/shared/presentation/components/ui/input";
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";
import { cn } from "@/shared/application/lib/cn";

function resourceIcon(mediaKind: string | null | undefined) {
  const kind = resolveResourceViewerKind(mediaKind);
  if (kind === "video") return Video;
  if (kind === "image") return FileImage;
  if (kind === "presentation") return PresentationIcon;
  return FileText;
}

function ResourceCard({
  resource,
  studentUserId,
}: {
  resource: ParentResourceItem;
  studentUserId: string;
}) {
  const t = useTranslations("parent.dashboard.learning");
  const coverUrl = resolveFileUrl(resource.coverImageUrl ?? null);
  const fileUrl = resolveFileUrl(resource.fileUrl ?? null);
  const Icon = resourceIcon(resource.mediaKind);

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-[20px] border border-[#eef2f6] bg-white shadow-[0px_8px_0px_rgba(0,0,0,0.04)]">
      <div className="relative flex h-28 w-full shrink-0 items-center justify-center bg-[#eef4ff]">
        {coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverUrl} alt={resource.title} className="size-full object-cover" />
        ) : (
          <Icon className="size-10 text-[#1e88e5]" aria-hidden />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4 text-start">
        <h3 className="line-clamp-2 text-sm font-bold text-[#2b415e]">{resource.title}</h3>
        <p className="truncate text-xs text-[#64748b]">
          {[resource.courseTitle, resource.stationName].filter(Boolean).join(" · ") || "—"}
        </p>
        {resource.fileSizeLabel ? (
          <p className="text-[11px] text-[#94a3b8]">{resource.fileSizeLabel}</p>
        ) : null}
        <div className="mt-auto flex gap-2 pt-3">
          <Button
            asChild
            className="h-9 flex-1 rounded-lg bg-[#1e88e5] text-xs font-bold text-white hover:bg-[#1976d2]"
          >
            <Link
              href={ROUTES.USER.PARENT.CHILD_RESOURCE_VIEW(
                studentUserId,
                resource.resourceId,
                resource.mediaKind,
              )}
            >
              {t("view")}
            </Link>
          </Button>
          {fileUrl ? (
            <a
              href={fileUrl}
              target="_blank"
              rel="noreferrer"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#e2e8f0] bg-[#f8f9fa] text-[#2b415e] transition hover:bg-[#eef1f4]"
              aria-label={t("download")}
            >
              <Download className="size-4" aria-hidden />
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export function ParentChildResourcesDashboard({ studentUserId }: { studentUserId: string }) {
  const t = useTranslations("parent.dashboard.learning");
  const tCommon = useTranslations("parent.dashboard.common");
  const [mediaKind, setMediaKind] = useState<ResourceMediaKindOption>("all");
  const [keyword, setKeyword] = useState("");
  const [pageNumber, setPageNumber] = useState(1);

  const query = useMemo(
    () => ({
      pageNumber,
      pageSize: 12,
      keyword: keyword.trim() || undefined,
      mediaKind: mediaKind === "all" ? undefined : mediaKind,
    }),
    [pageNumber, keyword, mediaKind],
  );

  const resourcesQuery = useParentChildResources(studentUserId, query);

  if (resourcesQuery.isLoading) {
    return (
      <div className="mx-auto flex w-full flex-col gap-8 pb-8">
        <Skeleton className="h-16 w-96" />
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-56 rounded-[20px]" />
          ))}
        </div>
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

  const { items, hasNextPage } = resourcesQuery.data;

  return (
    <div className="mx-auto flex w-full flex-col gap-8 pb-8">
      <div className="text-end">
        <p className="mb-1 text-sm text-[#94a3b8]">{t("breadcrumbResources")}</p>
        <h1 className="text-2xl font-bold text-[#2b415e] md:text-3xl">{t("resourcesTitle")}</h1>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative min-w-0 flex-1 sm:max-w-sm">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={keyword}
            onChange={(event) => {
              setPageNumber(1);
              setKeyword(event.target.value);
            }}
            placeholder={t("resourceSearchPlaceholder")}
            className="h-11 rounded-xl border-[#e2e8f0] ps-10"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {RESOURCE_MEDIA_KIND_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                setPageNumber(1);
                setMediaKind(option);
              }}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-bold transition",
                mediaKind === option
                  ? "bg-[#2b415e] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200",
              )}
            >
              {t(resourceFilterLabelKey(option))}
            </button>
          ))}
        </div>
      </div>

      {items.length === 0 ? (
        <p className="rounded-2xl bg-white p-10 text-center text-[#64748b] shadow-[0px_8px_0px_rgba(0,0,0,0.04)]">
          {t("emptyResources")}
        </p>
      ) : (
        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {items.map((resource) => (
            <ResourceCard
              key={resource.resourceId}
              resource={resource}
              studentUserId={studentUserId}
            />
          ))}
        </section>
      )}

      {items.length > 0 ? (
        <div className="flex items-center justify-center gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={pageNumber <= 1 || resourcesQuery.isFetching}
            onClick={() => setPageNumber((value) => Math.max(1, value - 1))}
          >
            ‹
          </Button>
          <span className="text-sm text-slate-500">{pageNumber}</span>
          <Button
            type="button"
            variant="outline"
            disabled={!hasNextPage || resourcesQuery.isFetching}
            onClick={() => setPageNumber((value) => value + 1)}
          >
            ›
          </Button>
        </div>
      ) : null}
    </div>
  );
}
