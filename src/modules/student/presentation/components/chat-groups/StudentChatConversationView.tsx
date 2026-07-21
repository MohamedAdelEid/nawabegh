"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  ArrowRight,
  FileText,
  FlaskConical,
  ImagePlus,
  Lock,
  Mic,
  MoreVertical,
  Pin,
  Send,
  Users,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { uploadAdminFile } from "@/modules/admin/infrastructure/api/fileUploadApi";
import {
  useStudentChatConversation,
  useStudentChatMessageActions,
  useStudentChatMute,
  useStudentChatSendMessage,
} from "@/modules/student/application/hooks/useStudentChatConversation";
import type { StudentChatMessage } from "@/modules/student/domain/chat-groups/student-chat.types";
import { StudentChatMessageActions } from "@/modules/student/presentation/components/chat-groups/StudentChatMessageActions";
import { StudentChatConversationSkeleton } from "@/modules/student/presentation/components/chat-groups/StudentChatSkeletons";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { notify } from "@/shared/application/lib/toast";
import { ChatMessageBubble } from "@/shared/presentation/components/chat";
import { Button } from "@/shared/presentation/components/ui/button";
import { cn } from "@/shared/application/lib/cn";
import {
  formatVoiceDuration,
  useVoiceRecorder,
} from "@/shared/application/hooks/useVoiceRecorder";

const CHAT_UPLOAD_FOLDER = "chat";

function resolveAttachmentType(file: File): number {
  if (file.type.startsWith("image/")) return 1;
  if (file.type.includes("pdf") || file.name.toLowerCase().endsWith(".pdf")) return 2;
  if (/\.pptx?$/i.test(file.name)) return 3;
  if (file.type.startsWith("audio/")) return 4;
  return 2;
}

function voiceBlobToFile(blob: Blob): File {
  const extension = blob.type.includes("mp4")
    ? "m4a"
    : blob.type.includes("ogg")
      ? "ogg"
      : "webm";
  return new File([blob], `voice-${Date.now()}.${extension}`, {
    type: blob.type || "audio/webm",
  });
}

