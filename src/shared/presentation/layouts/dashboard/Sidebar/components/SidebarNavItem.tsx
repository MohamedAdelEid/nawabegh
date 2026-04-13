import type React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/shared/application/lib/cn";
import type { SidebarItem } from "@/shared/domain/types/sidebar.types";
import { textVariants, itemVariants, SIDEBAR_DURATION, SIDEBAR_EASE } from "../constants/animations";

interface SidebarNavItemProps {
  item: SidebarItem;
  displayLabel: string;
  index: number;
  isCollapsed: boolean;
  isActive: boolean;
  onClick: () => void;
}

export const SidebarNavItem: React.FC<SidebarNavItemProps> = ({
  item,
  displayLabel,
  index,
  isCollapsed,
  isActive,
  onClick,
}) => {
  const Icon = item.icon;

  return (
    <motion.button
      layout
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      custom={index}
      transition={{ duration: SIDEBAR_DURATION, ease: SIDEBAR_EASE }}
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
        isCollapsed && "justify-center",
        isCollapsed && "w-fit",
        isActive
          ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
          : item.danger
            ? "text-red-300 hover:bg-red-950/40 hover:text-red-100"
            : "text-sidebar-foreground hover:bg-white/10 hover:text-white"
      )}
      aria-label={displayLabel}
      title={isCollapsed ? displayLabel : undefined}
    >
      {Icon && (
        <Icon
          className={cn(
            "w-5 h-5 shrink-0 transition-colors",
            isActive && "text-sidebar-primary-foreground"
          )}
          aria-hidden
        />
      )}
      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.span
            key="label"
            variants={textVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="text-md font-medium whitespace-nowrap overflow-hidden"
          >
            {displayLabel}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
};
