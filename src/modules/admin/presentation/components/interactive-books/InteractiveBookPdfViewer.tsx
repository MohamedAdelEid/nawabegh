"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  getHotspotsByPage,
  type InteractiveBookHotspot,
} from "@/modules/admin/infrastructure/api/hotspotsApi";
import { cn } from "@/shared/application/lib/cn";
import type { HotspotPlacement } from "@/modules/admin/presentation/components/interactive-books/interactiveBookPdfViewer.types";
import { fetchFileAsArrayBuffer } from "@/shared/infrastructure/files/fetchFileForViewer";
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

type ReactPdfComponents = {
  Document: typeof import("react-pdf").Document;
  Page: typeof import("react-pdf").Page;
};

type InteractiveBookPdfViewerProps = {
  /** Local blob URL from a file the user just picked (no auth needed). */
  localFileUrl?: string | null;
  /** Raw `pdfUrl` / upload path from the book API or upload response (fetched with auth). */
  serverPdfPath?: string | null;
  currentPage: number;
  scale: number;
  placementMode: boolean;
  /** When set, hotspots for the current page are loaded from the API. */
  interactiveBookId?: string | null;
  /** Increment after create / delete / toggle so the viewer refetches the current page. */
  hotspotsReloadKey?: number;
  onDocumentLoadSuccess: (totalPages: number) => void;
  onPageClick: (placement: HotspotPlacement) => void;
};

