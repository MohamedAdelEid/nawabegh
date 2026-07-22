"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useLocale } from "next-intl";
import { parentChatQueryKeys } from "@/modules/parent/application/constants/parentChatQueryKeys";
import type {
  ParentInboxItem,
  ParentInboxSelection,
  SendParentChatPayload,
} from "@/modules/parent/domain/types/parentChat.types";
import {
  fetchParentChatInbox,
  fetchParentCourseThread,
  fetchParentDirectThread,
  fetchParentSuggestedContacts,
  markParentDirectConversationRead,
  openParentDirectConversation,
  openParentSupportConversation,
  searchParentChatContacts,
  sendParentCourseMessage,
  sendParentDirectMessage,
} from "@/modules/parent/infrastructure/api/parentChatApi";
import { useAuth } from "@/shared/application/hooks/useAuth";

function useDebouncedValue(value: string, delayMs: number) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}

export function useParentChatInbox() {
  const auth = useAuth();
  const locale = useLocale();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const enabled = auth.user?.role?.toLowerCase() === "parent";

  const query = useQuery({
    queryKey: parentChatQueryKeys.inbox(debouncedSearch),
    queryFn: () => fetchParentChatInbox(locale, debouncedSearch),
    enabled,
  });

  return {
    ...query,
    search,
    setSearch,
    items: query.data ?? [],
  };
}

export function useParentChatThread(
  selection: ParentInboxSelection | null,
  inboxItem: ParentInboxItem | null,
) {
  const locale = useLocale();
  const { data: session } = useSession();
  const currentUserId = session?.user?.id ?? null;
  const auth = useAuth();
  const enabled =
    auth.user?.role?.toLowerCase() === "parent" && Boolean(selection?.id);

  return useQuery({
    queryKey: parentChatQueryKeys.thread(
      selection?.kind ?? "none",
      selection?.id ?? "",
    ),
    queryFn: async () => {
      if (!selection) throw new Error("No conversation selected");
      if (selection.kind === "course") {
        return fetchParentCourseThread(
          selection.id,
          currentUserId,
          locale,
          inboxItem,
        );
      }
      return fetchParentDirectThread(
        selection.id,
        currentUserId,
        locale,
        inboxItem,
      );
    },
    enabled,
  });
}

export function useParentChatMarkRead(selection: ParentInboxSelection | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!selection || selection.kind === "course") return;
      await markParentDirectConversationRead(selection.id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: parentChatQueryKeys.all });
    },
  });
}

export function useParentChatSendMessage(selection: ParentInboxSelection | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: SendParentChatPayload) => {
      if (!selection) throw new Error("No conversation selected");
      if (selection.kind === "course") {
        await sendParentCourseMessage(selection.id, payload);
        return;
      }
      await sendParentDirectMessage(selection.id, payload);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: parentChatQueryKeys.all });
    },
  });
}

export function useParentChatContacts(search: string, open: boolean) {
  const locale = useLocale();
  const auth = useAuth();
  const debouncedSearch = useDebouncedValue(search, 300);
  const enabled = open && auth.user?.role?.toLowerCase() === "parent";
  const trimmed = debouncedSearch.trim();

  const suggestedQuery = useQuery({
    queryKey: parentChatQueryKeys.contactsSuggested(),
    queryFn: () => fetchParentSuggestedContacts(locale),
    enabled: enabled && !trimmed,
  });

  const searchQuery = useQuery({
    queryKey: parentChatQueryKeys.contactsSearch(trimmed),
    queryFn: () => searchParentChatContacts(trimmed, locale),
    enabled: enabled && Boolean(trimmed),
  });

  const contacts = useMemo(() => {
    if (trimmed) return searchQuery.data ?? [];
    return suggestedQuery.data ?? [];
  }, [trimmed, searchQuery.data, suggestedQuery.data]);

  return {
    contacts,
    isLoading: trimmed ? searchQuery.isLoading : suggestedQuery.isLoading,
    isError: trimmed ? searchQuery.isError : suggestedQuery.isError,
    errorMessage: trimmed
      ? searchQuery.error instanceof Error
        ? searchQuery.error.message
        : null
      : suggestedQuery.error instanceof Error
        ? suggestedQuery.error.message
        : null,
  };
}

export function useParentOpenConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contact: { userId: string; isSupport: boolean }) => {
      if (contact.isSupport) {
        const result = await openParentSupportConversation();
        return { ...result, kind: "support" as const };
      }
      const result = await openParentDirectConversation(contact.userId);
      return { ...result, kind: "direct" as const };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: parentChatQueryKeys.all });
    },
  });
}
