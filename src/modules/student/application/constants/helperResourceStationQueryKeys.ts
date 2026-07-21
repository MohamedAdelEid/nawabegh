export const helperResourceStationQueryKeys = {
  all: ["student", "helper-resource-station"] as const,
  station: (stationId: string, mediaKind?: string | null) =>
    [
      ...helperResourceStationQueryKeys.all,
      "station",
      stationId,
      mediaKind ?? "all",
    ] as const,
  file: (fileId: string) =>
    [...helperResourceStationQueryKeys.all, "file", fileId] as const,
  readingProgress: (fileId: string) =>
    [...helperResourceStationQueryKeys.all, "reading-progress", fileId] as const,
};
