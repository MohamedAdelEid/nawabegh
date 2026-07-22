"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useParentChatInbox } from "@/modules/parent/application/hooks/useParentChat";
import type {
  ParentInboxItem,
  ParentInboxSelection,
} from "@/modules/parent/domain/types/parentChat.types";
import { ParentConversationList } from "@/modules/parent/presentation/components/chat/ParentConversationList";
import { ParentChatThreadPanel } from "@/modules/parent/presentation/components/chat/ParentChatThreadPanel";
import { ParentNewChatDialog } from "@/modules/parent/presentation/components/chat/ParentNewChatDialog";
import { useAuth } from "@/shared/application/hooks/useAuth";
import { Button } from "@/shared/presentation/components/ui/button";

export function ParentConversationsDashboard() {
  const t = useTranslations("parent.dashboard.conversations");
  const tCommon = useTranslations("parent.dashboard.common");
  const auth = useAuth();
  const {
    items,
    search,
    setSearch,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useParentChatInbox();
  const [selection, setSelection] = useState<ParentInboxSelection | null>(null);
  const [pendingItem, setPendingItem] = useState<ParentInboxItem | null>(null);
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [mobileShowThread, setMobileShowThread] = useState(false);

  const selectedItem = useMemo(() => {
    if (!selection) return null;
    return (
      items.find(
        (item) => item.kind === selection.kind && item.id === selection.id,
      ) ?? pendingItem
    );
  }, [items, selection, pendingItem]);

  const handleSelect = (item: ParentInboxItem) => {
    setPendingItem(null);
    setSelection({ kind: item.kind, id: item.id });
    setMobileShowThread(true);
  };

  if (isError && items.length === 0) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-[20px] border border-red-100 bg-white p-6">
        <p className="text-sm text-red-600">
          {error instanceof Error ? error.message : tCommon("error")}
        </p>
        <Button type="button" onClick={() => void refetch()} disabled={isFetching}>
          {tCommon("retry")}
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="-mx-4 -mb-4 flex h-[calc(100vh-7.5rem)] min-h-[560px] overflow-hidden rounded-none border border-[#e2e8f0] bg-white sm:-mx-6 sm:-mb-6 lg:rounded-2xl">
        <div
          className={
            mobileShowThread && selection
              ? "hidden h-full lg:flex"
              : "flex h-full w-full lg:w-auto"
          }
        >
          <ParentConversationList
            items={items}
            search={search}
            onSearchChange={setSearch}
            selection={selection}
            onSelect={handleSelect}
            avatarUrl={auth.user?.avatar}
            avatarName={auth.user?.name || t("title")}
            isLoading={isLoading}
            onOpenNewChat={() => setNewChatOpen(true)}
          />
        </div>

        <div
          className={
            mobileShowThread && selection
              ? "flex h-full min-w-0 flex-1"
              : "hidden h-full min-w-0 flex-1 lg:flex"
          }
        >
          <ParentChatThreadPanel
            selection={selection}
            inboxItem={selectedItem}
          />
        </div>
      </div>

      {mobileShowThread && selection ? (
        <div className="fixed inset-0 z-40 flex flex-col bg-white lg:hidden">
          <button
            type="button"
            className="border-b border-slate-100 px-4 py-3 text-start text-sm font-medium text-[#2b415e]"
            onClick={() => setMobileShowThread(false)}
          >
            {t("backToList")}
          </button>
          <div className="min-h-0 flex-1">
            <ParentChatThreadPanel
              selection={selection}
              inboxItem={selectedItem}
            />
          </div>
        </div>
      ) : null}

      <ParentNewChatDialog
        open={newChatOpen}
        onClose={() => setNewChatOpen(false)}
        onOpened={(next, preview) => {
          setPendingItem(preview);
          setSelection(next);
          setMobileShowThread(true);
        }}
      />
    </>
  );
}
