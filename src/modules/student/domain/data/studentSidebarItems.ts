import {
  SidebarHomeIcon,
  SidebarMapIcon,
  SidebarMessageIcon,
} from "@/shared/presentation/icons/sidebar";
import type { SidebarItems } from "@/shared/domain/types/sidebar.types";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import {
  Building2,
  CalendarDays,
  CircleHelp,
  GraduationCap,
  Layers,
  ListTodo,
  LogOut,
  Newspaper,
  Settings,
  Swords,
  Trophy,
} from "lucide-react";

export function buildStudentShellSidebar(dashboardBase: string, settingsHref: string): SidebarItems {
  return {
    main: [
      {
        id: "home",
        labelKey: "sidebar.nav.home",
        href: `${dashboardBase}?tab=home`,
        icon: SidebarHomeIcon,
      },
      {
        id: "subscriptions",
        labelKey: "sidebar.nav.subscriptions",
        href: ROUTES.USER.STUDENT.SUBSCRIPTIONS,
        activePathPrefixes: [ROUTES.USER.STUDENT.SUBSCRIPTIONS],
        icon: Layers,
      },
      {
        id: "teachers",
        labelKey: "sidebar.nav.teachers",
        href: ROUTES.USER.STUDENT.TEACHERS,
        activePathPrefixes: [ROUTES.USER.STUDENT.TEACHERS],
        icon: GraduationCap,
      },
      {
        id: "journey",
        labelKey: "sidebar.nav.journey",
        href: ROUTES.USER.STUDENT.JOURNEY,
        activePathPrefixes: [
          ROUTES.USER.STUDENT.JOURNEY,
          "/student/stations/helper-resource",
          ROUTES.USER.STUDENT.CHAT_GROUPS.LIST,
        ],
        icon: SidebarMapIcon,
      },
      {
        id: "schedule",
        labelKey: "sidebar.nav.schedule",
        href: ROUTES.USER.STUDENT.SCHEDULE,
        activePathPrefixes: [ROUTES.USER.STUDENT.SCHEDULE],
        icon: CalendarDays,
      },
      {
        id: "dailyTasks",
        labelKey: "sidebar.nav.dailyTasks",
        href: ROUTES.USER.STUDENT.DAILY_TASKS,
        activePathPrefixes: [ROUTES.USER.STUDENT.DAILY_TASKS],
        icon: ListTodo,
      },
      {
        id: "friendChallenges",
        labelKey: "sidebar.nav.friendChallenges",
        href: ROUTES.USER.STUDENT.FRIEND_CHALLENGES.HUB,
        activePathPrefixes: [
          ROUTES.USER.STUDENT.FRIEND_CHALLENGES.HUB,
          "/student/friend-challenges",
        ],
        icon: Swords,
      },
      {
        id: "challengeArena",
        labelKey: "sidebar.nav.challengeArena",
        href: ROUTES.USER.STUDENT.CHALLENGE_HUB,
        activePathPrefixes: [ROUTES.USER.STUDENT.CHALLENGE_HUB],
        icon: Trophy,
      },
      {
        id: "allCourses",
        labelKey: "sidebar.nav.allCourses",
        href: ROUTES.USER.STUDENT.COURSES,
        activePathPrefixes: [ROUTES.USER.STUDENT.COURSES],
        icon: SidebarMessageIcon,
      },
    ],
    secondary: [
      {
        id: "helper",
        labelKey: "sidebar.nav.helper",
        href: `${dashboardBase}?tab=helper`,
        icon: CircleHelp,
      },
      {
        id: "settings",
        labelKey: "sidebar.nav.settings",
        href: settingsHref,
        icon: Settings,
      },
      {
        id: "logout",
        labelKey: "sidebar.nav.logout",
        icon: LogOut,
        danger: true,
      },
    ],
  };
}

const studentShellSidebar = buildStudentShellSidebar(
  "/student/dashboard",
  ROUTES.USER.STUDENT.PROFILE,
);

/**
 * Student sidebar. Knowledge community is a student-only destination, so it is
 * appended here rather than inside the shared builder (which the parent portal reuses).
 */
export const studentSidebarItems: SidebarItems = {
  ...studentShellSidebar,
  main: [
    ...studentShellSidebar.main,
    {
      id: "mySchool",
      labelKey: "sidebar.nav.mySchool",
      href: ROUTES.USER.STUDENT.SCHOOL,
      activePathPrefixes: [
        ROUTES.USER.STUDENT.SCHOOL,
        ROUTES.USER.STUDENT.EVENTS,
      ],
      icon: Building2,
    },
    {
      id: "knowledgeCommunity",
      labelKey: "sidebar.nav.knowledgeCommunity",
      href: ROUTES.USER.STUDENT.KNOWLEDGE_COMMUNITY.LIST,
      activePathPrefixes: [ROUTES.USER.STUDENT.KNOWLEDGE_COMMUNITY.LIST],
      icon: Newspaper,
    },
  ],
  secondary: studentShellSidebar.secondary.map((item) =>
    item.id === "settings"
      ? {
          ...item,
          labelKey: "sidebar.nav.profile",
          href: ROUTES.USER.STUDENT.PROFILE,
          activePathPrefixes: [
            ROUTES.USER.STUDENT.PROFILE,
            ROUTES.USER.STUDENT.SETTINGS,
          ],
        }
      : item,
  ),
};
