"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CornerUpLeft, MoreVertical, Pin, PinOff, Trash2 } from "lucide-react";
import type { TeacherChatMessage } from "@/modules/teacher/domain/types/teacher.types";
import { Button } from "@/shared/presentation/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/presentation/components/ui/popover";
import { cn } from "@/shared/application/lib/cn";

const QUICK_REACTIONS = ["👍", "👏", "🔥"] as const;

type TeacherChatMessageActionsProps = {
  message: TeacherChatMessage;
  disabled?: boolean;
  onReply: (message: TeacherChatMessage) => void;
  onPin: (message: TeacherChatMessage) => void;
  onDelete: (message: TeacherChatMessage) => void;
  onReact: (message: TeacherChatMessage, emoji: string) => void;
};

export function TeacherChatMessageActions({
  message,
  disabled = false,
  onReply,
  onPin,
  onDelete,
  onReact,
}: TeacherChatMessageActionsProps) {
  const t = useTranslations("teacher.dashboard.chatGroups.conversation.actions");
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
      <div className="flex items-center gap-0.5 rounded-full bg-white px-1 py-0.5 shadow-sm">
        {QUICK_REACTIONS.map((emoji) => {
          const reaction = message.reactions?.find((item) => item.emoji === emoji);
          return (
            <button
              key={emoji}
              type="button"
              disabled={disabled}
              onClick={() => onReact(message, emoji)}
              className={cn(
                "rounded-full px-1.5 py-0.5 text-xs transition-colors hover:bg-slate-100",
                reaction?.reactedByCurrentUser && "bg-sky-50 ring-1 ring-sky-200",
              )}
              aria-label={t("react", { emoji })}
            >
              {emoji}
              {reaction && reaction.count > 0 ? (
                <span className="ms-0.5 text-[10px] text-slate-500">{reaction.count}</span>
              ) : null}
            </button>
          );
        })}
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-lg bg-white shadow-sm"
            disabled={disabled}
            aria-label={t("menu")}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-44 space-y-1 p-2">
          <button
            type="button"
            className="flex w-full items-center justify-end gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            onClick={() => {
              onReply(message);
              setOpen(false);
            }}
          >
            {t("reply")}
            <CornerUpLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="flex w-full items-center justify-end gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            onClick={() => {
              onPin(message);
              setOpen(false);
            }}
          >
            {message.isPinned ? t("unpin") : t("pin")}
            {message.isPinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
          </button>
          <button
            type="button"
            className="flex w-full items-center justify-end gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
            onClick={() => {
              onDelete(message);
              setOpen(false);
            }}
          >
            {t("delete")}
            <Trash2 className="h-4 w-4" />
          </button>
        </PopoverContent>
      </Popover>
    </div>
  );
}
