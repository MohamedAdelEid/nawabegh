"use client";

import { useEffect, useState, useMemo, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { HelperDocxPreview } from "@/modules/admin/presentation/components/helper-file-management/HelperDocxPreview";
import { HelperPptxPreview } from "@/modules/admin/presentation/components/helper-file-management/HelperPptxPreview";
import {
  detectResourcePreviewKind,
  mimeTypeForPreviewKind,
  type ResourcePreviewKind,
} from "@/modules/admin/presentation/components/helper-file-management/detectResourcePreviewKind";
import { notify } from "@/shared/application/lib/toast";
import { fetchFileForViewer } from "@/shared/infrastructure/files/fetchFileForViewer";
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

type ReactPdfComponents = {
  Document: typeof import("react-pdf").Document;
  Page: typeof import("react-pdf").Page;
};

type HelperResourceFilePreviewProps = {
  fileUrl: string;
  fileName?: string;
  fileType?: string | null;
  mediaKind?: string | null;
};

export function HelperResourceFilePreview({
  fileUrl,
  fileName,
  fileType,
  mediaKind,
}: HelperResourceFilePreviewProps) {
  const t = useTranslations("admin.dashboard.contentManagement.details.viewer");

  const previewKind = useMemo(() => {
    if (mediaKind) {
      const normalized = mediaKind.trim().toLowerCase();
      if (normalized === "pdf") return "pdf";
      if (normalized === "presentation") return "pptx";
      if (normalized === "word") return "docx";
      if (normalized === "image") return "image";
      if (normalized === "video") return "video";
      if (normalized === "audio") return "audio";
    }
    return detectResourcePreviewKind(fileUrl, fileType);
  }, [fileUrl, fileType, mediaKind]);

  const [fileBuffer, setFileBuffer] = useState<ArrayBuffer | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [reactPdf, setReactPdf] = useState<ReactPdfComponents | null>(null);
  const [pdfPages, setPdfPages] = useState(0);

  useEffect(() => {
    if (previewKind !== "pdf") return;

    let alive = true;
    void import("react-pdf").then((mod) => {
      if (!alive) return;
      mod.pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${mod.pdfjs.version}/build/pdf.worker.min.mjs`;
      setReactPdf({ Document: mod.Document, Page: mod.Page });
    });

    return () => {
      alive = false;
    };
  }, [previewKind]);

  useEffect(() => {
    let alive = true;
    let objectUrl: string | null = null;

    const load = async () => {
      setLoading(true);
      setLoadError(false);
      setNotFound(false);
      setFileBuffer(null);
      setBlobUrl(null);
      setPdfPages(0);

      if (
        previewKind === "unsupported" ||
        previewKind === "doc-legacy" ||
        previewKind === "ppt-legacy"
      ) {
        setLoading(false);
        return;
      }

      const result = await fetchFileForViewer(fileUrl);
      if (!alive) return;

      if (!result.ok) {
        setLoadError(true);
        setNotFound(result.reason === "not_found");
        setLoading(false);
        notify.error(
          result.reason === "not_found" ? t("fileNotFound") : t("loadError"),
        );
        return;
      }

      const buffer = result.data;
      setFileBuffer(buffer);

      if (previewKind !== "docx" && previewKind !== "pptx") {
        const mime = mimeTypeForPreviewKind(previewKind);
        const blob = new Blob([buffer], { type: mime });
        objectUrl = URL.createObjectURL(blob);
        setBlobUrl(objectUrl);
      }

      setLoading(false);
    };

    void load();

    return () => {
      alive = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [fileUrl, previewKind]);

  if (previewKind === "unsupported") {
    return (
      <PreviewShell title={t("title")}>
        <p className="py-12 text-center text-sm text-slate-500">{t("unsupported")}</p>
      </PreviewShell>
    );
  }

  if (previewKind === "doc-legacy") {
    return (
      <PreviewShell title={t("title")}>
        <p className="py-12 text-center text-sm text-slate-500">{t("legacyDocUnsupported")}</p>
      </PreviewShell>
    );
  }

  if (previewKind === "ppt-legacy") {
    return (
      <PreviewShell title={t("title")}>
        <p className="py-12 text-center text-sm text-slate-500">{t("legacyPptUnsupported")}</p>
      </PreviewShell>
    );
  }

  if (loading) {
    return (
      <PreviewShell title={t("title")}>
        <div className="space-y-3">
          <Skeleton className="h-[28rem] w-full rounded-xl" />
          <p className="text-center text-sm text-slate-500">{t("loading")}</p>
        </div>
      </PreviewShell>
    );
  }

  if (loadError || !fileBuffer) {
    return (
      <PreviewShell title={t("title")}>
        <p className="py-12 text-center text-sm text-red-600">
          {notFound ? t("fileNotFound") : t("loadError")}
        </p>
      </PreviewShell>
    );
  }

  return (
    <PreviewShell title={t("title")} fileName={fileName}>
      <PreviewContent
        kind={previewKind}
        fileBuffer={fileBuffer}
        blobUrl={blobUrl}
        reactPdf={reactPdf}
        pdfPages={pdfPages}
        onPdfLoad={(pages) => setPdfPages(pages)}
        loadingLabel={t("loading")}
        loadErrorLabel={t("loadError")}
      />
    </PreviewShell>
  );
}

function PreviewShell({
  title,
  fileName,
  children,
}: {
  title: string;
  fileName?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
      <div className="text-right">
        <p className="text-xs text-slate-400">{title}</p>
        {fileName ? <p className="text-sm font-semibold text-[#1E3A66]">{fileName}</p> : null}
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">{children}</div>
    </div>
  );
}

function PreviewContent({
  kind,
  fileBuffer,
  blobUrl,
  reactPdf,
  pdfPages,
  onPdfLoad,
  loadingLabel,
  loadErrorLabel,
}: {
  kind: ResourcePreviewKind;
  fileBuffer: ArrayBuffer;
  blobUrl: string | null;
  reactPdf: ReactPdfComponents | null;
  pdfPages: number;
  onPdfLoad: (pages: number) => void;
  loadingLabel: string;
  loadErrorLabel: string;
}) {
  if (kind === "docx") {
    return (
      <HelperDocxPreview
        fileBuffer={fileBuffer}
        loadingLabel={loadingLabel}
        loadErrorLabel={loadErrorLabel}
      />
    );
  }

  if (kind === "pptx") {
    return (
      <HelperPptxPreview
        fileBuffer={fileBuffer}
        loadingLabel={loadingLabel}
        loadErrorLabel={loadErrorLabel}
      />
    );
  }

  if (kind === "image" && blobUrl) {
    return (
      <div className="flex max-h-[32rem] items-center justify-center overflow-auto p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={blobUrl}
          alt=""
          className="max-h-[30rem] w-auto max-w-full object-contain"
        />
      </div>
    );
  }

  if (kind === "video" && blobUrl) {
    return (
      <div className="bg-black p-2">
        <video src={blobUrl} controls className="max-h-[32rem] w-full rounded-lg">
          <track kind="captions" />
        </video>
      </div>
    );
  }

  if (kind === "audio" && blobUrl) {
    return (
      <div className="p-6">
        <audio src={blobUrl} controls className="w-full">
          <track kind="captions" />
        </audio>
      </div>
    );
  }

  if (kind === "iframe" && blobUrl) {
    return (
      <iframe
        src={blobUrl}
        title="file-preview"
        className="h-[32rem] w-full border-0"
      />
    );
  }

  if (kind === "pdf" && blobUrl) {
    if (!reactPdf) {
      return (
        <div className="flex min-h-[20rem] items-center justify-center gap-2 p-8 text-sm text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          {loadingLabel}
        </div>
      );
    }

    const { Document, Page } = reactPdf;

    return (
      <div className="max-h-[60rem] overflow-y-auto bg-slate-100/80 p-4">
        <Document
          file={blobUrl}
          loading={
            <div className="flex min-h-[20rem] items-center justify-center gap-2 text-sm text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              {loadingLabel}
            </div>
          }
          error={
            <p className="py-12 text-center text-sm text-red-600">{loadErrorLabel}</p>
          }
          onLoadSuccess={({ numPages }) => onPdfLoad(numPages)}
        >
          {pdfPages > 0 ? (
            <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4">
              {Array.from({ length: pdfPages }, (_, index) => (
                <Page
                  key={`helper-file-pdf-page-${index + 1}`}
                  pageNumber={index + 1}
                  width={720}
                  renderTextLayer
                  renderAnnotationLayer
                  className="overflow-hidden rounded-lg shadow-sm"
                />
              ))}
            </div>
          ) : null}
        </Document>
      </div>
    );
  }

  return (
    <p className="py-12 text-center text-sm text-red-600">{loadErrorLabel}</p>
  );
}
