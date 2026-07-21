export const shortQuizQueryKeys = {
  all: ["student", "short-quiz"] as const,
  intro: (stationId: string) =>
    [...shortQuizQueryKeys.all, "intro", stationId] as const,
  attempt: (stationId: string) =>
    [...shortQuizQueryKeys.all, "attempt", stationId] as const,
  result: (stationId: string) =>
    [...shortQuizQueryKeys.all, "result", stationId] as const,
};
