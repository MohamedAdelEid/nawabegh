"use client";

import { CheckCheck, Download, FileText } from "lucide-react";
import type { ParentChatMessage } from "@/modules/parent/domain/types/parentChat.types";
import { cn } from "@/shared/application/lib/cn";
import { resolveFileUrl } from "@/shared/infrastructure/files/fileUrl";

function AttachmentCard({
  fileName,
  sizeLabel,
  url,
  isMine,
}: {
  fileName: string;
  sizeLabel: string;
  url: string;
  isMine: boolean;
}) {
  const resolved = resolveFileUrl(url) ?? url;
  const extension = fileName.split(".").pop()?.toUpperCase() || "FILE";

  return (
    <a
      href={resolved}
      target="_blank"
      rel="noreferrer"
      className={cn(
        "flex items-center gap-3 rounded-xl border p-3 transition-colors",
        isMine
          ? "border-white/20 bg-white/10 hover:bg-white/15"
          : "border-[#e2e8f0] bg-[#f1f3f5] hover:bg-[#e9ecef]",
      )}
    >
      <FileText
        className={cn("size-4 shrink-0", isMine ? "text-white" : "text-[#2b415e]")}
        aria-hidden
      />
      <div className="min-w-0 flex-1 text-start">
        <p
          className={cn(
            "truncate text-xs font-bold",
            isMine ? "text-white" : "text-[#2b415e]",
          )}
        >
          {fileName}
        </p>
        <p
          className={cn(
            "text-[10px]",
            isMine ? "text-white/70" : "text-[#64748b]",
          )}
        >
          {sizeLabel} • {extension}
        </p>
      </div>
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-lg",
          isMine ? "bg-white/15" : "bg-[rgba(199,175,109,0.2)]",
        )}
      >
        <Download
          className={cn("size-4", isMine ? "text-white" : "text-[#c7af6d]")}
          aria-hidden
        />
      </span>
    </a>
  );
}

export function ParentChatMessageBubble({ message }: { message: ParentChatMessage }) {
  const isMine = message.isMine;
  const imageAttachments = message.attachments.filter(
    (item) => item.attachmentType === 1 || item.mimeType.startsWith("image/"),
  );
  const fileAttachments = message.attachments.filter(
    (item) => !(item.attachmentType === 1 || item.mimeType.startsWith("image/")),
  );

  return (
    <div className={cn("flex w-full", isMine ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "flex max-w-[min(100%,28rem)] flex-col gap-1 px-3 py-2.5 shadow-sm",
          isMine
            ? "rounded-bl-2xl rounded-br-2xl rounded-tr-2xl bg-[#2b415e] text-white"
            : "rounded-bl-2xl rounded-br-2xl rounded-tl-2xl border border-[rgba(226,232,240,0.5)] bg-white text-[#0f172a]",
        )}
      >
        {message.content ? (
          <p className="whitespace-pre-wrap text-sm leading-[22.75px]" dir="auto">
            {message.content}
          </p>
        ) : null}

        {imageAttachments.length > 0 ? (
          <div className="space-y-2">
            {imageAttachments.map((attachment) => (
              <a
                key={attachment.id}
                href={attachment.url}
                target="_blank"
                rel="noreferrer"
                className="block overflow-hidden rounded-xl"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={attachment.previewUrl || attachment.url}
                  alt={attachment.fileName}
                  className="max-h-64 w-full object-cover"
                />
              </a>
            ))}
          </div>
        ) : null}

        {fileAttachments.length > 0 ? (
          <div className="space-y-2">
            {fileAttachments.map((attachment) => (
              <AttachmentCard
                key={attachment.id}
                fileName={attachment.fileName}
                sizeLabel={attachment.sizeLabel}
                url={attachment.url}
                isMine={isMine}
              />
            ))}
          </div>
        ) : null}

        <div
          className={cn(
            "flex items-center gap-1",
            isMine ? "justify-start" : "justify-end",
          )}
        >
          {isMine ? (
            <CheckCheck className="size-3 text-white/70" aria-hidden />
          ) : null}
          <span
            className={cn(
              "text-[10px] leading-[15px]",
              isMine ? "text-white/70" : "text-[#64748b]/70",
            )}
          >
            {message.timeLabel}
          </span>
        </div>
      </div>
    </div>
  );
}
