export const parentChatQueryKeys = {
  all: ["parent", "chat"] as const,
  inbox: (keyword: string) => [...parentChatQueryKeys.all, "inbox", keyword] as const,
  thread: (kind: string, id: string) =>
    [...parentChatQueryKeys.all, "thread", kind, id] as const,
  contactsSuggested: () => [...parentChatQueryKeys.all, "contacts", "suggested"] as const,
  contactsSearch: (keyword: string) =>
    [...parentChatQueryKeys.all, "contacts", "search", keyword] as const,
};
