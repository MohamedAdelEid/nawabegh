/** Central route strings for links in layouts and navigation. */
export const ROUTES = {
  HOME: "/",
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
    CHAT_GROUPS: {
      LIST: "/admin/chat-groups",
      EDIT: (id: string) => `/admin/chat-groups/${id}/edit`,
      VIEW: (id: string) => `/admin/chat-groups/${id}`,
    },
    CONTENT_MANAGEMENT: {
      LIST: "/admin/content-management",
      ADD: "/admin/content-management/add",
      VIEW: (fileId: string) => `/admin/content-management/${fileId}`,
      EDIT: (fileId: string) => `/admin/content-management/${fileId}/edit`,
    },
    COURSE_MANAGEMENT: {
      LIST: "/admin/course-management",
      CREATE: "/admin/course-management/create",
      EDIT: (courseId: string) => `/admin/course-management/${courseId}/edit`,
      REVIEW: (courseId: string) => `/admin/course-management/${courseId}`,
      REJECT: (courseId: string) => `/admin/course-management/${courseId}/reject`,
      REJECTION_DETAILS: (courseId: string) =>
        `/admin/course-management/${courseId}/rejection-details`,
    },
    HELPER_FILE_MANAGEMENT: {
      LIST: "/admin/helper-file-management",
      ADD: "/admin/helper-file-management/add",
      VIEW: (fileId: string) => `/admin/helper-file-management/${fileId}`,
      EDIT: (fileId: string) => `/admin/helper-file-management/${fileId}/edit`,
    },
    PRICING_MANAGEMENT: {
      LIST: "/admin/pricing-management",
      PLANS: {
        LIST: "/admin/pricing-management/plans",
        ADD: "/admin/pricing-management/plans/add",
        EDIT: (planId: string) => `/admin/pricing-management/plans/${planId}/edit`,
      },
      PAYMENT_GATEWAYS: "/admin/pricing-management/payment-gateway-settings",
      SUBSCRIPTIONS: {
        LIST: "/admin/pricing-management/subscriptions",
        VIEW: (subscriptionId: string) => `/admin/pricing-management/subscriptions/${subscriptionId}`,
      },
      TRANSACTIONS: "/admin/pricing-management/transactions",
    },
    OVERVIEW_INSIGHTS: {
      LIST: "/admin/overview-insights",
      CREATE_STATION_TEST: "/admin/overview-insights/create-station-test",
      CREATE_RANDOM_TEST: "/admin/overview-insights/create-random-test",
    },
    SEND_NOTIFICATION: {
      LIST: "/admin/send-notification",
    },
    QUESTION_BANK: {
      LIST: "/admin/question-bank",
      MANAGE: "/admin/question-bank/manage",
      ADD: "/admin/question-bank/add",
      PREVIEW: "/admin/question-bank/preview",
      PREVIEW_All: "/admin/question-bank/preview-all",
    },
    ARTICLE_EDITOR: {
      LIST: "/admin/article-editor",
      VIEW: (id: string) => `/admin/article-editor/${id}`,
      REQUEST_AMENDMENTS: (id: string) =>
        `/admin/article-editor/${id}/request-amendments`,
      COMMUNITY_SETTINGS: "/admin/article-editor/community-settings",
      COMMUNITY_BADGE_ADD: "/admin/article-editor/community-settings/badges/add",
    },
    JOURNEY_EDITOR: {
      EDITOR: (journeyId: string) => `/admin/journey-editor/${journeyId}`,
      FLASHCARD_GROUP: (journeyId: string, stationId: string, deckId?: string) => {
        const base = `/admin/journey-editor/${journeyId}/flashcard/${stationId}`;
        return deckId ? `${base}?deckId=${encodeURIComponent(deckId)}` : base;
      },
      FLASHCARD_ADD: (journeyId: string, stationId: string, deckId?: string) => {
        const base = `/admin/journey-editor/${journeyId}/flashcard/${stationId}/add`;
        return deckId ? `${base}?deckId=${encodeURIComponent(deckId)}` : base;
      },
      LIVE_BROADCAST_ADD: (journeyId: string, stationId: string) =>
        `/admin/journey-editor/${journeyId}/live-broadcast/${stationId}/add`,
      LIVE_BROADCAST_VIEW: (journeyId: string, stationId: string) =>
        `/admin/journey-editor/${journeyId}/live-broadcast/${stationId}`,
      CHALLENGE_EDITOR: (journeyId: string, stationId: string) =>
        `/admin/journey-editor/${journeyId}/challenge/${stationId}`,
      EXAM_EDITOR: (journeyId: string, stationId: string) =>
        `/admin/journey-editor/${journeyId}/exam/${stationId}`,
      EXAM_PREVIEW: (journeyId: string, stationId: string) =>
        `/admin/journey-editor/${journeyId}/exam/${stationId}/preview`,
      EXAM_EDIT_QUESTIONS: (journeyId: string, stationId: string) =>
        `/admin/journey-editor/${journeyId}/exam/${stationId}/edit-questions`,
      HELPER_RESOURCE_EDITOR: (journeyId: string, stationId: string) =>
        `/admin/journey-editor/${journeyId}/helper-resource/${stationId}`,
    },
    INTERACTIVE_BOOKS: {
      LIST: "/admin/interactive-books",
      ADD: "/admin/interactive-books/add",
      MANAGE: "/admin/interactive-books/manage",
      MANAGE_BY_COURSE: (courseId: string) =>
        `/admin/interactive-books/manage/${encodeURIComponent(courseId)}/edit`,
      /** @deprecated Use MANAGE_BY_COURSE with courseId */
      MANAGE_EDIT: (courseId: string) =>
        `/admin/interactive-books/manage/${encodeURIComponent(courseId)}/edit`,
    },
    LIVE_BROADCAST: {
      CREATE: "/admin/live-broadcast/create",
      WATCH: (sessionId: string) => `/admin/live-broadcast/${sessionId}/watch`,
    },
  },
  USER: {
    /** Default non-admin home; prefer `getRedirectPathForRole` for post-login routing. */
    HOME: "/student/dashboard",
    SETTINGS: "/student/settings",
    STUDENT: {
      HOME: "/student/dashboard",
      SETTINGS: "/student/settings",
    },
    TEACHER: {
      HOME: "/teacher/dashboard",
      SETTINGS: "/teacher/settings",
    },
    PARENT: {
      HOME: "/parent/dashboard",
      SETTINGS: "/parent/settings",
    },
  },
  PUBLIC: {
    LIBRARY: "/library",
    LIBRARY_BY_CATEGORY: (id: string) =>
      `/library?category=${encodeURIComponent(id)}`,
  },
} as const;
