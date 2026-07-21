export const liveStationQueryKeys = {
  all: ["student", "live-station"] as const,
  info: (stationId: string) =>
    [...liveStationQueryKeys.all, "info", stationId] as const,
  chat: (stationId: string) =>
    [...liveStationQueryKeys.all, "chat", stationId] as const,
  participants: (stationId: string) =>
    [...liveStationQueryKeys.all, "participants", stationId] as const,
  recordingProgress: (stationId: string) =>
    [...liveStationQueryKeys.all, "recording-progress", stationId] as const,
};
