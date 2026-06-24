"use client";

import { CheckCheck, Download, FileText, Mic, Play } from "lucide-react";
import type { TeacherChatMessage } from "@/modules/teacher/domain/types/teacher.types";
import { UserAvatarImageOrInitials } from "@/shared/presentation/components/user";
import { cn } from "@/shared/application/lib/cn";

interface ChatMessageBubbleProps {
  message: TeacherChatMessage;
  senderName: string;
  content: string;
  replyToName?: string;
  replyToContent?: string;
  fileName?: string;
}

export function ChatMessageBubble({
  message,
  senderName,
  content,
  replyToName,
  replyToContent,
  fileName,
}: ChatMessageBubbleProps) {
  const isTeacher = message.sender.role === "teacher";

  return (
    <div
      className={cn(
        "flex gap-3",
        isTeacher ? "flex-row-reverse justify-start" : "flex-row justify-start",
      )}
    >
      <UserAvatarImageOrInitials
        trackKey={message.sender.id}
        name={senderName}
        imageUrl={null}
        size="sm"
      />

      <div className={cn("max-w-[min(100%,520px)] space-y-1", isTeacher ? "items-end" : "items-start")}>
        <p className={cn("text-xs font-medium text-slate-500", isTeacher ? "text-right" : "text-right")}>
          {senderName}
          {isTeacher ? " (المعلم)" : ""}
        </p>

        {message.type === "reply" && replyToContent ? (
          <div
            className={cn(
              "space-y-2 rounded-2xl px-4 py-3",
              isTeacher ? "bg-[#243B5A] text-white" : "bg-[#F2EFE9] text-slate-800",
            )}
          >
            <div
              className={cn(
                "rounded-xl border-r-4 px-3 py-2 text-xs",
                isTeacher
                  ? "border-white/40 bg-white/10 text-white/90"
                  : "border-[#243B5A]/30 bg-white/60 text-slate-600",
              )}
            >
              {replyToName && <p className="mb-1 font-semibold">{replyToName}</p>}
              <p>{replyToContent}</p>
            </div>
            <p className="text-sm">{content}</p>
            <div className="flex items-center justify-between gap-4 text-[11px] opacity-70">
              <span>{message.timestamp}</span>
              {!isTeacher && message.read ? <CheckCheck className="h-3.5 w-3.5 text-sky-500" /> : null}
            </div>
          </div>
        ) : null}

        {message.type === "text" ? (
          <div
            className={cn(
              "rounded-2xl px-4 py-3 text-sm",
              isTeacher ? "bg-[#243B5A] text-white" : "bg-[#F2EFE9] text-slate-800",
            )}
          >
            <p>{content}</p>
            <div className="mt-2 flex items-center justify-between gap-4 text-[11px] opacity-70">
              <span>{message.timestamp}</span>
              {!isTeacher && message.read ? <CheckCheck className="h-3.5 w-3.5 text-sky-500" /> : null}
            </div>
          </div>
        ) : null}

        {message.type === "image" && message.fileUrl ? (
          <div className="space-y-2">
            <div
              className={cn(
                "overflow-hidden rounded-2xl",
                isTeacher ? "bg-[#243B5A]" : "bg-[#F2EFE9]",
              )}
            >
              <a href={message.fileUrl} target="_blank" rel="noreferrer" className="block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={message.fileUrl}
                  alt={fileName ?? content ?? "image"}
                  className="max-h-72 w-full object-cover"
                />
              </a>
              {content ? (
                <p
                  className={cn(
                    "px-4 py-2 text-sm",
                    isTeacher ? "text-white" : "text-slate-800",
                  )}
                >
                  {content}
                </p>
              ) : null}
              <div
                className={cn(
                  "flex items-center justify-between gap-4 px-4 pb-3 text-[11px] opacity-70",
                  isTeacher ? "text-white" : "text-slate-600",
                )}
              >
                <span>{message.timestamp}</span>
                {!isTeacher && message.read ? <CheckCheck className="h-3.5 w-3.5 text-sky-500" /> : null}
              </div>
            </div>
            {message.reactions && message.reactions.length > 0 ? (
              <div className="flex flex-wrap justify-end gap-1">
                {message.reactions.map((reaction) => (
                  <span
                    key={reaction.emoji}
                    className="rounded-full bg-white px-2 py-0.5 text-xs shadow-sm"
                  >
                    {reaction.emoji} {reaction.count}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        {message.type === "file" ? (
          <div className="space-y-2">
            <div
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3",
                isTeacher ? "bg-[#243B5A] text-white" : "bg-[#F2EFE9] text-slate-800",
              )}
            >
              <FileText className="h-8 w-8 shrink-0 text-red-400" />
              <div className="min-w-0 flex-1 text-right">
                <p className="truncate text-sm font-medium">{fileName}</p>
                <p className="text-xs opacity-70">{message.fileSize}</p>
              </div>
              <button
                type="button"
                className="rounded-full p-2 hover:bg-white/10"
                aria-label="Download"
                onClick={() => {
                  if (message.fileUrl) window.open(message.fileUrl, "_blank", "noopener,noreferrer");
                }}
              >
                <Download className="h-4 w-4" />
              </button>
            </div>
            {message.reactions && message.reactions.length > 0 ? (
              <div className="flex flex-wrap justify-end gap-1">
                {message.reactions.map((reaction) => (
                  <span
                    key={reaction.emoji}
                    className="rounded-full bg-white px-2 py-0.5 text-xs shadow-sm"
                  >
                    {reaction.emoji} {reaction.count}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        {message.type === "voice" ? (
          <div
            className={cn(
              "flex items-center gap-3 rounded-2xl px-4 py-3",
              isTeacher ? "bg-[#243B5A] text-white" : "bg-[#F2EFE9] text-slate-800",
            )}
          >
            <button type="button" className="rounded-full bg-white/20 p-2">
              <Play className="h-4 w-4" />
            </button>
            <div className="h-1.5 flex-1 rounded-full bg-white/30">
              <div className="h-full w-1/3 rounded-full bg-current" />
            </div>
            <Mic className="h-4 w-4 opacity-70" />
            <span className="text-xs">{message.voiceDuration}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
