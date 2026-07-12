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
    BUNDLES: {
      LIST: "/admin/bundles",
      CREATE: "/admin/bundles/new",
      EDIT: (bundleId: string) => `/admin/bundles/${encodeURIComponent(bundleId)}/edit`,
    },
    PAYMENTS: {
      OVERVIEW: "/admin/payments",
      SETTINGS: "/admin/payments/settings",
      TRANSACTIONS: "/admin/payments/transactions",
      ENROLLMENTS: "/admin/payments/enrollments",
      ENROLLMENT_DETAIL: (enrollmentId: string) =>
        `/admin/payments/enrollments/${encodeURIComponent(enrollmentId)}`,
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
    ADS: {
      LIST: "/admin/ads",
      CREATE: "/admin/ads/create",
      VIEW: (adId: string) => `/admin/ads/${encodeURIComponent(adId)}`,
      EDIT: (adId: string) => `/admin/ads/${encodeURIComponent(adId)}/edit`,
    },
    CURRICULUM_MANAGEMENT: {
      LIST: "/admin/curriculum-management",
    },
    EXAMS: {
      LIST: "/admin/exams",
      ALL: "/admin/exams/list",
      CREATE: "/admin/exams/create",
      EDIT: (courseId: string) => `/admin/exams/${encodeURIComponent(courseId)}`,
      PREVIEW: (courseId: string) =>
        `/admin/exams/${encodeURIComponent(courseId)}/preview`,
      CERTIFICATE_TEMPLATES: "/admin/exams/certificate-templates",
    },
    BADGE_MANAGEMENT: {
      LIST: "/admin/badges",
    },
    SUPPORT_TICKETS: {
      LIST: "/admin/support-tickets",
      VIEW: (ticketId: string) =>
        `/admin/support-tickets/${encodeURIComponent(ticketId)}`,
    },
    RESULTS: {
      LIST: "/admin/results",
      STUDENT: (studentId: string) =>
        `/admin/results/students/${encodeURIComponent(studentId)}`,
      QUIZ_ANALYSIS: (quizId: string) =>
        `/admin/results/quizzes/${encodeURIComponent(quizId)}/analysis`,
    },
    FRIEND_CHALLENGES: {
      LIST: "/admin/friend-challenges",
      DETAIL: (challengeId: string) =>
        `/admin/friend-challenges/${encodeURIComponent(challengeId)}`,
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
      COMMUNITY_BADGES: "/admin/article-editor/community-settings/badges",
      COMMUNITY_BADGE_ADD: "/admin/article-editor/community-settings/badges/add",
      COMMUNITY_BADGE_EDIT: (id: string) =>
        `/admin/article-editor/community-settings/badges/${id}/edit`,
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
      CHALLENGE_PREVIEW: (journeyId: string, stationId: string) =>
        `/admin/journey-editor/${journeyId}/challenge/${stationId}/preview`,
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
      COURSES: "/student/courses",
      TEACHERS: "/student/teachers",
      TEACHER_PROFILE: (teacherId: string) =>
        `/student/teachers/${encodeURIComponent(teacherId)}`,
      COURSE_DETAIL: (courseId: string) => `/student/courses/${courseId}`,
      COURSE_CHECKOUT: (courseId: string) => `/student/courses/${courseId}/checkout`,
      CHECKOUT_RESULT: "/student/checkout/result",
      JOURNEY: "/student/journey",
      SUBSCRIPTIONS: "/student/subscriptions",
      DAILY_TASKS: "/student/daily-tasks",
      SCHEDULE: "/student/schedule",
      ONBOARDING_QUIZ: "/student/onboarding-quiz",
      FRIEND_CHALLENGES: {
        HUB: "/student/friend-challenges",
        HISTORY: "/student/friend-challenges/history",
        DETAIL: (id: string) => `/student/friend-challenges/${encodeURIComponent(id)}`,
        UPCOMING: (id: string) =>
          `/student/friend-challenges/${encodeURIComponent(id)}/upcoming`,
        SESSION: (sessionId: string) =>
          `/student/friend-challenges/sessions/${encodeURIComponent(sessionId)}`,
        SESSION_WAIT_OPPONENT: (sessionId: string) =>
          `/student/friend-challenges/sessions/${encodeURIComponent(sessionId)}/waiting-opponent`,
        SESSION_WAIT_FINISH: (sessionId: string) =>
          `/student/friend-challenges/sessions/${encodeURIComponent(sessionId)}/waiting-finish`,
        SESSION_RESULT: (sessionId: string) =>
          `/student/friend-challenges/sessions/${encodeURIComponent(sessionId)}/result`,
      },
      SETTINGS: "/student/settings",
      KNOWLEDGE_COMMUNITY: {
        LIST: "/student/knowledge-community",
        CREATE: "/student/knowledge-community/create",
        PREVIEW: "/student/knowledge-community/create/preview",
        SUBMITTED: (articleId: string) =>
          `/student/knowledge-community/create/submitted/${encodeURIComponent(articleId)}`,
        ARTICLE: (articleId: string) =>
          `/student/knowledge-community/articles/${encodeURIComponent(articleId)}`,
        AUTHOR: (authorId: string) =>
          `/student/knowledge-community/authors/${encodeURIComponent(authorId)}`,
      },
    },
    TEACHER: {
      HOME: "/teacher/dashboard",
      SETTINGS: "/teacher/settings",
      /** @deprecated Use LIVE_SESSIONS with ?tab=analytics */
      LIVE_ANALYTICS: "/teacher/live-sessions?tab=analytics",
      SCHEDULE: "/teacher/schedule",
      LIVE_SESSIONS: "/teacher/live-sessions",
      LIVE_SESSIONS_ABSENT_STUDENTS: "/teacher/live-sessions/absent-students",
      SESSION_DETAILS: (sessionId: string) => `/teacher/live-sessions/${sessionId}`,
      COURSES: {
        LIST: "/teacher/courses",
        CREATE: "/teacher/courses/create",
        DETAILS: (courseId: string) => `/teacher/courses/${courseId}`,
        EDIT: (courseId: string) => `/teacher/courses/${courseId}/edit`,
        STATISTICS: (courseId: string) => `/teacher/courses/${courseId}/statistics`,
        STATISTICS_OVERVIEW: "/teacher/course-statistics",
        SUBSCRIBERS: (courseId: string) => `/teacher/courses/${courseId}/subscribers`,
        SUBSCRIBER_PROFILE: (courseId: string, studentUserId: string) =>
          `/teacher/courses/${courseId}/subscribers/${encodeURIComponent(studentUserId)}`,
      },
      CHAT_GROUPS: {
        LIST: "/teacher/chat-groups",
        CREATE: "/teacher/chat-groups/create",
        VIEW: (courseId: string) => `/teacher/chat-groups/${encodeURIComponent(courseId)}`,
        MEMBERS: (courseId: string) =>
          `/teacher/chat-groups/${encodeURIComponent(courseId)}/members`,
        EDIT: (courseId: string) => `/teacher/chat-groups/${encodeURIComponent(courseId)}/edit`,
      },
      HELPER_FILE_MANAGEMENT: {
        LIST: "/teacher/helper-file-management",
        ADD: "/teacher/helper-file-management/add",
        VIEW: (fileId: string) => `/teacher/helper-file-management/${fileId}`,
        EDIT: (fileId: string) => `/teacher/helper-file-management/${fileId}/edit`,
      },
      INTERACTIVE_BOOKS: {
        LIST: "/teacher/interactive-books",
        ADD: "/teacher/interactive-books/add",
        MANAGE: "/teacher/interactive-books/manage",
        MANAGE_BY_COURSE: (courseId: string) =>
          `/teacher/interactive-books/manage/${encodeURIComponent(courseId)}/edit`,
        MANAGE_EDIT: (courseId: string) =>
          `/teacher/interactive-books/manage/${encodeURIComponent(courseId)}/edit`,
      },
      KNOWLEDGE_COMMUNITY: {
        LIST: "/teacher/knowledge-community",
        CREATE: "/teacher/knowledge-community/create",
        PREVIEW: "/teacher/knowledge-community/create/preview",
        SUBMITTED: (articleId: string) =>
          `/teacher/knowledge-community/create/submitted/${encodeURIComponent(articleId)}`,
        ARTICLE: (articleId: string) =>
          `/teacher/knowledge-community/articles/${encodeURIComponent(articleId)}`,
        AUTHOR: (authorId: string) =>
          `/teacher/knowledge-community/authors/${encodeURIComponent(authorId)}`,
      },
      JOURNEY_EDITOR: {
        LIST: "/teacher/journey-editor",
        EDITOR: (journeyId: string) => `/teacher/journey-editor/${journeyId}`,
        FLASHCARD_GROUP: (journeyId: string, stationId: string, deckId?: string) => {
          const base = `/teacher/journey-editor/${journeyId}/flashcard/${stationId}`;
          return deckId ? `${base}?deckId=${encodeURIComponent(deckId)}` : base;
        },
        FLASHCARD_ADD: (journeyId: string, stationId: string, deckId?: string) => {
          const base = `/teacher/journey-editor/${journeyId}/flashcard/${stationId}/add`;
          return deckId ? `${base}?deckId=${encodeURIComponent(deckId)}` : base;
        },
        LIVE_BROADCAST_ADD: (journeyId: string, stationId: string) =>
          `/teacher/journey-editor/${journeyId}/live-broadcast/${stationId}/add`,
        LIVE_BROADCAST_VIEW: (journeyId: string, stationId: string) =>
          `/teacher/journey-editor/${journeyId}/live-broadcast/${stationId}`,
        CHALLENGE_EDITOR: (journeyId: string, stationId: string) =>
          `/teacher/journey-editor/${journeyId}/challenge/${stationId}`,
        CHALLENGE_PREVIEW: (journeyId: string, stationId: string) =>
          `/teacher/journey-editor/${journeyId}/challenge/${stationId}/preview`,
        EXAM_EDITOR: (journeyId: string, stationId: string) =>
          `/teacher/journey-editor/${journeyId}/exam/${stationId}`,
        EXAM_PREVIEW: (journeyId: string, stationId: string) =>
          `/teacher/journey-editor/${journeyId}/exam/${stationId}/preview`,
        EXAM_EDIT_QUESTIONS: (journeyId: string, stationId: string) =>
          `/teacher/journey-editor/${journeyId}/exam/${stationId}/edit-questions`,
        HELPER_RESOURCE_EDITOR: (journeyId: string, stationId: string) =>
          `/teacher/journey-editor/${journeyId}/helper-resource/${stationId}`,
      },
    },
    PARENT: {
      HOME: "/parent/dashboard",
      SETTINGS: "/parent/settings",
    },
    SCHOOL: {
      HOME: "/school/dashboard",
      SETTINGS: "/school/settings",
      ANNOUNCEMENTS: {
        LIST: "/school/announcements",
        CREATE: "/school/announcements/create",
        VIEW: (announcementId: string) =>
          `/school/announcements/${encodeURIComponent(announcementId)}`,
        EDIT: (announcementId: string) =>
          `/school/announcements/${encodeURIComponent(announcementId)}/edit`,
      },
    },
  },
  PUBLIC: {
    LIBRARY: "/library",
    LIBRARY_BY_CATEGORY: (id: string) =>
      `/library?category=${encodeURIComponent(id)}`,
  },
} as const;
