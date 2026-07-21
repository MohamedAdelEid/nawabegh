export const flashcardsStationQueryKeys = {
  all: ["student", "flashcards-station"] as const,
  intro: (stationId: string) =>
    [...flashcardsStationQueryKeys.all, "intro", stationId] as const,
  deck: (stationId: string) =>
    [...flashcardsStationQueryKeys.all, "deck", stationId] as const,
};
