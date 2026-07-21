"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { studentChatQueryKeys } from "@/modules/student/application/constants/studentChatQueryKeys";
import type { StudentChatConversationData } from "@/modules/student/domain/chat-groups/student-chat.types";
import {
  fetchStudentChatConversation,
  sendStudentChatMessage,
  toggleStudentChatReaction,
  updateStudentChatMemberPreferences,
  type SendChatMessagePayload,
} from "@/modules/student/infrastructure/api/studentChat.api";

function invalidateStudentChat(
  queryClient: ReturnType<typeof useQueryClient>,
  courseId: string,
) {
  void queryClient.invalidateQueries({ queryKey: studentChatQueryKeys.all });
  void queryClient.invalidateQueries({
    queryKey: [...studentChatQueryKeys.all, "conversation", courseId],
  });
  void queryClient.invalidateQueries({
    queryKey: [...studentChatQueryKeys.all, "members", courseId],
  });
}

export function useStudentChatConversation(courseId: string) {
  const locale = useLocale();

  return useQuery({
    queryKey: studentChatQueryKeys.conversation(courseId, locale),
    queryFn: () => fetchStudentChatConversation(courseId, locale),
    enabled: Boolean(courseId),
  });
}

export function useStudentChatSendMessage(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SendChatMessagePayload) => sendStudentChatMessage(courseId, payload),
    onSuccess: () => invalidateStudentChat(queryClient, courseId),
  });
}

export function useStudentChatMessageActions(courseId: string) {
  const queryClient = useQueryClient();

  const reactionMutation = useMutation({
    mutationFn: ({
      messageId,
      emoji,
      reactions,
    }: {
      messageId: string;
      emoji: string;
      reactions: Array<{ emoji: string; reactedByCurrentUser?: boolean }>;
    }) => toggleStudentChatReaction(messageId, emoji, reactions),
    onSuccess: (updatedReactions, { messageId }) => {
      queryClient.setQueriesData<StudentChatConversationData>(
        { queryKey: [...studentChatQueryKeys.all, "conversation", courseId] },
        (previous) => {
          if (!previous) return previous;
          return {
            ...previous,
            dateGroups: previous.dateGroups.map((group) => ({
              ...group,
              messages: group.messages.map((message) =>
                message.id === messageId
                  ? { ...message, reactions: updatedReactions }
                  : message,
              ),
            })),
          };
        },
      );
    },
  });

  return { reactionMutation };
}

export function useStudentChatMute(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ isMuted, isPinnedInList }: { isMuted: boolean; isPinnedInList: boolean }) =>
      updateStudentChatMemberPreferences(courseId, { isMuted, isPinnedInList }),
    onSuccess: (_result, variables) => {
      queryClient.setQueriesData<StudentChatConversationData>(
        { queryKey: [...studentChatQueryKeys.all, "conversation", courseId] },
        (previous) =>
          previous
            ? {
                ...previous,
                isMuted: variables.isMuted,
                isPinnedInList: variables.isPinnedInList,
              }
            : previous,
      );
      invalidateStudentChat(queryClient, courseId);
    },
  });
}
