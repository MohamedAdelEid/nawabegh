"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

type HelperPptxPreviewProps = {
  fileBuffer: ArrayBuffer;
  loadingLabel: string;
  loadErrorLabel: string;
};

export function HelperPptxPreview({
  fileBuffer,
  loadingLabel,
  loadErrorLabel,
}: HelperPptxPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [renderState, setRenderState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let alive = true;
    const container = containerRef.current;
    if (!container) return;

    setRenderState("loading");
    container.innerHTML = "";

    const abortController = new AbortController();
    let viewer: { destroy: () => void } | null = null;

    void import("@aiden0z/pptx-renderer")
      .then(({ PptxViewer, RECOMMENDED_ZIP_LIMITS }) =>
        PptxViewer.open(fileBuffer, container, {
          zipLimits: RECOMMENDED_ZIP_LIMITS,
          fitMode: "contain",
          listOptions: { windowed: true, batchSize: 4 },
          signal: abortController.signal,
        }),
      )
      .then((instance) => {
        viewer = instance;
        if (alive) setRenderState("ready");
      })
      .catch(() => {
        if (alive && !abortController.signal.aborted) setRenderState("error");
      });

    return () => {
      alive = false;
      abortController.abort();
      viewer?.destroy();
      container.innerHTML = "";
    };
  }, [fileBuffer]);

  return (
    <div className="relative max-h-[36rem] overflow-y-auto bg-white p-4">
      {renderState === "loading" ? (
        <div className="flex min-h-[20rem] items-center justify-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          {loadingLabel}
        </div>
      ) : null}
      {renderState === "error" ? (
        <p className="py-12 text-center text-sm text-red-600">{loadErrorLabel}</p>
      ) : null}
      <div
        ref={containerRef}
        className={[
          "pptx-preview-host",
          renderState === "ready" ? "opacity-100" : "opacity-0",
          renderState === "loading" ? "pointer-events-none absolute inset-0 h-0 overflow-hidden" : "",
        ].join(" ")}
        dir="auto"
      />
    </div>
  );
}