export function StudentChatConversationView({ courseId }: { courseId: string }) {
  const t = useTranslations("student.dashboard.chatGroups.conversation");
  const tList = useTranslations("student.dashboard.chatGroups");
  const router = useRouter();
  const { data, isLoading, isError } = useStudentChatConversation(courseId);
  const sendMutation = useStudentChatSendMessage(courseId);
  const { reactionMutation } = useStudentChatMessageActions(courseId);
  const muteMutation = useStudentChatMute(courseId);
  const [draft, setDraft] = useState("");
  const [replyTo, setReplyTo] = useState<StudentChatMessage | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const voiceRecorder = useVoiceRecorder();
  const {
    isRecording: isVoiceRecording,
    duration: voiceDuration,
    error: voiceRecorderError,
    start: startVoiceRecord,
    stop: stopVoiceRecord,
    cancel: cancelVoiceRecord,
    reset: resetVoiceRecorder,
  } = voiceRecorder;

  const canCompose = Boolean(data && !data.isLocked && !data.isTeachersOnly);
  const isBusy =
    sendMutation.isPending ||
    reactionMutation.isPending ||
    muteMutation.isPending ||
    isVoiceRecording;

  const handleSend = async () => {
    const content = draft.trim();
    if (!content || !canCompose || sendMutation.isPending) return;

    try {
      await sendMutation.mutateAsync({
        content,
        replyToMessageId: replyTo?.id ?? null,
      });
      setDraft("");
      setReplyTo(null);
    } catch (error) {
      notify.error(error instanceof Error ? error.message : t("sendError"));
    }
  };

  useEffect(() => {
    if (!voiceRecorderError) return;
    if (voiceRecorderError === "permission_denied") {
      notify.error(t("attachments.recordPermissionError"));
    } else {
      notify.error(t("attachments.recordUnsupported"));
    }
    resetVoiceRecorder();
  }, [voiceRecorderError, resetVoiceRecorder, t]);

  const handleAttachmentUpload = async (file: File) => {
    if (!canCompose) return;
    try {
      const upload = await uploadAdminFile(file, CHAT_UPLOAD_FOLDER);
      if (!upload.ok) {
        notify.error(upload.errorMessage);
        return;
      }

      await sendMutation.mutateAsync({
        content: draft.trim() || undefined,
        replyToMessageId: replyTo?.id ?? null,
        attachments: [
          {
            attachmentType: resolveAttachmentType(file),
            url: upload.filePath,
            fileName: file.name,
            mimeType: file.type || "application/octet-stream",
            sizeInBytes: file.size,
          },
        ],
      });
      setDraft("");
      setReplyTo(null);
    } catch (error) {
      notify.error(error instanceof Error ? error.message : t("sendError"));
    }
  };

  const handleStartVoiceRecord = () => {
    if (!canCompose || isBusy || isVoiceRecording) return;
    void startVoiceRecord();
  };

  const handleSendVoiceRecord = async () => {
    if (!isVoiceRecording || sendMutation.isPending) return;
    try {
      const blob = await stopVoiceRecord();
      if (!blob) return;
      await handleAttachmentUpload(voiceBlobToFile(blob));
    } catch (error) {
      notify.error(error instanceof Error ? error.message : t("sendError"));
    }
  };

  const handleToggleMute = async () => {
    if (!data) return;
    try {
      await muteMutation.mutateAsync({
        isMuted: !data.isMuted,
        isPinnedInList: data.isPinnedInList,
      });
    } catch (error) {
      notify.error(error instanceof Error ? error.message : t("muteError"));
    }
  };

  const handleReact = async (message: StudentChatMessage, emoji: string) => {
    try {
      await reactionMutation.mutateAsync({
        messageId: message.id,
        emoji,
        reactions: message.reactions ?? [],
      });
    } catch (error) {
      notify.error(error instanceof Error ? error.message : t("actions.reactionError"));
    }
  };

  if (isLoading) {
    return <StudentChatConversationSkeleton label={tList("loading")} />;
  }

  if (isError || !data) {
    return <p className="text-sm text-red-600">{t("error")}</p>;
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-[#F8F9FA]">
      <header className="flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 rounded-xl text-slate-600"
            asChild
          >
            <Link href={ROUTES.USER.STUDENT.CHAT_GROUPS.MEMBERS(courseId)}>
              <Users className="h-4 w-4" />
              {t("members")}
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn("gap-2 rounded-xl", data.isMuted && "text-red-500")}
            disabled={isBusy}
            onClick={() => void handleToggleMute()}
          >
            {data.isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            {data.isMuted ? t("unmute") : t("mute")}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl"
            asChild
            aria-label={t("more")}
          >
            <Link href={ROUTES.USER.STUDENT.CHAT_GROUPS.MEMBERS(courseId)}>
              <MoreVertical className="h-5 w-5" />
            </Link>
          </Button>
        </div>

        <div className="flex items-center gap-3 text-right">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl"
            onClick={() => router.push(ROUTES.USER.STUDENT.CHAT_GROUPS.LIST)}
          >
            <ArrowRight className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center justify-end gap-2">
              <p className="font-bold text-slate-800">{data.title}</p>
              {data.isLocked ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600">
                  <Lock className="h-3 w-3" />
                  {t("locked")}
                </span>
              ) : null}
            </div>
            <p className="text-xs text-slate-500">{data.subjectName}</p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
            <FlaskConical className="h-5 w-5" />
          </div>
        </div>
      </header>

      {(data.isLocked || data.isTeachersOnly) && (
        <div className="border-b border-amber-100 bg-amber-50 px-4 py-2 text-center text-sm text-amber-800">
          {data.isLocked ? t("locked") : t("teachersOnly")}
        </div>
      )}

      <div className="flex-1 space-y-6 overflow-y-auto px-4 py-6 md:px-8">
        {data.dateGroups.length === 0 ? (
          <p className="text-center text-sm text-slate-500">{t("empty")}</p>
        ) : (
          data.dateGroups.map((group) => (
            <div key={group.dateLabel} className="space-y-5">
              <div className="flex justify-center">
                <span className="rounded-full bg-white px-4 py-1 text-xs text-slate-500 shadow-sm">
                  {group.dateLabel}
                </span>
              </div>
              <div className="space-y-5">
                {group.messages.map((message) => (
                  <div key={message.id} className="group relative space-y-1">
                    {message.isPinned ? (
                      <div className="flex justify-end">
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                          <Pin className="h-3 w-3" />
                          {t("actions.pinnedLabel")}
                        </span>
                      </div>
                    ) : null}
                    <div
                      className={cn(
                        "flex items-start gap-2",
                        message.sender.role === "teacher" ? "flex-row-reverse" : "flex-row",
                      )}
                    >
                      <div className="min-w-0 flex-1">
                        <ChatMessageBubble
                          message={message}
                          senderName={
                            message.sender.role === "teacher"
                              ? `${message.sender.name}`
                              : message.sender.name
                          }
                          content={message.content ?? ""}
                          replyToName={message.replyTo?.senderName}
                          replyToContent={message.replyTo?.content}
                          fileName={message.fileName}
                          onReact={(emoji) => void handleReact(message, emoji)}
                        />
                      </div>
                      <div className="shrink-0 self-center">
                        <StudentChatMessageActions
                          message={message}
                          disabled={isBusy}
                          onReply={setReplyTo}
                          onReact={(target, emoji) => void handleReact(target, emoji)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <footer className="border-t border-slate-200 bg-white px-4 py-4 md:px-6">
        {replyTo ? (
          <div className="mb-3 flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-right">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setReplyTo(null)}
            >
              <X className="h-4 w-4" />
            </Button>
            <div className="min-w-0 flex-1 pe-2">
              <p className="text-xs font-medium text-[#243B5A]">
                {t("actions.replyingTo", { name: replyTo.sender.name })}
              </p>
              <p className="truncate text-xs text-slate-500">
                {replyTo.content ?? replyTo.fileName}
              </p>
            </div>
          </div>
        ) : null}

        {!canCompose ? (
          <p className="rounded-2xl bg-slate-100 px-4 py-3 text-center text-sm text-slate-500">
            {data.isLocked ? t("locked") : t("teachersOnly")}
          </p>
        ) : (
          <div className="flex items-end gap-3">
            {isVoiceRecording ? (
              <>
                <Button
                  type="button"
                  className="h-12 w-12 shrink-0 rounded-full bg-[#243B5A] p-0"
                  disabled={sendMutation.isPending}
                  onClick={() => void handleSendVoiceRecord()}
                  aria-label={t("attachments.recordSend")}
                >
                  <Send className="h-5 w-5" />
                </Button>
                <div className="flex min-h-12 flex-1 items-center justify-end gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
                  <span className="text-sm font-medium text-red-700">
                    {formatVoiceDuration(voiceDuration)}
                  </span>
                  <span className="text-sm text-red-600">{t("attachments.recording")}</span>
                  <span className="relative flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-12 w-12 shrink-0 rounded-full"
                  onClick={cancelVoiceRecord}
                  aria-label={t("attachments.recordCancel")}
                >
                  <X className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  className="h-12 w-12 shrink-0 rounded-full bg-[#243B5A] p-0"
                  disabled={!draft.trim() || sendMutation.isPending}
                  onClick={() => void handleSend()}
                >
                  <Send className="h-5 w-5" />
                </Button>

                {data.allowImages ? (
                  <>
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) void handleAttachmentUpload(file);
                        event.target.value = "";
                      }}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-12 w-12 shrink-0 rounded-full"
                      disabled={isBusy}
                      onClick={() => imageInputRef.current?.click()}
                      aria-label={t("attachments.image")}
                    >
                      <ImagePlus className="h-5 w-5" />
                    </Button>
                  </>
                ) : null}

                {data.allowDocuments ? (
                  <>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.ppt,.pptx,.doc,.docx,application/pdf"
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) void handleAttachmentUpload(file);
                        event.target.value = "";
                      }}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-12 w-12 shrink-0 rounded-full"
                      disabled={isBusy}
                      onClick={handleStartVoiceRecord}
                      aria-label={t("attachments.voice")}
                    >
                      <Mic className="h-5 w-5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-12 w-12 shrink-0 rounded-full"
                      disabled={isBusy}
                      onClick={() => fileInputRef.current?.click()}
                      aria-label={t("attachments.file")}
                    >
                      <FileText className="h-5 w-5" />
                    </Button>
                  </>
                ) : (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-12 w-12 shrink-0 rounded-full"
                    disabled={isBusy}
                    onClick={handleStartVoiceRecord}
                    aria-label={t("attachments.voice")}
                  >
                    <Mic className="h-5 w-5" />
                  </Button>
                )}

                <textarea
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      void handleSend();
                    }
                  }}
                  placeholder={t("inputPlaceholder")}
                  rows={1}
                  className={cn(
                    "min-h-12 flex-1 resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-right text-sm outline-none focus:border-[#243B5A]",
                    sendMutation.isPending && "opacity-70",
                  )}
                />
              </>
            )}
          </div>
        )}
      </footer>
    </div>
  );
}
