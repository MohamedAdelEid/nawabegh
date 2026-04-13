import type React from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { PanelRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { logoVariants, SIDEBAR_DURATION, SIDEBAR_EASE } from "../constants/animations";

interface SidebarHeaderProps {
  isCollapsed: boolean;
  onToggle: () => void;
  translationNamespace: string;
}

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({
  isCollapsed,
  onToggle,
  translationNamespace,
}) => {
  const t = useTranslations(translationNamespace);
  return (
    <div className={`flex items-center ${isCollapsed ? "justify-center" : "justify-between"} h-18 border-b border-sidebar-border`}>
      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.div
            variants={logoVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex flex-1 items-center gap-3 relative h-full"
          >
            <div className="absolute inset-0 rounded-full bg-white/10 blur-xl" />
            <Image
              src="/images/Logo.svg"
              alt="Logo"
              width={50}
              height={50}
              className="flex-1 max-w-36"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={onToggle}
        className="rounded-lg border border-white/25 p-1 text-white transition-colors hover:border-white/50 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
        aria-label={
          isCollapsed ? t("sidebar.toggleExpand") : t("sidebar.toggleCollapse")
        }
      >
        <motion.div
          animate={{ rotate: isCollapsed ? 180 : 0 }}
          transition={{ duration: SIDEBAR_DURATION, ease: SIDEBAR_EASE }}
        >
          <PanelRight className="h-5 w-5" aria-hidden />
        </motion.div>
      </button>
    </div>
  );
};
