"use client";

import { useState } from "react";
import { Headphones, Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  useParentChatContacts,
  useParentOpenConversation,
} from "@/modules/parent/application/hooks/useParentChat";
import type {
  ParentInboxItem,
  ParentInboxSelection,
} from "@/modules/parent/domain/types/parentChat.types";
import { ParentAvatar } from "@/modules/parent/presentation/components/home/ParentAvatar";
import { notify } from "@/shared/application/lib/toast";
import { Button } from "@/shared/presentation/components/ui/button";
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";

export function ParentNewChatDialog({
  open,
  onClose,
  onOpened,
}: {
  open: boolean;
  onClose: () => void;
  onOpened: (selection: ParentInboxSelection, preview: ParentInboxItem) => void;
}) {
  const t = useTranslations("parent.dashboard.conversations");
  const [search, setSearch] = useState("");
  const { contacts, isLoading, isError, errorMessage } = useParentChatContacts(
    search,
    open,
  );
  const openMutation = useParentOpenConversation();

  if (!open) return null;

  const handleOpen = async (contact: {
    userId: string;
    fullName: string;
    profileImageUrl: string | null;
    subtitle: string | null;
    isSupport: boolean;
  }) => {
    try {
      const result = await openMutation.mutateAsync(contact);
      onOpened(
        { kind: result.kind, id: result.conversationId },
        {
          kind: result.kind,
          id: result.conversationId,
          title: contact.fullName,
          subtitle: contact.subtitle,
          avatarUrl: contact.profileImageUrl,
          lastMessagePreview: null,
          lastMessageAt: null,
          lastMessageAtLabel: "",
          unreadCount: 0,
          otherUserId: contact.isSupport ? null : contact.userId,
        },
      );
      setSearch("");
      onClose();
    } catch (error) {
      notify.error(error instanceof Error ? error.message : t("openChatError"));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="parent-new-chat-title"
        className="flex max-h-[min(90vh,560px)] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-500 hover:bg-slate-100"
            aria-label={t("close")}
          >
            <X className="size-5" />
          </button>
          <h2
            id="parent-new-chat-title"
            className="text-base font-bold text-[#2b415e]"
          >
            {t("newChat")}
          </h2>
        </div>

        <div className="border-b border-slate-100 p-4">
          <div className="relative">
            <Search className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t("contactSearchPlaceholder")}
              className="w-full rounded-xl border border-slate-200 bg-[#f8f9fa] py-2.5 pe-10 ps-4 text-sm outline-none focus:border-[#2b415e]"
              autoFocus
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Skeleton className="h-10 flex-1" />
                  <Skeleton className="size-10 rounded-full" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <p className="p-6 text-center text-sm text-red-600">
              {errorMessage ?? t("contactsError")}
            </p>
          ) : contacts.length === 0 ? (
            <p className="p-6 text-center text-sm text-slate-500">
              {search.trim() ? t("emptyContactsSearch") : t("emptyContacts")}
            </p>
          ) : (
            <ul>
              {contacts.map((contact) => (
                <li key={contact.userId}>
                  <button
                    type="button"
                    disabled={openMutation.isPending}
                    onClick={() =>
                      void handleOpen({
                        userId: contact.userId,
                        fullName: contact.fullName,
                        profileImageUrl: contact.profileImageUrl,
                        subtitle: contact.subtitle,
                        isSupport: contact.isSupport,
                      })
                    }
                    className="flex w-full items-center gap-3 px-5 py-3 text-start transition-colors hover:bg-slate-50 disabled:opacity-50"
                  >
                    <div className="min-w-0 flex-1 text-end">
                      <p className="truncate font-bold text-[#2b415e]" dir="auto">
                        {contact.fullName}
                      </p>
                      {contact.subtitle ? (
                        <p className="truncate text-xs text-[#64748b]">
                          {contact.subtitle}
                        </p>
                      ) : null}
                    </div>
                    {contact.isSupport ? (
                      <span className="flex size-10 items-center justify-center rounded-full bg-[#2b415e] text-white">
                        <Headphones className="size-5" aria-hidden />
                      </span>
                    ) : (
                      <ParentAvatar
                        url={contact.profileImageUrl}
                        name={contact.fullName}
                        className="size-10"
                        roundedClassName="rounded-full"
                      />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-slate-100 p-4">
          <Button
            type="button"
            variant="outline"
            className="w-full rounded-xl"
            onClick={onClose}
          >
            {t("close")}
          </Button>
        </div>
      </div>
    </div>
  );
}
