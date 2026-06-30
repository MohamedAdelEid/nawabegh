import { ROUTES } from "@/shared/infrastructure/config/routes";

export type DashboardScope = "admin" | "teacher" | "student";

export type HelperFileManagementRoutes = {
  LIST: string;
  ADD: string;
  VIEW: (fileId: string) => string;
  EDIT: (fileId: string) => string;
};

export type InteractiveBooksRoutes = {
  LIST: string;
  ADD: string;
  MANAGE: string;
  MANAGE_BY_COURSE: (courseId: string) => string;
  MANAGE_EDIT: (courseId: string) => string;
};

export type JourneyEditorRoutes = {
  EDITOR: (journeyId: string) => string;
  FLASHCARD_GROUP: (journeyId: string, stationId: string, deckId?: string) => string;
  FLASHCARD_ADD: (journeyId: string, stationId: string, deckId?: string) => string;
  LIVE_BROADCAST_ADD: (journeyId: string, stationId: string) => string;
  LIVE_BROADCAST_VIEW: (journeyId: string, stationId: string) => string;
  CHALLENGE_EDITOR: (journeyId: string, stationId: string) => string;
  EXAM_EDITOR: (journeyId: string, stationId: string) => string;
  EXAM_PREVIEW: (journeyId: string, stationId: string) => string;
  EXAM_EDIT_QUESTIONS: (journeyId: string, stationId: string) => string;
  HELPER_RESOURCE_EDITOR: (journeyId: string, stationId: string) => string;
};

export type KnowledgeCommunityRoutes = {
  LIST: string;
  CREATE: string;
  PREVIEW: string;
  ARTICLE: (articleId: string) => string;
  AUTHOR: (authorId: string) => string;
};

export type ScopedDashboardRoutes = {
  scope: DashboardScope;
  home: string;
  helperFileManagement: HelperFileManagementRoutes;
  interactiveBooks: InteractiveBooksRoutes;
  journeyEditor: JourneyEditorRoutes;
  knowledgeCommunity: KnowledgeCommunityRoutes;
  interactiveBooksListHref: string;
  journeyEditorListHref: string;
};

function createJourneyEditorRoutes(base: string): JourneyEditorRoutes {
  return {
    EDITOR: (journeyId: string) => `${base}/${journeyId}`,
    FLASHCARD_GROUP: (journeyId: string, stationId: string, deckId?: string) => {
      const path = `${base}/${journeyId}/flashcard/${stationId}`;
      return deckId ? `${path}?deckId=${encodeURIComponent(deckId)}` : path;
    },
    FLASHCARD_ADD: (journeyId: string, stationId: string, deckId?: string) => {
      const path = `${base}/${journeyId}/flashcard/${stationId}/add`;
      return deckId ? `${path}?deckId=${encodeURIComponent(deckId)}` : path;
    },
    LIVE_BROADCAST_ADD: (journeyId: string, stationId: string) =>
      `${base}/${journeyId}/live-broadcast/${stationId}/add`,
    LIVE_BROADCAST_VIEW: (journeyId: string, stationId: string) =>
      `${base}/${journeyId}/live-broadcast/${stationId}`,
    CHALLENGE_EDITOR: (journeyId: string, stationId: string) =>
      `${base}/${journeyId}/challenge/${stationId}`,
    EXAM_EDITOR: (journeyId: string, stationId: string) =>
      `${base}/${journeyId}/exam/${stationId}`,
    EXAM_PREVIEW: (journeyId: string, stationId: string) =>
      `${base}/${journeyId}/exam/${stationId}/preview`,
    EXAM_EDIT_QUESTIONS: (journeyId: string, stationId: string) =>
      `${base}/${journeyId}/exam/${stationId}/edit-questions`,
    HELPER_RESOURCE_EDITOR: (journeyId: string, stationId: string) =>
      `${base}/${journeyId}/helper-resource/${stationId}`,
  };
}

