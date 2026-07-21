"use client";

import { useEffect, useState } from "react";
import { Download, Play, Printer, Share2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { HelperResourceHeader } from "./HelperResourceHeader";
import { HelperPptxPreview } from "@/modules/admin/presentation/components/helper-file-management/HelperPptxPreview";
import {
  formatHelperRelativeDate,
} from "@/modules/student/domain/helper-resource/helper-resource.utils";
import type { StudentHelperResourceFileDto } from "@/modules/student/domain/types/helperResource.types";
import { fetchFileAsArrayBuffer } from "@/shared/infrastructure/files/fetchFileForViewer";
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";

type HelperResourcePptViewerProps = {
  file: StudentHelperResourceFileDto;
  stationTitle: string;
  learningPathTitle: string;
  avatarUrl?: string | null;
  courseId?: string | null;
  pathId?: string | null;
  onBack: () => void;
  onDownload: () => void;
  onProgress: (readPercentage: number, lastPageOrSlide: number) => void;
};

export function HelperResourcePptViewer({
  file,
  stationTitle,
  learningPathTitle,
  avatarUrl,
  courseId,
  pathId,
  onBack,
  onDownload,
  onProgress,
}: HelperResourcePptViewerProps) {
  const t = useTranslations("student.dashboard.helperResource.viewer");
  const [buffer, setBuffer] = useState<ArrayBuffer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [tab, setTab] = useState<"content" | "notes">("content");
  const [notes, setNotes] = useState("");
  const [zoom, setZoom] = useState(100);

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
      onProgress(
        Math.max(file.readingProgress?.readPercentage ?? 5, 5),
        Math.max(file.readingProgress?.lastPageOrSlide ?? 1, 1),
      );
    });
    return () => {
      alive = false;
    };
  }, [file.fileUrl, file.readingProgress?.lastPageOrSlide, file.readingProgress?.readPercentage, onProgress]);

  const startPresentation = () => {
    const el = document.getElementById("helper-pptx-stage");
    if (el && el.requestFullscreen) {
      void el.requestFullscreen();
    }
  };

  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: file.fileName, url: file.fileUrl });
      } else {
        await navigator.clipboard.writeText(file.fileUrl);
      }
    } catch {
      // ignore cancel
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#f1f5f9]">
      <HelperResourceHeader
        variant="viewer"
        title={learningPathTitle || stationTitle}
        subtitle={`${t("breadcrumbHelper")} > ${file.fileName}`}
        avatarUrl={avatarUrl}
        courseId={courseId}
        pathId={pathId}
        onBack={onBack}
        className="!bg-white !border-[#e2e8f0] [&_p]:!text-[#2c4260] [&_button]:!text-[#64748b]"
        endSlot={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onDownload}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#e2e8f0] bg-white px-3 text-sm font-medium text-[#334155]"
            >
              {t("downloadFile")}
              <Download className="size-4" />
            </button>
            <button
              type="button"
              onClick={startPresentation}
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#2b415e] px-3 text-sm font-medium text-white"
            >
              {t("startPresentation")}
              <Play className="size-4" />
            </button>
          </div>
        }
      />

      <div className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col gap-4 p-4 md:p-6">
        <div
          id="helper-pptx-stage"
          className="flex-1 overflow-hidden rounded-xl bg-white p-4 shadow-sm"
          style={{ zoom: `${zoom}%` }}
        >
          {loading ? (
            <Skeleton className="h-[60vh] w-full rounded-xl" />
          ) : error || !buffer ? (
            <p className="py-20 text-center text-sm text-red-600">{t("loadError")}</p>
          ) : (
            <HelperPptxPreview
              fileBuffer={buffer}
              loadingLabel={t("loading")}
              loadErrorLabel={t("loadError")}
            />
          )}
        </div>
      </div>

      <footer className="border-t border-[#e2e8f0] bg-white px-4 py-3 md:px-8">
        <div className="mx-auto flex w-full max-w-[1280px] flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setTab("content")}
              className={`pb-1 text-sm font-bold ${
                tab === "content"
                  ? "border-b-2 border-[#2b415e] text-[#2b415e]"
                  : "text-[#94a3b8]"
              }`}
            >
              {t("contentTab")}
            </button>
            <button
              type="button"
              onClick={() => setTab("notes")}
              className={`pb-1 text-sm font-bold ${
                tab === "notes"
                  ? "border-b-2 border-[#2b415e] text-[#2b415e]"
                  : "text-[#94a3b8]"
              }`}
            >
              {t("notesTab")}
            </button>
            <span className="text-xs text-[#94a3b8]">
              {t("lastUpdated", {
                relative: formatHelperRelativeDate(file.createdAt),
              })}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-md p-2 text-[#64748b] hover:bg-[#f1f5f9]"
              aria-label={t("print")}
            >
              <Printer className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => void share()}
              className="rounded-md p-2 text-[#64748b] hover:bg-[#f1f5f9]"
              aria-label={t("share")}
            >
              <Share2 className="size-4" />
            </button>
            <label className="flex items-center gap-2 text-sm text-[#64748b]">
              <span>{t("zoom")}:</span>
              <select
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="rounded-md border border-[#e2e8f0] bg-white px-2 py-1 text-[#334155]"
              >
                {[75, 100, 125, 150].map((value) => (
                  <option key={value} value={value}>
                    {value}%
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {tab === "notes" ? (
          <div className="mx-auto mt-3 w-full max-w-[1280px]">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t("notesPlaceholder")}
              className="min-h-24 w-full rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-3 text-sm text-[#334155]"
            />
          </div>
        ) : null}
      </footer>
    </div>
  );
}
