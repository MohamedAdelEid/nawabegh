"use client";

import type React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/shared/application/lib/cn";
import { useAuth } from "@/shared/application/hooks/useAuth";
import type { SidebarItem, SidebarItems } from "@/shared/domain/types/sidebar.types";
import { SidebarHeader, SidebarNavSection } from "./components";
import { useActiveItem } from "./hooks";
import {
  sidebarVariants,
  mobileSidebarVariants,
  SIDEBAR_DURATION,
  SIDEBAR_EASE,
} from "./constants/animations";

interface SidebarProps {
  items: SidebarItems;
  translationNamespace: string;
  isCollapsed: boolean;
  onToggle: () => void;
  isMobile?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  items,
  translationNamespace,
  isCollapsed,
  onToggle,
  isMobile = false,
}) => {
  const router = useRouter();
  const t = useTranslations(translationNamespace);
  const { logout } = useAuth();
  const activeItem = useActiveItem(items);

  const resolveLabel = (item: SidebarItem) =>
    item.labelKey ? t(item.labelKey) : item.label ?? "";

  const handleItemClick = (item: SidebarItem) => {
    if (item.id === "logout") {
      void logout();
      return;
    }
    if (item.href) {
      router.push(item.href);
    }
    if (isMobile) {
      onToggle();
    }
  };

  const variants = isMobile ? mobileSidebarVariants : sidebarVariants;
  const animateState = isMobile
    ? "visible"
    : isCollapsed
      ? "collapsed"
      : "expanded";
  const initialState = isMobile ? "hidden" : "initial";

  return (
    <motion.aside
      initial={initialState}
      animate={animateState}
      exit={isMobile ? "hidden" : undefined}
      variants={variants}
      transition={
        isMobile
          ? { type: "spring", damping: 26, stiffness: 260 }
          : { duration: SIDEBAR_DURATION, ease: SIDEBAR_EASE }
      }
      className={cn(
        "fixed right-0 top-0 h-screen bg-sidebar overflow-hidden",
        "flex flex-col border-l border-sidebar-border text-sidebar-foreground",
        !isCollapsed ? "px-4 sm:px-5" : "px-3 sm:px-4",
        isMobile
          ? "z-50 w-[min(100vw-1rem,var(--dashboard-sidebar-expanded))] max-w-[var(--dashboard-sidebar-expanded)] shadow-[-8px_0_30px_rgba(0,0,0,0.2)]"
          : "z-40"
      )}
    >
      <SidebarHeader
        isCollapsed={isCollapsed}
        onToggle={onToggle}
        translationNamespace={translationNamespace}
      />

      <nav className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain pt-4">

        <SidebarNavSection
          items={items.main}
          isCollapsed={isCollapsed}
          activeItemId={activeItem}
          resolveLabel={resolveLabel}
          onItemClick={handleItemClick}
        />

        <div className="mt-auto space-y-2 pt-4">
          <div className="my-2 border-t border-sidebar-border" />
          <SidebarNavSection
            items={items.secondary}
            startIndex={items.main.length}
            isCollapsed={isCollapsed}
            activeItemId={activeItem}
            resolveLabel={resolveLabel}
            onItemClick={handleItemClick}
          />
        </div>
      </nav>
    </motion.aside>
  );
};
