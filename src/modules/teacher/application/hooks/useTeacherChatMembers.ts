import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { teacherApi } from "@/modules/teacher/infrastructure/api/teacherApi";
import type { TeacherChatGroupSettings } from "@/modules/teacher/domain/types/teacher.types";

export function useTeacherChatMembers(courseId: string) {
  return useQuery({
    queryKey: ["teacher", "chat", courseId, "members"],
    queryFn: () => teacherApi.getChatMembers(courseId),
    enabled: Boolean(courseId),
  });
}

export function useTeacherChatGroupSettingsMutation(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: Partial<TeacherChatGroupSettings>) =>
      teacherApi.updateChatGroupSettings(courseId, settings),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["teacher", "chat", courseId, "members"] });
    },
  });
}
