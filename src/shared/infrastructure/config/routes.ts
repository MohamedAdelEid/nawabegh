/** Central route strings for links in layouts and navigation. */
export const ROUTES = {
  HOME: "/",
  AUTH: {
    LOGIN: "/api/auth/signin",
  },
  ADMIN: {
    HOME: "/admin/dashboard",
    SETTINGS: "/admin/settings",
    PROFILE: "/admin/profile",
    USER_MANAGEMENT: {
      LIST: "/admin/user-management",
      VIEW: (id: string) => `/admin/user-management/${id}`,
      ADD: {
        ROOT: "/admin/user-management/add",
        STUDENT: "/admin/user-management/add/student",
        TEACHER: "/admin/user-management/add/teacher",
        PARENT: "/admin/user-management/add/parent",
      },
    },
    SCHOOL_MANAGEMENT: {
      ADD: "/admin/school-management/add",
      EDIT: (id: string) => `/admin/school-management/${id}/edit`,
      DELETE: (id: string) => `/admin/school-management/${id}/delete`,
      VIEW: (id: string) => `/admin/school-management/${id}`,
      LIST: "/admin/school-management",
      FILTER: (filters: string) => `/admin/school-management?${filters}`,
      SORT: (sort: string) => `/admin/school-management?sort=${sort}`,
      SEARCH: (search: string) => `/admin/school-management?search=${search}`,
    },
  },
  USER: {
    HOME: "/student/dashboard",
    SETTINGS: "/student/settings",
  },
  PUBLIC: {
    LIBRARY: "/library",
    LIBRARY_BY_CATEGORY: (id: string) =>
      `/library?category=${encodeURIComponent(id)}`,
  },
} as const;
