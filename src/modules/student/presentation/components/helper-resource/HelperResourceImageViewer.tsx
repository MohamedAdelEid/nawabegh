"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  Download,
  Info,
  Maximize2,
  Printer,
  RotateCcw,
  RotateCw,
  Share2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { HelperResourceHeader } from "./HelperResourceHeader";
import {
  formatHelperFileDate,
  formatHelperFileSizeArabic,
} from "@/modules/student/domain/helper-resource/helper-resource.utils";
import type { StudentHelperResourceFileDto } from "@/modules/student/domain/types/helperResource.types";
import { resolveProtectedFileUrl } from "@/shared/infrastructure/files/fileUrl";
import { cn } from "@/shared/application/lib/cn";

type HelperResourceImageViewerProps = {
  file: StudentHelperResourceFileDto;
  gallery: StudentHelperResourceFileDto[];
  avatarUrl?: string | null;
  courseId?: string | null;
  pathId?: string | null;
  onBack: () => void;
  onDownload: (file: StudentHelperResourceFileDto) => void;
  onSelect: (file: StudentHelperResourceFileDto) => void;
  onProgress: (readPercentage: number, lastPageOrSlide: number) => void;
};

export function HelperResourceImageViewer({
  file,
  gallery,
  avatarUrl,
  courseId,
  pathId,
  onBack,
  onDownload,
  onSelect,
  onProgress,
}: HelperResourceImageViewerProps) {
  const t = useTranslations("student.dashboard.helperResource.viewer");
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [showInfo, setShowInfo] = useState(false);

  const src =
    resolveProtectedFileUrl(file.fileUrl) ??
    resolveProtectedFileUrl(file.thumbnailUrl) ??
    file.fileUrl;

  const thumbs = useMemo(() => {
    if (gallery.length > 0) return gallery;
    return [file];
  }, [file, gallery]);

  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: file.fileName, url: file.fileUrl });
      } else {
        await navigator.clipboard.writeText(file.fileUrl);
      }
    } catch {
      // ignore
    }
  };

  const enterFullscreen = () => {
    const el = document.getElementById("helper-image-stage");
    if (el?.requestFullscreen) void el.requestFullscreen();
  };

  const printImage = () => {
    const win = window.open(src, "_blank");
    win?.print();
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#f6f7f7]">
      <HelperResourceHeader
        variant="grid"
        title={file.fileName}
        subtitle={t("imageMeta", {
          date: formatHelperFileDate(file.createdAt),
          size: formatHelperFileSizeArabic(file.fileSizeBytes),
        })}
        avatarUrl={avatarUrl}
        courseId={courseId}
        pathId={pathId}
        onBack={onBack}
        endSlot={
          <button
            type="button"
            onClick={() => onDownload(file)}
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#2c4260] px-4 text-sm font-medium text-white"
          >
            {t("downloadImage")}
            <Download className="size-3.5" />
          </button>
        }
      />

      <div className="relative flex flex-1 items-center justify-center bg-[rgba(226,232,240,0.5)] p-6 md:p-10">
        <div
          id="helper-image-stage"
          className="relative flex max-h-[78vh] w-full max-w-5xl items-center justify-center overflow-hidden rounded-xl border border-white/20 bg-white/40 p-1 shadow-2xl backdrop-blur-sm"
        >
          {src ? (
            <Image
              src={src}
              alt={file.fileName}
              width={1024}
              height={782}
              className="max-h-[76vh] w-auto max-w-full object-contain transition-transform"
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
              }}
              unoptimized
              onLoadingComplete={() => onProgress(100, 1)}
            />
          ) : (
            <p className="py-24 text-sm text-[#64748b]">{t("loadError")}</p>
          )}

          <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-[rgba(44,66,96,0.9)] p-2 backdrop-blur-md">
            <button
              type="button"
              onClick={enterFullscreen}
              className="inline-flex size-10 items-center justify-center rounded-full text-white hover:bg-white/10"
              aria-label={t("fullscreen")}
            >
              <Maximize2 className="size-[18px]" />
            </button>
            <span className="mx-1 h-6 w-px bg-white/20" />
            <button
              type="button"
              onClick={() => setRotation((r) => r - 90)}
              className="inline-flex size-10 items-center justify-center rounded-full text-white hover:bg-white/10"
            >
              <RotateCcw className="size-[18px]" />
            </button>
            <button
              type="button"
              onClick={() => setRotation((r) => r + 90)}
              className="inline-flex size-10 items-center justify-center rounded-full text-white hover:bg-white/10"
            >
              <RotateCw className="size-[18px]" />
            </button>
            <span className="mx-1 h-6 w-px bg-white/20" />
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(3, Number((z + 0.2).toFixed(1))))}
              className="inline-flex size-10 items-center justify-center rounded-full text-white hover:bg-white/10"
            >
              <ZoomIn className="size-[18px]" />
            </button>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(0.4, Number((z - 0.2).toFixed(1))))}
              className="inline-flex size-10 items-center justify-center rounded-full text-white hover:bg-white/10"
            >
              <ZoomOut className="size-[18px]" />
            </button>
          </div>
        </div>

        <aside className="absolute end-6 top-1/2 hidden -translate-y-1/2 flex-col gap-2 rounded-2xl border border-[rgba(44,66,96,0.1)] bg-white p-2 shadow-lg md:flex">
          <button
            type="button"
            onClick={() => setShowInfo((v) => !v)}
            className="inline-flex size-12 items-center justify-center rounded-xl text-[#64748b] hover:bg-[#f8fafc]"
            aria-label={t("info")}
          >
            <Info className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => void share()}
            className="inline-flex size-12 items-center justify-center rounded-xl text-[#64748b] hover:bg-[#f8fafc]"
            aria-label={t("share")}
          >
            <Share2 className="size-5" />
          </button>
          <button
            type="button"
            onClick={printImage}
            className="inline-flex size-12 items-center justify-center rounded-xl text-[#64748b] hover:bg-[#f8fafc]"
            aria-label={t("print")}
          >
            <Printer className="size-5" />
          </button>
        </aside>

        {showInfo ? (
          <div className="absolute end-24 top-1/3 max-w-xs rounded-xl border border-[#e2e8f0] bg-white p-4 text-end text-sm shadow-lg">
            <p className="font-bold text-[#2c4260]">{file.fileName}</p>
            <p className="mt-1 text-[#64748b]">
              {formatHelperFileSizeArabic(file.fileSizeBytes)}
            </p>
            <p className="mt-1 text-[#64748b]">
              {formatHelperFileDate(file.createdAt)}
            </p>
          </div>
        ) : null}
      </div>

      <footer className="border-t border-[rgba(44,66,96,0.1)] bg-white px-6 py-3">
        <div className="flex items-center justify-center gap-2 overflow-x-auto py-1">
          {thumbs.map((item) => {
            const thumb =
              resolveProtectedFileUrl(item.thumbnailUrl) ??
              resolveProtectedFileUrl(item.fileUrl) ??
              item.fileUrl;
            const active = item.id === file.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect(item)}
                className={cn(
                  "relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2",
                  active
                    ? "border-[#c7af6d] shadow-[0_0_0_2px_rgba(44,66,96,0.2)]"
                    : "border-transparent opacity-50 hover:opacity-80",
                )}
              >
                {thumb ? (
                  <Image
                    src={thumb}
                    alt=""
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : null}
              </button>
            );
          })}
        </div>
      </footer>
    </div>
  );
}
