import type { ComponentType, SVGProps } from "react";

/** Lucide icons and inline SVG components both accept `className` / SVG props. */
export type SidebarIcon = ComponentType<SVGProps<SVGSVGElement>>;

export type SidebarItem = {
  id: string;
  /** Static label (e.g. tests); prefer `labelKey` for UI. */
  label?: string;
  /** Key under the dashboard translation namespace, e.g. `sidebar.nav.home`. */
  labelKey?: string;
  href?: string;
  /** Path prefixes that should keep this item active on nested pages. */
  activePathPrefixes?: string[];
  icon?: SidebarIcon;
  danger?: boolean;
};

export type SidebarItems = {
  main: SidebarItem[];
  secondary: SidebarItem[];
};
