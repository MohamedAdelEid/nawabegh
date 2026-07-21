export const studentChatQueryKeys = {
  all: ["student", "chat"] as const,
  groups: (locale: string) => [...studentChatQueryKeys.all, "groups", locale] as const,
  conversation: (courseId: string, locale: string) =>
    [...studentChatQueryKeys.all, "conversation", courseId, locale] as const,
  members: (courseId: string, locale: string) =>
    [...studentChatQueryKeys.all, "members", courseId, locale] as const,
};
