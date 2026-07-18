export const parentProfileQueryKeys = {
  all: ["parent-profile"] as const,
  detail: () => [...parentProfileQueryKeys.all, "detail"] as const,
};
