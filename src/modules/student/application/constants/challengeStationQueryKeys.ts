export const challengeStationQueryKeys = {
  all: ["student", "challenge-station"] as const,
  intro: (stationId: string) =>
    [...challengeStationQueryKeys.all, "intro", stationId] as const,
  overview: (challengeId: string) =>
    [...challengeStationQueryKeys.all, "overview", challengeId] as const,
  session: (sessionId: string) =>
    [...challengeStationQueryKeys.all, "session", sessionId] as const,
  questions: (sessionId: string) =>
    [...challengeStationQueryKeys.all, "questions", sessionId] as const,
  points: (recent = 20) =>
    [...challengeStationQueryKeys.all, "points", recent] as const,
  achievements: () =>
    [...challengeStationQueryKeys.all, "achievements"] as const,
  hub: () => [...challengeStationQueryKeys.all, "hub"] as const,
};
