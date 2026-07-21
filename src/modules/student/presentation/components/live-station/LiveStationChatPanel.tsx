"use client";

import { FormEvent, useState } from "react";
import { Send } from "lucide-react";
import { useTranslations } from "next-intl";
import type { LiveChatMessageDto } from "@/modules/student/domain/live-station/live-station.types";
import { isTeacherRole } from "@/modules/student/domain/live-station/live-station.utils";
import { cn } from "@/shared/application/lib/cn";

type LiveStationChatPanelProps = {
  messages: LiveChatMessageDto[];
  onSend: (body: string) => Promise<void>;
  disabled?: boolean;
};

export function LiveStationChatPanel({
  messages,
  onSend,
  disabled,
}: LiveStationChatPanelProps) {
  const t = useTranslations("student.dashboard.liveStation");
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!draft.trim() || sending || disabled) return;
    setSending(true);
    try {
      await onSend(draft);
      setDraft("");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">{t("chat.empty")}</p>
        ) : (
          messages.map((message) => {
            if (message.isSystemEvent) {
              return (
                <p
                  key={message.id}
                  className="px-2 text-center text-xs text-slate-400"
                >
                  {message.body}
                </p>
              );
            }

            const teacher = isTeacherRole(message.senderRole);
            return (
              <div
                key={message.id}
                className={cn(
                  "flex flex-col gap-1",
                  teacher ? "items-start" : "items-end",
                )}
              >
                <p className="text-[11px] font-semibold text-slate-500">
                  {message.senderName}
                </p>
                <div
                  className={cn(
                    "max-w-[90%] rounded-2xl px-3 py-2 text-sm leading-relaxed",
                    teacher
                      ? "rounded-ss-md bg-[#2c4260] text-white"
                      : "rounded-se-md bg-slate-100 text-slate-800",
                  )}
                >
                  {message.body}
                </div>
              </div>
            );
          })
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 border-t border-slate-100 px-3 py-3"
      >
        <button
          type="submit"
          disabled={sending || disabled || !draft.trim()}
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#2c4260] text-white disabled:opacity-50"
          aria-label={t("chat.send")}
        >
          <Send className="size-4" />
        </button>
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          disabled={disabled || sending}
          placeholder={t("chat.placeholder")}
          className="h-11 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-800 outline-none focus:border-[#2c4260]/40"
        />
      </form>
    </div>
  );
}
