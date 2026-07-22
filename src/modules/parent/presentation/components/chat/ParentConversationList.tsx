"use client";

import { MessageSquarePlus, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ParentInboxItem, ParentInboxSelection } from "@/modules/parent/domain/types/parentChat.types";
import { ParentAvatar } from "@/modules/parent/presentation/components/home/ParentAvatar";
import { cn } from "@/shared/application/lib/cn";
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";

function ConversationRow({
  item,
  selected,
  onSelect,
}: {
  item: ParentInboxItem;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full items-center gap-3 border-b border-[rgba(226,232,240,0.3)] px-4 py-4 text-start transition-colors",
        selected ? "bg-[rgba(219,227,243,0.3)]" : "bg-white hover:bg-slate-50",
      )}
    >
      <div className="min-w-0 flex-1 space-y-0.5">
        <div className="flex items-center justify-between gap-2">
          <span className="shrink-0 text-[10px] text-[#64748b]">
            {item.lastMessageAtLabel}
          </span>
          <h3
            className={cn(
              "truncate text-base font-bold",
              selected ? "text-[#2b415e]" : "text-[#0f172a]",
            )}
            dir="auto"
          >
            {item.title}
          </h3>
        </div>
        <div className="flex items-center justify-between gap-2">
          {item.unreadCount > 0 ? (
            <span className="inline-flex min-w-[18px] items-center justify-center rounded-full bg-[#c7af6d] px-1.5 py-0.5 text-[10px] font-bold text-white">
              {item.unreadCount}
            </span>
          ) : (
            <span className="size-[18px] shrink-0" />
          )}
          <p className="min-w-0 flex-1 truncate text-end text-xs text-[#64748b]" dir="auto">
            {item.lastMessagePreview || item.subtitle || "—"}
          </p>
        </div>
      </div>
      <div className="relative shrink-0">
        <ParentAvatar
          url={item.avatarUrl}
          name={item.title}
          className="size-12"
          roundedClassName="rounded-full"
        />
        {item.isOnline ? (
          <span className="absolute bottom-0 start-0 size-3 rounded-full border-2 border-white bg-[#58cc02]" />
        ) : null}
      </div>
    </button>
  );
}

export function ParentConversationList({
  items,
  search,
  onSearchChange,
  selection,
  onSelect,
  avatarUrl,
  avatarName,
  isLoading,
  onOpenNewChat,
}: {
  items: ParentInboxItem[];
  search: string;
  onSearchChange: (value: string) => void;
  selection: ParentInboxSelection | null;
  onSelect: (item: ParentInboxItem) => void;
  avatarUrl?: string | null;
  avatarName: string;
  isLoading: boolean;
  onOpenNewChat: () => void;
}) {
  const t = useTranslations("parent.dashboard.conversations");

  return (
    <aside className="flex h-full w-full flex-col border-e border-[#e2e8f0] bg-white lg:w-[349px] lg:shrink-0">
      <div className="flex h-16 items-center justify-between border-b border-[#e2e8f0] bg-[#f8f9fa] px-4">
        <button
          type="button"
          onClick={onOpenNewChat}
          className="rounded-full p-2 text-[#2b415e] transition-colors hover:bg-slate-200/60"
          aria-label={t("newChat")}
          title={t("newChat")}
        >
          <MessageSquarePlus className="size-5" aria-hidden />
        </button>
        <div className="flex items-center gap-3">
          <h2 className="text-base font-bold text-[#2b415e]">{t("title")}</h2>
          <ParentAvatar
            url={avatarUrl}
            name={avatarName}
            className="size-10"
            roundedClassName="rounded-full"
          />
        </div>
      </div>

      <div className="p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute end-3 top-1/2 size-[15px] -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={t("searchPlaceholder")}
            className="w-full rounded-lg bg-[#f8f9fa] py-2 pe-10 ps-4 text-sm text-slate-700 outline-none placeholder:text-[rgba(100,116,139,0.5)] focus:ring-1 focus:ring-[#2b415e]/30"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-1 p-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center gap-3 px-1 py-3">
                <Skeleton className="h-12 flex-1 rounded-xl" />
                <Skeleton className="size-12 rounded-full" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-slate-500">
            {search.trim() ? t("emptySearch") : t("empty")}
          </p>
        ) : (
          items.map((item) => (
            <ConversationRow
              key={`${item.kind}:${item.id}`}
              item={item}
              selected={
                selection?.kind === item.kind && selection.id === item.id
              }
              onSelect={() => onSelect(item)}
            />
          ))
        )}
      </div>
    </aside>
  );
}
