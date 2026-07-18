export const schoolAccountQueryKeys = {
  all: ["school", "account"] as const,
  settings: () => [...schoolAccountQueryKeys.all, "settings"] as const,
  sessions: () => [...schoolAccountQueryKeys.all, "sessions"] as const,
};