// ---------------------------------------------------------------------------
// HotspotTooltip — smart-positioned card that opens on click
// ---------------------------------------------------------------------------
function HotspotTooltip({
  hotspot,
  onClose,
}: {
  hotspot: InteractiveBookHotspot;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // Smart placement: flip sides based on hotspot position
  const openLeft = hotspot.xPosition > 60;
  const openUp = hotspot.yPosition > 60;

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label={hotspot.title}
      className={cn(
        "absolute z-30 w-56 animate-in fade-in-0 zoom-in-95 duration-150",
        openLeft ? "right-[110%]" : "left-[110%]",
        openUp ? "bottom-0" : "top-0",
      )}
      style={{ filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.16))" }}
    >
      {/* Arrow */}
      <div
        aria-hidden
        className={cn(
          "absolute top-3.5 h-2.5 w-2.5 rotate-45 bg-[var(--dashboard-primary)]",
          openLeft ? "-right-[5px]" : "-left-[5px]",
        )}
      />

      {/* Card */}
      <div className="overflow-hidden rounded-xl border border-slate-100 bg-white">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 bg-[var(--dashboard-primary)] px-3 py-2.5">
          <p className="text-xs font-semibold leading-snug text-white">{hotspot.title}</p>
          <button
            type="button"
            onClick={onClose}
            className="ml-auto mt-px shrink-0 rounded p-0.5 text-white/70 transition-colors hover:bg-white/20 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            aria-label="Close tooltip"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-2.5 px-3 py-3">

          <dl className="space-y-1.5">

          <div className="flex flex-col gap-0.5">
            <dt className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Link</dt>
            <dd>
              <a
                href={hotspot.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate text-[11px] font-medium text-[var(--dashboard-primary)] underline-offset-2 hover:underline"
              >
                {hotspot.videoUrl}
              </a>
            </dd>
            </div>
            {hotspot.pageNumber ? (
              <div className="flex items-center justify-between">
                <dt className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Page</dt>
                <dd className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
                  {hotspot.pageNumber}
                </dd>
              </div>
            ) : null}

            <div className="flex items-center justify-between">
              <dt className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Position</dt>
              <dd className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-600">
                {hotspot.xPosition}%,&nbsp;{hotspot.yPosition}%
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main viewer
// ---------------------------------------------------------------------------
export function InteractiveBookPdfViewer({
  localFileUrl,
  serverPdfPath,
  currentPage,
  scale,
  placementMode,
  interactiveBookId,
  hotspotsReloadKey = 0,
  onDocumentLoadSuccess,
  onPageClick,
}: InteractiveBookPdfViewerProps) {
  const t = useTranslations("admin.dashboard.interactiveBooks.managePage.viewer");
  const [loadError, setLoadError] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [documentFile, setDocumentFile] = useState<string | ArrayBuffer | null>(null);
  const [reactPdf, setReactPdf] = useState<ReactPdfComponents | null>(null);
  const [openHotspotId, setOpenHotspotId] = useState<string | null>(null);
  const [pageHotspots, setPageHotspots] = useState<InteractiveBookHotspot[]>([]);
  const [hotspotsLoading, setHotspotsLoading] = useState(false);

  const renderDocumentSkeleton = () => (
    <div className="w-full space-y-4">
      <div className="mx-auto w-full max-w-[46rem] space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-[20rem] w-full rounded-xl" />
      </div>
      <p className="text-center text-sm text-slate-500">{t("loading")}</p>
    </div>
  );

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
    let objectUrl: string | null = null;

    const load = async () => {
      setLoadError(false);
      setDocumentFile(null);

      if (localFileUrl?.startsWith("blob:")) {
        setIsResolving(false);
        setDocumentFile(localFileUrl);
        return;
      }

      const path = serverPdfPath?.trim() ?? "";
      if (!path) {
        setIsResolving(false);
        return;
      }

      setIsResolving(true);
      const buffer = await fetchFileAsArrayBuffer(path);
      if (!alive) return;
      setIsResolving(false);

      if (!buffer) {
        setLoadError(true);
        return;
      }

      const blob = new Blob([buffer], { type: "application/pdf" });
      objectUrl = URL.createObjectURL(blob);
      setDocumentFile(objectUrl);
    };

    void load();

    return () => {
      alive = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [localFileUrl, serverPdfPath]);

  useEffect(() => {
    const bookId = interactiveBookId?.trim() ?? "";
    if (!bookId) {
      setPageHotspots([]);
      return;
    }

    let alive = true;
    setHotspotsLoading(true);

    void getHotspotsByPage(bookId, currentPage).then((result) => {
      if (!alive) return;
      setHotspotsLoading(false);
      if (!result.errorMessage && result.data) {
        setPageHotspots(result.data);
      } else {
        setPageHotspots([]);
      }
    });

    return () => {
      alive = false;
    };
  }, [interactiveBookId, currentPage, hotspotsReloadKey]);

  // Close tooltip on page change
  useEffect(() => {
    setOpenHotspotId(null);
  }, [currentPage]);

  const handlePageClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!placementMode) return;
      const rect = event.currentTarget.getBoundingClientRect();
      const xPosition = ((event.clientX - rect.left) / rect.width) * 100;
      const yPosition = ((event.clientY - rect.top) / rect.height) * 100;
      onPageClick({
        pageNumber: currentPage,
        xPosition: Math.round(xPosition * 100) / 100,
        yPosition: Math.round(yPosition * 100) / 100,
      });
    },
    [currentPage, onPageClick, placementMode],
  );

  const hasSource = Boolean(localFileUrl?.trim() || serverPdfPath?.trim());

  if (!hasSource) {
    return (
      <div className="flex min-h-[22rem] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-8 text-center text-sm text-slate-500">
        {t("noPdf")}
      </div>
    );
  }

  if (!reactPdf) {
    return (
      <div className="flex min-h-[20rem] items-center justify-center">
        {renderDocumentSkeleton()}
      </div>
    );
  }

  const { Document, Page } = reactPdf;

  return (
    <div className="relative min-h-[22rem] rounded-2xl border border-slate-200 bg-slate-100/50 p-4">
      {isResolving ? (
        <div className="flex min-h-[20rem] items-center justify-center">
          {renderDocumentSkeleton()}
        </div>
      ) : loadError || !documentFile ? (
        <p className="py-16 text-center text-sm text-red-600">{t("loadError")}</p>
      ) : (
        <Document
          file={documentFile}
          loading={
            <div className="flex min-h-[20rem] items-center justify-center">
              {renderDocumentSkeleton()}
            </div>
          }
          onLoadSuccess={({ numPages }) => {
            setLoadError(false);
            onDocumentLoadSuccess(numPages);
          }}
          onLoadError={() => setLoadError(true)}
          className="flex justify-center"
        >
          <div
            className={cn(
              "relative inline-block shadow-md",
              placementMode && "cursor-crosshair ring-2 ring-[var(--dashboard-primary)]/40 ring-offset-2",
            )}
            onClick={handlePageClick}
            role={placementMode ? "button" : undefined}
            tabIndex={placementMode ? 0 : undefined}
            onKeyDown={(event) => {
              if (placementMode && (event.key === "Enter" || event.key === " ")) {
                event.preventDefault();
              }
            }}
          >
            <Page
              pageNumber={currentPage}
              scale={scale}
              renderTextLayer
              renderAnnotationLayer
              className="bg-white"
            />

            {hotspotsLoading ? (
              <div
                className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-white/40"
                aria-hidden
              >
                <Loader2 className="h-6 w-6 animate-spin text-[var(--dashboard-primary)]" />
              </div>
            ) : null}

            {pageHotspots.map((hotspot) => {
              const isOpen = openHotspotId === hotspot.id;

              return (
                <div
                  key={hotspot.id}
                  className="absolute z-10 rounded-full"
                  style={{
                    left: `${hotspot.xPosition}%`,
                    top: `${hotspot.yPosition}%`,
                    width: `30px`,
                    height: `30px`,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  {/* Hotspot trigger button */}
                  <button
                    type="button"
                    className={cn("absolute inset-0 group", isOpen && "z-20")}
                    aria-expanded={isOpen}
                    aria-haspopup="dialog"
                    aria-label={hotspot.title}
                    onClick={(event) => {
                      event.stopPropagation();
                      setOpenHotspotId(isOpen ? null : hotspot.id);
                    }}
                  >
                    {/* Ping ring — paused when open */}
                    <span
                      aria-hidden
                      className={cn(
                        "pointer-events-none absolute inset-0 rounded-full bg-[var(--dashboard-primary)] opacity-25",
                        isOpen ? "hidden" : "animate-ping",
                      )}
                      style={{ animationDuration: "2s" }}
                    />
                    {/* Halo ring */}
                    <span
                      aria-hidden
                      className={cn(
                        "pointer-events-none absolute inset-0 rounded-full border transition-all duration-200",
                        isOpen
                          ? "border-[var(--dashboard-primary)]/60 shadow-[0_0_0_5px_color-mix(in_srgb,var(--dashboard-primary)_20%,transparent)]"
                          : "border-[var(--dashboard-primary)]/35 shadow-[0_0_0_5px_color-mix(in_srgb,var(--dashboard-primary)_12%,transparent)]",
                      )}
                    />
                    {/* Core */}
                    <span
                      className={cn(
                        "absolute inset-0 flex items-center justify-center rounded-full bg-[var(--dashboard-primary)] transition-all duration-200",
                        "shadow-[0_2px_14px_color-mix(in_srgb,var(--dashboard-primary)_50%,transparent)]",
                        isOpen
                          ? "scale-110 brightness-110 shadow-[0_4px_20px_color-mix(in_srgb,var(--dashboard-primary)_60%,transparent)]"
                          : "group-hover:brightness-110 group-hover:scale-110 group-hover:shadow-[0_4px_20px_color-mix(in_srgb,var(--dashboard-primary)_60%,transparent)]",
                      )}
                    >
                      {isOpen ? (
                        <X className="h-[45%] w-[45%] text-white" aria-hidden />
                      ) : (
                        <span aria-hidden className="h-[35%] w-[35%] rounded-full bg-white/95 shadow-[inset_0_1px_2px_rgba(0,0,0,0.15)]" />
                      )}
                    </span>
                  </button>

                  {/* Tooltip card */}
                  {isOpen && (
                    <HotspotTooltip
                      hotspot={hotspot}
                      onClose={() => setOpenHotspotId(null)}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </Document>
      )}
      {placementMode ? (
        <p className="mt-3 text-center text-xs font-medium text-[var(--dashboard-primary)]">
          {t("placementHint")}
        </p>
      ) : null}
    </div>
  );
}