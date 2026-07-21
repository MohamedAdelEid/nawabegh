"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Download, Eye, FileText } from "lucide-react";
import { HELPER_RESOURCE_ASSETS } from "./helper-resource.assets";
import {
  formatHelperFileDate,
  formatHelperFileSize,
  getMediaKindBadgeLabel,
} from "@/modules/student/domain/helper-resource/helper-resource.utils";
import type { StudentHelperResourceFileDto } from "@/modules/student/domain/types/helperResource.types";
import { resolveProtectedFileUrl } from "@/shared/infrastructure/files/fileUrl";
import { cn } from "@/shared/application/lib/cn";

type HelperResourceCardProps = {
  file: StudentHelperResourceFileDto;
  onPreview: () => void;
  onDownload: () => void;
};

export function HelperResourceCard({
  file,
  onPreview,
  onDownload,
}: HelperResourceCardProps) {
  const t = useTranslations("student.dashboard.helperResource");
  const thumb =
    resolveProtectedFileUrl(file.thumbnailUrl) ??
    resolveProtectedFileUrl(file.fileUrl);
  const progress = file.readingProgress?.readPercentage ?? 0;
  const badge = getMediaKindBadgeLabel(file.mediaKind);

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-[#e2e8f0] bg-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
      <div className="relative h-[160px] shrink-0 bg-[#f1f5f9]">
        {thumb ? (
          <Image
            src={thumb}
            alt=""
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <FileText className="size-12 text-[#94a3b8]" />
          </div>
        )}
        <span className="absolute bottom-3 start-3 inline-flex items-center gap-1 rounded-md bg-white/95 px-2 py-1 text-[10px] font-bold text-[#2b415e] shadow-sm">
          <Image
            src={HELPER_RESOURCE_ASSETS.badgePdf}
            alt=""
            width={12}
            height={12}
            className="size-3 object-contain"
            unoptimized
          />
          {badge}
        </span>
        {progress > 0 ? (
          <span className="absolute top-3 start-3 rounded-full bg-[#2b415e] px-2 py-0.5 text-[10px] font-bold text-white">
            {progress}%
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-bold text-[#94a3b8]">
            {formatHelperFileDate(file.createdAt)}
          </span>
          {file.category ? (
            <span className="rounded bg-[rgba(43,65,94,0.05)] px-2 py-1 text-xs font-bold text-[#2b415e]">
              {file.category}
            </span>
          ) : null}
        </div>

        <h3 className="line-clamp-2 text-lg font-bold leading-7 text-[#0f172a]">
          {file.fileName}
        </h3>

        <div className="mt-auto flex items-center justify-end gap-4 border-t border-[#f1f5f9] pt-4 text-xs text-[#94a3b8]">
          <span className="inline-flex items-center gap-1">
            {formatHelperFileSize(file.fileSizeBytes)}
            <Image
              src={HELPER_RESOURCE_ASSETS.file}
              alt=""
              width={12}
              height={12}
              className="size-3 object-contain opacity-60"
              unoptimized
            />
          </span>
        </div>
      </div>

      <div className="flex gap-3 bg-[#f8fafc] p-4">
        <button
          type="button"
          onClick={onPreview}
          className={cn(
            "inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-lg border border-[#e2e8f0] bg-white text-sm font-medium text-[#475569] transition hover:bg-white",
          )}
        >
          <span>{t("actions.preview")}</span>
          <Eye className="size-4" />
        </button>
        <button
          type="button"
          onClick={onDownload}
          className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-lg bg-[#2b415e] text-sm font-medium text-white transition hover:bg-[#243750]"
        >
          <span>{t("actions.download")}</span>
          <Download className="size-4" />
        </button>
      </div>
    </article>
  );
}
