export const parentChildrenQueryKeys = {
  all: ["parent", "children"] as const,
  list: () => [...parentChildrenQueryKeys.all, "list"] as const,
  search: (keyword: string, pageNumber: number, pageSize: number) =>
    [...parentChildrenQueryKeys.all, "search", keyword, pageNumber, pageSize] as const,
  createDefaults: () => [...parentChildrenQueryKeys.all, "create-defaults"] as const,
  details: (studentUserId: string) =>
    [...parentChildrenQueryKeys.all, "details", studentUserId] as const,
  schedule: (studentUserId: string, weekStart: string) =>
    [...parentChildrenQueryKeys.all, "schedule", studentUserId, weekStart] as const,
};
