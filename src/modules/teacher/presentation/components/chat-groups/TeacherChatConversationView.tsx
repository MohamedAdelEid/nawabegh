"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowRight, FlaskConical, Mic, MoreVertical, Send, Users, VolumeX } from "lucide-react";
import { useTeacherChatConversation } from "@/modules/teacher/application/hooks/useTeacherChatConversation";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { ChatMessageBubble } from "@/shared/presentation/components/chat";
import { Button } from "@/shared/presentation/components/ui/button";
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";

export function TeacherChatConversationView({ courseId }: { courseId: string }) {
  const t = useTranslations("teacher.dashboard.chatGroups.conversation");
  const router = useRouter();
  const { data, isLoading, isError } = useTeacherChatConversation(courseId);
  const [draft, setDraft] = useState("");

  if (isLoading) {
    return <Skeleton className="h-[80vh] w-full rounded-[2rem]" />;
  }

  if (isError || !data) {
    return <p className="text-sm text-red-600">{t("error")}</p>;
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-[#F8F9FA]">
      <header className="flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-xl" asChild>
            <Link href={ROUTES.USER.TEACHER.CHAT_GROUPS.MEMBERS(courseId)}>
              <Users className="h-5 w-5" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" className="rounded-xl">
            <VolumeX className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl"
            onClick={() => router.push(ROUTES.USER.TEACHER.CHAT_GROUPS.LIST)}
          >
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex items-center gap-3 text-right">
          <div>
            <p className="font-bold text-slate-800">{t(data.titleKey)}</p>
            <p className="flex items-center justify-end gap-2 text-xs text-slate-500">
              {data.isActive ? (
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
              ) : null}
              {t(data.statusKey)} / {t(data.lastSeenKey)}
            </p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
            <FlaskConical className="h-5 w-5" />
          </div>
        </div>

        <Button variant="ghost" size="icon" className="rounded-xl">
          <MoreVertical className="h-5 w-5" />
        </Button>
      </header>

      <div className="flex-1 space-y-6 overflow-y-auto px-4 py-6 md:px-8">
        {data.dateGroups.map((group) => (
          <div key={group.dateKey} className="space-y-5">
            <div className="flex justify-center">
              <span className="rounded-full bg-white px-4 py-1 text-xs text-slate-500 shadow-sm">
                {t(group.dateKey)}
              </span>
            </div>
            <div className="space-y-5">
              {group.messages.map((message) => (
                <ChatMessageBubble
                  key={message.id}
                  message={message}
                  senderName={t(message.sender.nameKey)}
                  content={message.content ? t(message.content) : ""}
                  replyToName={
                    message.replyTo ? t(message.replyTo.senderNameKey) : undefined
                  }
                  replyToContent={
                    message.replyTo ? t(message.replyTo.content) : undefined
                  }
                  fileName={message.fileName ? t(message.fileName) : undefined}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <footer className="border-t border-slate-200 bg-white px-4 py-4 md:px-6">
        <div className="flex items-end gap-3">
          <Button className="h-12 w-12 shrink-0 rounded-full bg-[#243B5A] p-0">
            <Send className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-12 w-12 shrink-0 rounded-full">
            <Mic className="h-5 w-5" />
          </Button>
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={t("inputPlaceholder")}
            rows={1}
            className="min-h-12 flex-1 resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-right text-sm outline-none focus:border-[#243B5A]"
          />
        </div>
      </footer>
    </div>
  );
}
