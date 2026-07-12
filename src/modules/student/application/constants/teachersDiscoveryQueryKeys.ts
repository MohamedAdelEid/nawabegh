export const TEACHERS_DISCOVERY_PAGE_SIZE = 9;

export type TeachersDiscoveryFilterSnapshot = {
  keyword?: string;
  subjectId?: number;
  pageNumber: number;
};

export const teachersDiscoveryQueryKeys = {
  all: ["teachersDiscovery"] as const,
  subjects: (locale: string) =>
    [...teachersDiscoveryQueryKeys.all, "subjects", locale] as const,
  teachers: (locale: string, filters: TeachersDiscoveryFilterSnapshot) =>
    [...teachersDiscoveryQueryKeys.all, "teachers", locale, filters] as const,
};
