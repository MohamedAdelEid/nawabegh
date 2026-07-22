"use client";

import { useEffect, useRef, useState } from "react";
import {
  Info,
  Lock,
  Paperclip,
  Phone,
  Send,
  Smile,
  Video,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { uploadAdminFile } from "@/modules/admin/infrastructure/api/fileUploadApi";
import {
  useParentChatMarkRead,
  useParentChatSendMessage,
  useParentChatThread,
} from "@/modules/parent/application/hooks/useParentChat";
import { resolveAttachmentType } from "@/modules/parent/application/lib/parentChat.utils";
import type {
  ParentInboxItem,
  ParentInboxSelection,
} from "@/modules/parent/domain/types/parentChat.types";
import { ParentAvatar } from "@/modules/parent/presentation/components/home/ParentAvatar";
import { ParentChatMessageBubble } from "@/modules/parent/presentation/components/chat/ParentChatMessageBubble";
import { notify } from "@/shared/application/lib/toast";
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";

const CHAT_UPLOAD_FOLDER = "chat";

export function ParentChatThreadPanel({
  selection,
  inboxItem,
}: {
  selection: ParentInboxSelection | null;
  inboxItem: ParentInboxItem | null;
}) {
  const t = useTranslations("parent.dashboard.conversations");
  const { data, isLoading, isError, error } = useParentChatThread(
    selection,
    inboxItem,
  );
  const sendMutation = useParentChatSendMessage(selection);
  const markReadMutation = useParentChatMarkRead(selection);
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraft("");
  }, [selection?.id, selection?.kind]);

  useEffect(() => {
    if (!selection || selection.kind === "course") return;
    void markReadMutation.mutateAsync().catch(() => undefined);
    // Only re-mark when the opened direct/support thread changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selection?.id, selection?.kind]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data?.dateGroups]);

  if (!selection) {
    return (
      <div className="flex h-full flex-1 flex-col items-center justify-center bg-[#fdfdfd] px-6 text-center">
        <p className="text-base font-medium text-[#2b415e]">{t("selectPromptTitle")}</p>
        <p className="mt-2 text-sm text-[#64748b]">{t("selectPrompt")}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-full flex-1 flex-col bg-[#fdfdfd]">
        <div className="flex h-16 items-center justify-between border-b border-[#e2e8f0] bg-[#f8f9fa] px-6">
          <Skeleton className="h-8 w-28" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="size-10 rounded-full" />
          </div>
        </div>
        <div className="flex-1 space-y-4 p-6">
          <Skeleton className="mx-auto h-6 w-16 rounded-lg" />
          <Skeleton className="ms-auto h-20 w-2/3 rounded-2xl" />
          <Skeleton className="me-auto h-16 w-1/2 rounded-2xl" />
          <Skeleton className="ms-auto h-24 w-3/5 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex h-full flex-1 items-center justify-center bg-[#fdfdfd] px-6 text-center">
        <p className="text-sm text-red-600">
          {error instanceof Error ? error.message : t("threadError")}
        </p>
      </div>
    );
  }

  const canCompose = data.canCompose && !sendMutation.isPending;

  const handleSend = async () => {
    const content = draft.trim();
    if (!content || !canCompose) return;
    try {
      await sendMutation.mutateAsync({ content });
      setDraft("");
    } catch (sendError) {
      notify.error(
        sendError instanceof Error ? sendError.message : t("sendError"),
      );
    }
  };

  const handleAttach = async (file: File) => {
    if (!data.allowAttachments || !canCompose) return;
    try {
      const upload = await uploadAdminFile(file, CHAT_UPLOAD_FOLDER);
      if (!upload.ok) {
        notify.error(upload.errorMessage);
        return;
      }
      await sendMutation.mutateAsync({
        content: draft.trim() || undefined,
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
    } catch (sendError) {
      notify.error(
        sendError instanceof Error ? sendError.message : t("sendError"),
      );
    }
  };

  return (
    <section className="relative flex h-full min-w-0 flex-1 flex-col bg-[#f6f7f7]">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#e2e8f0] bg-[#f8f9fa] px-6 shadow-sm">
        <div className="flex items-center gap-1 text-[#64748b]">
          <button
            type="button"
            className="rounded-full p-2 hover:bg-slate-200/60"
            aria-label={t("actions.info")}
          >
            <Info className="size-5" />
          </button>
          <span className="mx-1 h-6 w-px bg-[#e2e8f0]" aria-hidden />
          <button
            type="button"
            className="rounded-full p-2 hover:bg-slate-200/60"
            aria-label={t("actions.call")}
          >
            <Phone className="size-[18px]" />
          </button>
          <button
            type="button"
            className="rounded-full p-2 hover:bg-slate-200/60"
            aria-label={t("actions.video")}
          >
            <Video className="size-5" />
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-end">
            <h3 className="text-sm font-bold text-[#2b415e]" dir="auto">
              {data.title}
            </h3>
            {data.subtitle ? (
              <p className="text-[11px] text-[#64748b]" dir="auto">
                {data.subtitle}
              </p>
            ) : null}
          </div>
          <div className="relative">
            <ParentAvatar
              url={data.avatarUrl}
              name={data.title}
              className="size-10"
              roundedClassName="rounded-full"
            />
          </div>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto bg-[#fdfdfd] p-6">
        {!data.canCompose ? (
          <div className="mb-4 flex items-center justify-center gap-2 rounded-xl border border-amber-100 bg-amber-50 px-4 py-2 text-sm text-amber-800">
            <Lock className="size-4 shrink-0" aria-hidden />
            {t("locked")}
          </div>
        ) : null}

        <div className="space-y-4">
          {data.dateGroups.map((group) => (
            <div key={group.label} className="space-y-4">
              <div className="flex justify-center">
                <span className="rounded-lg bg-white/80 px-3 py-1 text-[10px] font-bold uppercase text-[#64748b] shadow-sm backdrop-blur-[2px]">
                  {group.label}
                </span>
              </div>
              {group.messages.map((message) => (
                <ParentChatMessageBubble key={message.id} message={message} />
              ))}
            </div>
          ))}
          {data.dateGroups.length === 0 ? (
            <p className="py-16 text-center text-sm text-slate-500">
              {t("noMessages")}
            </p>
          ) : null}
          <div ref={bottomRef} />
        </div>
      </div>

      <footer className="flex shrink-0 items-center gap-3 border-t border-[#e2e8f0] bg-[#f8f9fa] px-4 py-3">
        <button
          type="button"
          disabled={!canCompose || !draft.trim()}
          onClick={() => void handleSend()}
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#2b415e] text-white shadow-md transition-opacity disabled:opacity-40"
          aria-label={t("send")}
        >
          <Send className="size-4 rtl:-scale-x-100" aria-hidden />
        </button>

        <div className="relative min-w-0 flex-1">
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void handleSend();
              }
            }}
            disabled={!data.canCompose}
            placeholder={t("composerPlaceholder")}
            className="w-full rounded-xl bg-white px-4 py-3 text-sm text-slate-800 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] outline-none placeholder:text-[rgba(100,116,139,0.5)] disabled:opacity-60"
          />
        </div>

        <div className="flex items-center gap-1 text-[#64748b]">
          <button
            type="button"
            className="rounded-full p-2 hover:bg-slate-200/60"
            aria-label={t("actions.emoji")}
            disabled
          >
            <Smile className="size-5" />
          </button>
          <button
            type="button"
            disabled={!data.canCompose || !data.allowAttachments || sendMutation.isPending}
            onClick={() => fileInputRef.current?.click()}
            className="rounded-full p-2 hover:bg-slate-200/60 disabled:opacity-40"
            aria-label={t("actions.attach")}
          >
            <Paperclip className="size-5" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (file) void handleAttach(file);
            }}
          />
        </div>
      </footer>
    </section>
  );
}
