export const parentHomeQueryKeys = {
  all: ["parent", "home"] as const,
  dashboard: () => [...parentHomeQueryKeys.all, "dashboard"] as const,
  childrenStats: () => [...parentHomeQueryKeys.all, "children-stats"] as const,
};