function createHelperFileRoutes(base: string): HelperFileManagementRoutes {
  return {
    LIST: base,
    ADD: `${base}/add`,
    VIEW: (fileId: string) => `${base}/${fileId}`,
    EDIT: (fileId: string) => `${base}/${fileId}/edit`,
  };
}

function createInteractiveBooksRoutes(base: string): InteractiveBooksRoutes {
  return {
    LIST: base,
    ADD: `${base}/add`,
    MANAGE: `${base}/manage`,
    MANAGE_BY_COURSE: (courseId: string) =>
      `${base}/manage/${encodeURIComponent(courseId)}/edit`,
    MANAGE_EDIT: (courseId: string) =>
      `${base}/manage/${encodeURIComponent(courseId)}/edit`,
  };
}

const TEACHER_HELPER_BASE = ROUTES.USER.TEACHER.HELPER_FILE_MANAGEMENT.LIST;
const TEACHER_INTERACTIVE_BASE = ROUTES.USER.TEACHER.INTERACTIVE_BOOKS.LIST;
const TEACHER_JOURNEY_BASE = ROUTES.USER.TEACHER.JOURNEY_EDITOR.LIST;

export function getDashboardScopeFromPathname(pathname: string): DashboardScope {
  if (pathname.startsWith("/teacher")) return "teacher";
  if (pathname.startsWith("/student")) return "student";
  return "admin";
}

export function getScopedDashboardRoutes(scope: DashboardScope): ScopedDashboardRoutes {
  if (scope === "student") {
    const studentHome = ROUTES.USER.STUDENT.HOME;
    return {
      scope,
      home: studentHome,
      helperFileManagement: createHelperFileRoutes(`${studentHome}/helper-file-management`),
      interactiveBooks: createInteractiveBooksRoutes(`${studentHome}/interactive-books`),
      journeyEditor: createJourneyEditorRoutes(`${studentHome}/journey-editor`),
      knowledgeCommunity: ROUTES.USER.STUDENT.KNOWLEDGE_COMMUNITY,
      interactiveBooksListHref: studentHome,
      journeyEditorListHref: studentHome,
    };
  }

  if (scope === "teacher") {
    return {
      scope,
      home: ROUTES.USER.TEACHER.HOME,
      helperFileManagement: createHelperFileRoutes(TEACHER_HELPER_BASE),
      interactiveBooks: createInteractiveBooksRoutes(TEACHER_INTERACTIVE_BASE),
      journeyEditor: ROUTES.USER.TEACHER.JOURNEY_EDITOR,
      knowledgeCommunity: ROUTES.USER.TEACHER.KNOWLEDGE_COMMUNITY,
      interactiveBooksListHref: TEACHER_INTERACTIVE_BASE,
      journeyEditorListHref: TEACHER_JOURNEY_BASE,
    };
  }

  return {
    scope,
    home: ROUTES.ADMIN.HOME,
    helperFileManagement: ROUTES.ADMIN.HELPER_FILE_MANAGEMENT,
    interactiveBooks: ROUTES.ADMIN.INTERACTIVE_BOOKS,
    journeyEditor: ROUTES.ADMIN.JOURNEY_EDITOR,
    knowledgeCommunity: {
      LIST: ROUTES.ADMIN.ARTICLE_EDITOR.LIST,
      CREATE: ROUTES.ADMIN.ARTICLE_EDITOR.LIST,
      PREVIEW: ROUTES.ADMIN.ARTICLE_EDITOR.LIST,
      ARTICLE: ROUTES.ADMIN.ARTICLE_EDITOR.VIEW,
      AUTHOR: (_authorId: string) => ROUTES.ADMIN.ARTICLE_EDITOR.LIST,
    },
    interactiveBooksListHref: `${ROUTES.ADMIN.HOME}?tab=interactiveBooks`,
    journeyEditorListHref: `${ROUTES.ADMIN.HOME}?tab=journeyEditor`,
  };
}
