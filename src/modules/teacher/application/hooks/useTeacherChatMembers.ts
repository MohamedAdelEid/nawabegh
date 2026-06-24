import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { teacherApi } from "@/modules/teacher/infrastructure/api/teacherApi";
import type {
  TeacherChatGroupSettings,
  TeacherChatMembersData,
} from "@/modules/teacher/domain/types/teacher.types";

export function useTeacherChatMembers(courseId: string) {
  const locale = useLocale();

  return useQuery({
    queryKey: ["teacher", "chat", courseId, "members", locale],
    queryFn: () => teacherApi.getChatMembers(courseId, locale),
    enabled: Boolean(courseId),
  });
}

export function useTeacherChatGroupSettingsMutation(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: Partial<TeacherChatGroupSettings>) => {
      const cached = queryClient.getQueriesData<TeacherChatMembersData>({
        queryKey: ["teacher", "chat", courseId, "members"],
      });
      const current = cached.find(([, value]) => value)?.[1];

      if (!current?.settings) {
        throw new Error("Chat settings are not loaded yet");
      }

      return teacherApi.updateChatGroupSettings(courseId, settings, current.settings);
    },
    onSuccess: (nextSettings) => {
      queryClient.setQueryData<TeacherChatMembersData>(
        ["teacher", "chat", courseId, "members"],
        (previous) => (previous ? { ...previous, settings: nextSettings } : previous),
      );
      void queryClient.invalidateQueries({ queryKey: ["teacher", "chat", courseId, "members"] });
      void queryClient.invalidateQueries({ queryKey: ["teacher", "chat", courseId, "conversation"] });
      void queryClient.invalidateQueries({ queryKey: ["teacher-chat-groups"] });
    },
  });
}
