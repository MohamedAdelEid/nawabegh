"use client";

import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Maximize2,
  Minimize2,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useTranslations } from "next-intl";
import {
  computeReadPercentage,
  formatHelperFileSizeArabic,
} from "@/modules/student/domain/helper-resource/helper-resource.utils";
import type { StudentHelperResourceFileDto } from "@/modules/student/domain/types/helperResource.types";
import { fetchFileAsArrayBuffer } from "@/shared/infrastructure/files/fetchFileForViewer";
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

type ReactPdfComponents = {
  Document: typeof import("react-pdf").Document;
  Page: typeof import("react-pdf").Page;
};

type HelperResourcePdfViewerProps = {
  file: StudentHelperResourceFileDto;
  onClose: () => void;
  onDownload: () => void;
  onProgress: (readPercentage: number, lastPageOrSlide: number) => void;
};

export function HelperResourcePdfViewer({
  file,
  onClose,
  onDownload,
  onProgress,
}: HelperResourcePdfViewerProps) {
  const t = useTranslations("student.dashboard.helperResource.viewer");
  const [reactPdf, setReactPdf] = useState<ReactPdfComponents | null>(null);
  const [buffer, setBuffer] = useState<ArrayBuffer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(
    Math.max(1, file.readingProgress?.lastPageOrSlide || 1),
  );
  const [pageCount, setPageCount] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    let alive = true;
    void import("react-pdf").then((mod) => {
      if (!alive) return;
      mod.pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${mod.pdfjs.version}/build/pdf.worker.min.mjs`;
      setReactPdf({ Document: mod.Document, Page: mod.Page });
    });
    return () => {
      alive = false;
    };
  }, []);

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

  useEffect(() => {
    if (pageCount > 0) {
      onProgress(computeReadPercentage(page, pageCount), page);
    }
  }, [onProgress, page, pageCount]);

  const goPage = (next: number) => {
    if (pageCount <= 0) return;
    setPage(Math.min(pageCount, Math.max(1, next)));
  };

  const pageButtons = () => {
    if (pageCount <= 0) return null;
    const items: (number | "ellipsis")[] = [];
    if (pageCount <= 7) {
      for (let i = 1; i <= pageCount; i++) items.push(i);
    } else {
      items.push(1);
      if (page > 3) items.push("ellipsis");
      for (
        let i = Math.max(2, page - 1);
        i <= Math.min(pageCount - 1, page + 1);
        i++
      ) {
        items.push(i);
      }
      if (page < pageCount - 2) items.push("ellipsis");
      items.push(pageCount);
    }
    return items;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(15,23,42,0.55)] p-4 backdrop-blur-sm">
      <div
        className={`flex w-full flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ${
          fullscreen ? "h-full max-w-none" : "h-[90vh] max-w-5xl"
        }`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#e2e8f0] px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-9 items-center justify-center rounded-full text-[#64748b] hover:bg-[#f1f5f9]"
            aria-label={t("close")}
          >
            <X className="size-5" />
          </button>
          <div className="min-w-0 text-end">
            <p className="truncate text-base font-bold text-[#2c4260]">
              {file.fileName}
            </p>
            <p className="text-xs text-[#64748b]">
              {t("fileSize", {
                size: formatHelperFileSizeArabic(file.fileSizeBytes),
              })}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e2e8f0] px-5 py-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onDownload}
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#2b415e] px-4 text-sm font-medium text-white"
            >
              {t("download")}
              <Download className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setFullscreen((v) => !v)}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#e2e8f0] px-4 text-sm font-medium text-[#334155]"
            >
              {fullscreen ? t("exitFullscreen") : t("fullscreen")}
              {fullscreen ? (
                <Minimize2 className="size-4" />
              ) : (
                <Maximize2 className="size-4" />
              )}
            </button>
          </div>

          <div className="flex items-center gap-2 text-sm text-[#334155]">
            <button
              type="button"
              onClick={() => goPage(page - 1)}
              disabled={page <= 1}
              className="rounded-md p-1 hover:bg-[#f1f5f9] disabled:opacity-40"
            >
              <ChevronRight className="size-4" />
            </button>
            <span>
              {pageCount > 0 ? `${pageCount} / ${page}` : "—"}
            </span>
            <button
              type="button"
              onClick={() => goPage(page + 1)}
              disabled={pageCount > 0 && page >= pageCount}
              className="rounded-md p-1 hover:bg-[#f1f5f9] disabled:opacity-40"
            >
              <ChevronLeft className="size-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(0.5, Number((z - 0.1).toFixed(1))))}
              className="rounded-md p-1 hover:bg-[#f1f5f9]"
            >
              <ZoomOut className="size-4" />
            </button>
            <span className="min-w-[3rem] text-center text-sm text-[#334155]">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(2, Number((z + 0.1).toFixed(1))))}
              className="rounded-md p-1 hover:bg-[#f1f5f9]"
            >
              <ZoomIn className="size-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-1 items-start justify-center overflow-auto bg-[#f1f5f9] p-6">
          {loading || !reactPdf ? (
            <Skeleton className="h-[70vh] w-full max-w-3xl rounded-xl" />
          ) : error || !buffer ? (
            <p className="py-20 text-sm text-red-600">{t("loadError")}</p>
          ) : (
            <reactPdf.Document
              file={{ data: buffer }}
              loading={<Skeleton className="h-[70vh] w-full max-w-3xl rounded-xl" />}
              onLoadSuccess={(pdf) => {
                setPageCount(pdf.numPages);
                setPage((current) => Math.min(current, pdf.numPages));
              }}
              onLoadError={() => setError(true)}
            >
              <reactPdf.Page
                pageNumber={page}
                scale={zoom}
                className="shadow-lg"
                renderTextLayer
                renderAnnotationLayer
              />
            </reactPdf.Document>
          )}
        </div>

        <div className="flex items-center justify-center gap-1 border-t border-[#e2e8f0] px-4 py-3">
          <button
            type="button"
            onClick={() => goPage(1)}
            className="rounded px-2 py-1 text-sm text-[#64748b] hover:bg-[#f1f5f9]"
          >
            |&lt;
          </button>
          <button
            type="button"
            onClick={() => goPage(page - 1)}
            className="rounded px-2 py-1 text-sm text-[#64748b] hover:bg-[#f1f5f9]"
          >
            &lt;
          </button>
          {pageButtons()?.map((item, index) =>
            item === "ellipsis" ? (
              <span key={`e-${index}`} className="px-1 text-[#94a3b8]">
                …
              </span>
            ) : (
              <button
                key={item}
                type="button"
                onClick={() => goPage(item)}
                className={`inline-flex size-8 items-center justify-center rounded-full text-sm font-medium ${
                  item === page
                    ? "bg-[#2b415e] text-white"
                    : "text-[#64748b] hover:bg-[#f1f5f9]"
                }`}
              >
                {item}
              </button>
            ),
          )}
          <button
            type="button"
            onClick={() => goPage(page + 1)}
            className="rounded px-2 py-1 text-sm text-[#64748b] hover:bg-[#f1f5f9]"
          >
            &gt;
          </button>
          <button
            type="button"
            onClick={() => goPage(pageCount)}
            className="rounded px-2 py-1 text-sm text-[#64748b] hover:bg-[#f1f5f9]"
          >
            &gt;|
          </button>
        </div>
      </div>
    </div>
  );
}
