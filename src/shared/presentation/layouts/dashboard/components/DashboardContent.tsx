import type React from "react";
import { motion } from "framer-motion";
import { cn } from "@/shared/application/lib/cn";
import { Header } from "../Header";
import { StudentDashboardHeader } from "../Header/StudentDashboardHeader";
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
  variant: "admin" | "student" | "teacher" | "parent" | "school";
  isMobile: boolean;
  isSidebarCollapsed: boolean;
  isMobileMenuOpen: boolean;
  onMobileMenuToggle: () => void;
}

export const DashboardContent: React.FC<DashboardContentProps> = ({
  children,
  translationNamespace,
  variant,
  isMobile,
  isSidebarCollapsed,
  isMobileMenuOpen,
  onMobileMenuToggle,
}) => {
  const HeaderComponent = variant === "student" ? StudentDashboardHeader : Header;

  return (
    <motion.div
      initial={false}
      animate={
        !isMobile
          ? {
              marginInlineStart: isSidebarCollapsed
                ? SIDEBAR_WIDTH_COLLAPSED
                : SIDEBAR_WIDTH_EXPANDED,
            }
          : { marginInlineStart: 0 }
      }
      transition={{ duration: SIDEBAR_DURATION, ease: SIDEBAR_EASE }}
      className={cn("flex-1 print:!m-0", isMobile && isMobileMenuOpen && "overflow-hidden")}
    >
      <div className="sticky top-0 z-20 print:hidden">
        <HeaderComponent
          translationNamespace={translationNamespace}
          onMobileMenuToggle={onMobileMenuToggle}
          isMobileMenuOpen={isMobileMenuOpen}
        />
      </div>
      <DashboardBody>{children}</DashboardBody>
    </motion.div>
  );
};
