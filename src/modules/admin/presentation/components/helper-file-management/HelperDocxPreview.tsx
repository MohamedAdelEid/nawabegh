"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

type HelperDocxPreviewProps = {
  fileBuffer: ArrayBuffer;
  loadingLabel: string;
  loadErrorLabel: string;
};

export function HelperDocxPreview({
  fileBuffer,
  loadingLabel,
  loadErrorLabel,
}: HelperDocxPreviewProps) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const styleRef = useRef<HTMLDivElement>(null);
  const [renderState, setRenderState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let alive = true;
    const body = bodyRef.current;
    const style = styleRef.current;
    if (!body) return;

    setRenderState("loading");
    body.innerHTML = "";
    if (style) style.innerHTML = "";

    void import("docx-preview")
      .then(({ renderAsync }) =>
        renderAsync(fileBuffer, body, style ?? undefined, {
          className: "docx-preview",
          inWrapper: true,
          ignoreWidth: false,
          ignoreHeight: false,
          ignoreFonts: false,
          breakPages: true,
          ignoreLastRenderedPageBreak: true,
          useBase64URL: true,
          trimXmlDeclaration: true,
        }),
      )
      .then(() => {
        if (alive) setRenderState("ready");
      })
      .catch(() => {
        if (alive) setRenderState("error");
      });

    return () => {
      alive = false;
      body.innerHTML = "";
      if (style) style.innerHTML = "";
    };
  }, [fileBuffer]);

  return (
    <div className="relative max-h-[36rem] overflow-y-auto bg-white p-4">
      <div ref={styleRef} className="hidden" aria-hidden />
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
        ref={bodyRef}
        className={[
          "docx-preview-host text-right text-slate-800",
          renderState === "ready" ? "opacity-100" : "opacity-0",
          renderState === "loading" ? "pointer-events-none absolute inset-0 h-0 overflow-hidden" : "",
        ].join(" ")}
        dir="auto"
      />
    </div>
  );
}
