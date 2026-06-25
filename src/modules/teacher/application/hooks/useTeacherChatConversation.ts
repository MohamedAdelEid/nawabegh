import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { teacherApi } from "@/modules/teacher/infrastructure/api/teacherApi";
import type {
  TeacherChatConversationData,
  TeacherChatGroupSettings,
} from "@/modules/teacher/domain/types/teacher.types";
import type { SendChatMessagePayload } from "@/modules/teacher/infrastructure/api/teacherChatApi";
import type { UpdateInChatSettingsPayload } from "@/modules/teacher/infrastructure/api/teacherChatApi";

function invalidateChatQueries(queryClient: ReturnType<typeof useQueryClient>, courseId: string) {
  void queryClient.invalidateQueries({ queryKey: ["teacher", "chat", courseId, "conversation"] });
  void queryClient.invalidateQueries({ queryKey: ["teacher", "chat", courseId, "members"] });
  void queryClient.invalidateQueries({ queryKey: ["teacher-chat-groups"] });
}

export function useTeacherChatConversation(courseId: string) {
  const locale = useLocale();

  return useQuery({
    queryKey: ["teacher", "chat", courseId, "conversation", locale],
    queryFn: () => teacherApi.getChatConversation(courseId, locale),
    enabled: Boolean(courseId),
  });
}

export function useTeacherChatSendMessage(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SendChatMessagePayload) => teacherApi.sendChatMessage(courseId, payload),
    onSuccess: () => invalidateChatQueries(queryClient, courseId),
  });
}

export function useTeacherChatMessageActions(courseId: string) {
  const queryClient = useQueryClient();

  const invalidate = () => invalidateChatQueries(queryClient, courseId);

  const pinMutation = useMutation({
    mutationFn: ({ messageId, pinned }: { messageId: string; pinned: boolean }) =>
      pinned ? teacherApi.unpinChatMessage(messageId) : teacherApi.pinChatMessage(messageId),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (messageId: string) => teacherApi.deleteChatMessage(messageId),
    onSuccess: invalidate,
  });

  const reactionMutation = useMutation({
    mutationFn: ({
      messageId,
      emoji,
      reactions,
    }: {
      messageId: string;
      emoji: string;
      reactions: Array<{ emoji: string; reactedByCurrentUser?: boolean }>;
    }) => teacherApi.toggleChatReaction(messageId, emoji, reactions),
    onSuccess: invalidate,
  });

  return { pinMutation, deleteMutation, reactionMutation };
}

export function useTeacherChatModeration(courseId: string) {
  const queryClient = useQueryClient();

  const invalidate = () => invalidateChatQueries(queryClient, courseId);

  const lockMutation = useMutation({
    mutationFn: (locked: boolean) => teacherApi.toggleChatLock(courseId, locked),
    onSuccess: invalidate,
  });

  const settingsMutation = useMutation({
    mutationFn: (payload: UpdateInChatSettingsPayload) =>
      teacherApi.updateInChatSettings(courseId, payload),
    onSuccess: invalidate,
  });

  const muteMutation = useMutation({
    mutationFn: ({ isMuted, isPinnedInList }: { isMuted: boolean; isPinnedInList: boolean }) =>
      teacherApi.updateChatMutePreference(courseId, isMuted, isPinnedInList),
    onSuccess: (_result, variables) => {
      queryClient.setQueryData<TeacherChatConversationData>(
        ["teacher", "chat", courseId, "conversation"],
        (previous) => (previous ? { ...previous, isMuted: variables.isMuted } : previous),
      );
      invalidate();
    },
  });

  return { lockMutation, settingsMutation, muteMutation };
}

export function useTeacherChatParticipantActions(courseId: string) {
  const queryClient = useQueryClient();

  const banMutation = useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason: string }) =>
      teacherApi.banChatParticipant(courseId, userId, reason),
    onSuccess: () => invalidateChatQueries(queryClient, courseId),
  });

  const violationMutation = useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason: string }) =>
      teacherApi.logChatParticipantViolation(courseId, userId, reason),
    onSuccess: () => invalidateChatQueries(queryClient, courseId),
  });

  return { banMutation, violationMutation };
}
