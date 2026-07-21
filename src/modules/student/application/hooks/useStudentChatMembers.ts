"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { studentChatQueryKeys } from "@/modules/student/application/constants/studentChatQueryKeys";
import type {
  StudentChatGroupSettings,
  StudentChatMembersData,
} from "@/modules/student/domain/chat-groups/student-chat.types";
import {
  fetchStudentChatMembers,
  updateStudentChatMemberPreferences,
} from "@/modules/student/infrastructure/api/studentChat.api";

export function useStudentChatMembers(courseId: string) {
  const locale = useLocale();

  return useQuery({
    queryKey: studentChatQueryKeys.members(courseId, locale),
    queryFn: () => fetchStudentChatMembers(courseId, locale),
    enabled: Boolean(courseId),
  });
}

export function useStudentChatGroupPreferencesMutation(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (partial: Partial<Pick<StudentChatGroupSettings, "muteNotifications" | "pinGroup">>) => {
      const cached = queryClient.getQueriesData<StudentChatMembersData>({
        queryKey: [...studentChatQueryKeys.all, "members", courseId],
      });
      const current = cached.find(([, value]) => value)?.[1];
      if (!current?.settings) {
        throw new Error("Chat settings are not loaded yet");
      }

      const next: StudentChatGroupSettings = { ...current.settings, ...partial };
      await updateStudentChatMemberPreferences(courseId, {
        isMuted: next.muteNotifications,
        isPinnedInList: next.pinGroup,
      });
      return next;
    },
    onSuccess: (nextSettings) => {
      queryClient.setQueriesData<StudentChatMembersData>(
        { queryKey: [...studentChatQueryKeys.all, "members", courseId] },
        (previous) => (previous ? { ...previous, settings: nextSettings } : previous),
      );
      void queryClient.invalidateQueries({ queryKey: studentChatQueryKeys.all });
    },
  });
}
