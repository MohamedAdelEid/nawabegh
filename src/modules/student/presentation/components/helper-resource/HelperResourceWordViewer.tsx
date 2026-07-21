"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  List,
  Printer,
  Share2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { HelperResourceHeader } from "./HelperResourceHeader";
import { HelperDocxPreview } from "@/modules/admin/presentation/components/helper-file-management/HelperDocxPreview";
import {
  computeReadPercentage,
  formatHelperRelativeDate,
} from "@/modules/student/domain/helper-resource/helper-resource.utils";
import type { StudentHelperResourceFileDto } from "@/modules/student/domain/types/helperResource.types";
import { fetchFileAsArrayBuffer } from "@/shared/infrastructure/files/fetchFileForViewer";
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";

type HelperResourceWordViewerProps = {
  file: StudentHelperResourceFileDto;
  avatarUrl?: string | null;
  courseId?: string | null;
  pathId?: string | null;
  onBack: () => void;
  onDownload: () => void;
  onProgress: (readPercentage: number, lastPageOrSlide: number) => void;
};

type TocItem = { id: string; label: string };

export function HelperResourceWordViewer({
  file,
  avatarUrl,
  courseId,
  pathId,
  onBack,
  onDownload,
  onProgress,
}: HelperResourceWordViewerProps) {
  const t = useTranslations("student.dashboard.helperResource.viewer");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [buffer, setBuffer] = useState<ArrayBuffer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [progress, setProgress] = useState(
    file.readingProgress?.readPercentage ?? 0,
  );
  const [activeToc, setActiveToc] = useState(0);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(false);
    void fetchFileAsArrayBuffer(file.fileUrl).then((data) => {
      if (!alive) return;
      if (!data || data.byteLength === 0) {
        setError(true);
        setLoading(false);
        return;
      }
      setBuffer(data);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, [file.fileUrl]);

  const toc: TocItem[] = useMemo(
    () => [
      { id: "doc", label: file.fileName || t("document") },
      { id: "progress", label: t("readingProgress") },
    ],
    [file.fileName, t],
  );

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const max = el.scrollHeight - el.clientHeight;
    const pct = max <= 0 ? 100 : computeReadPercentage(el.scrollTop, max);
    setProgress(pct);
    onProgress(pct, Math.max(1, Math.round((pct / 100) * 12)));
  };

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

  return (
    <div className="flex min-h-screen flex-col bg-[#f1f5f9]">
      <HelperResourceHeader
        variant="viewer"
        title={file.fileName}
        subtitle={t("savedMeta", {
          relative: formatHelperRelativeDate(file.createdAt),
        })}
        avatarUrl={avatarUrl}
        courseId={courseId}
        pathId={pathId}
        onBack={onBack}
        endSlot={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm text-white/80 hover:bg-white/10"
            >
              {t("print")}
              <Printer className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => void share()}
              className="inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm text-white/80 hover:bg-white/10"
            >
              {t("share")}
              <Share2 className="size-4" />
            </button>
            <button
              type="button"
              onClick={onDownload}
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#2b415e] px-4 text-sm font-medium text-white"
            >
              {t("downloadDocument")}
              <Download className="size-4" />
            </button>
          </div>
        }
      />

      <div className="mx-auto flex w-full max-w-[1280px] flex-1 gap-4 p-4 md:p-6">
        <aside className="hidden w-64 shrink-0 flex-col rounded-xl border border-[#e2e8f0] bg-white p-4 lg:flex">
          <div className="mb-3 flex items-center justify-end gap-2 text-sm font-bold text-[#2c4260]">
            <span>{t("toc")}</span>
            <List className="size-4" />
          </div>
          <nav className="flex flex-1 flex-col gap-1">
            {toc.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveToc(index)}
                className={`rounded-lg px-3 py-2 text-end text-sm ${
                  activeToc === index
                    ? "bg-[rgba(43,65,94,0.08)] font-bold text-[#2b415e]"
                    : "text-[#64748b] hover:bg-[#f8fafc]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
          <div className="mt-4 rounded-lg bg-[#f8fafc] p-3">
            <div className="mb-2 flex items-center justify-between text-xs text-[#64748b]">
              <span className="font-bold text-[#2b415e]">{progress}%</span>
              <span>{t("completionRate")}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[#e2e8f0]">
              <div
                className="h-full rounded-full bg-[#2b415e] transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </aside>

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="relative flex-1 overflow-auto rounded-xl bg-[#e2e8f0]/30 p-4 md:p-8"
        >
          <div
            className="mx-auto max-w-3xl overflow-hidden rounded-sm bg-white shadow-lg"
            style={{ zoom: `${zoom}%` }}
          >
            {loading ? (
              <Skeleton className="h-[70vh] w-full" />
            ) : error || !buffer ? (
              <p className="py-20 text-center text-sm text-red-600">{t("loadError")}</p>
            ) : (
              <HelperDocxPreview
                fileBuffer={buffer}
                loadingLabel={t("loading")}
                loadErrorLabel={t("loadError")}
              />
            )}
          </div>

          <div className="pointer-events-none sticky bottom-6 z-10 flex justify-center">
            <div className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-[#1e293b] px-3 py-2 text-white shadow-xl">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(75, z - 10))}
                className="rounded-full p-2 hover:bg-white/10"
              >
                <ZoomOut className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollRef.current?.scrollBy({ top: -400, behavior: "smooth" })}
                className="rounded-full p-2 hover:bg-white/10"
              >
                <ChevronRight className="size-4" />
              </button>
              <span className="px-2 text-xs">{progress}%</span>
              <button
                type="button"
                onClick={() => scrollRef.current?.scrollBy({ top: 400, behavior: "smooth" })}
                className="rounded-full p-2 hover:bg-white/10"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(150, z + 10))}
                className="rounded-full p-2 hover:bg-white/10"
              >
                <ZoomIn className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
