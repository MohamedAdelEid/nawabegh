import type React from "react";
import { motion } from "framer-motion";
import { cn } from "@/shared/application/lib/cn";
import { Header } from "../Header";
import { DashboardBody } from "./DashboardBody";
import {
  SIDEBAR_DURATION,
  SIDEBAR_EASE,
  SIDEBAR_WIDTH_COLLAPSED,
  SIDEBAR_WIDTH_EXPANDED,
} from "../Sidebar/constants/animations";

interface DashboardContentProps {
  children: React.ReactNode;
  translationNamespace: string;
  isMobile: boolean;
  isSidebarCollapsed: boolean;
  isMobileMenuOpen: boolean;
  onMobileMenuToggle: () => void;
}

export const DashboardContent: React.FC<DashboardContentProps> = ({
  children,
  translationNamespace,
  isMobile,
  isSidebarCollapsed,
  isMobileMenuOpen,
  onMobileMenuToggle,
}) => {
  return (
    <motion.div
      initial={false}
      animate={
        !isMobile
          ? {
              marginRight: isSidebarCollapsed
                ? SIDEBAR_WIDTH_COLLAPSED
                : SIDEBAR_WIDTH_EXPANDED,
            }
          : { marginRight: 0 }
      }
      transition={{ duration: SIDEBAR_DURATION, ease: SIDEBAR_EASE }}
      className={cn("flex-1", isMobile && isMobileMenuOpen && "overflow-hidden")}
    >
      <div className="sticky top-0 z-20">
        <Header
          translationNamespace={translationNamespace}
          onMobileMenuToggle={onMobileMenuToggle}
          isMobileMenuOpen={isMobileMenuOpen}
        />
      </div>
      <DashboardBody>{children}</DashboardBody>
    </motion.div>
  );
};
