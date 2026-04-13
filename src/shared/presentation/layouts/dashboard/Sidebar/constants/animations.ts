import type { Variants } from "framer-motion";

/** Keep in sync with `globals.css` `--dashboard-sidebar-*` */
export const SIDEBAR_WIDTH_EXPANDED = "var(--dashboard-sidebar-expanded)";
export const SIDEBAR_WIDTH_COLLAPSED = "var(--dashboard-sidebar-collapsed)";

export const SIDEBAR_DURATION = 0.45;
export const SIDEBAR_EASE = [0.25, 0.1, 0.25, 1] as const;

export const sidebarVariants: Variants = {
  initial: {
    width: SIDEBAR_WIDTH_COLLAPSED,
    x: SIDEBAR_WIDTH_COLLAPSED,
    opacity: 0,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
  },
  expanded: {
    width: SIDEBAR_WIDTH_EXPANDED,
    x: 0,
    opacity: 1,
    transition: { duration: SIDEBAR_DURATION, ease: SIDEBAR_EASE },
  },
  collapsed: {
    width: SIDEBAR_WIDTH_COLLAPSED,
    x: 0,
    opacity: 1,
    transition: { duration: SIDEBAR_DURATION, ease: SIDEBAR_EASE },
  },
};

export const mobileSidebarVariants: Variants = {
  hidden: { x: "100%", opacity: 0.5 },
  visible: { x: 0, opacity: 1 },
};

export const itemVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.03, duration: 0.25, ease: "easeOut" },
  }),
};

export const logoVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.35 } },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
};

export const textVariants: Variants = {
  hidden: { opacity: 0, width: 0 },
  visible: { opacity: 1, width: "auto", transition: { duration: 0.35, ease: "easeOut" } },
  exit: { opacity: 0, width: 0, transition: { duration: 0.25, ease: "easeIn" } },
};
