import { useQuery } from "@tanstack/react-query";
import { teacherApi } from "@/modules/teacher/infrastructure/api/teacherApi";

export function useTeacherChatConversation(courseId: string) {
  return useQuery({
    queryKey: ["teacher", "chat", courseId, "conversation"],
    queryFn: () => teacherApi.getChatConversation(courseId),
    enabled: Boolean(courseId),
  });
}
