export const friendChallengeQueryKeys = {
  all: ["student", "friend-challenges"] as const,
  hub: () => [...friendChallengeQueryKeys.all, "hub"] as const,
  detail: (id: string) => [...friendChallengeQueryKeys.all, "detail", id] as const,
  opponents: (keyword: string) =>
    [...friendChallengeQueryKeys.all, "opponents", keyword] as const,
  activeSession: () => [...friendChallengeQueryKeys.all, "active-session"] as const,
  session: (sessionId: string) =>
    [...friendChallengeQueryKeys.all, "session", sessionId] as const,
  questions: (sessionId: string) =>
    [...friendChallengeQueryKeys.all, "questions", sessionId] as const,
  result: (sessionId: string) =>
    [...friendChallengeQueryKeys.all, "result", sessionId] as const,
};
