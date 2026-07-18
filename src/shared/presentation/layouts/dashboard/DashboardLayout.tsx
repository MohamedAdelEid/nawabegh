"use client";

import type React from "react";
import { AnimatePresence } from "framer-motion";
import { Sidebar } from "./Sidebar";
import { MobileOverlay, DashboardContent } from "./components";
import { useMobileDetection, useDashboardState } from "./hooks";
import { adminSidebarItems } from "@/modules/admin/domain/data/adminSidebarItems";
import { studentSidebarItems } from "@/modules/student/domain/data/studentSidebarItems";
import { teacherSidebarItems } from "@/modules/teacher/domain/data/teacherSidebarItems";
import { schoolSidebarItems } from "@/modules/school/domain/data/schoolSidebarItems";
import { parentSidebarItems } from "@/modules/parent/domain/data/parentSidebarItems";
import type { SidebarItems } from "@/shared/domain/types/sidebar.types";

export type DashboardShellVariant =
  | "admin"
  | "student"
  | "teacher"
  | "parent"
  | "school";

interface DashboardLayoutProps {
  children: React.ReactNode;
  /**
   * Which shell to show. Must be a plain string so Server Components can pass it;
   * sidebar items (with icon components) are resolved only inside this client boundary.
   */
  variant: DashboardShellVariant;
}

function sidebarForVariant(variant: DashboardShellVariant): SidebarItems {
  if (variant === "admin") return adminSidebarItems;
  if (variant === "teacher") return teacherSidebarItems;
  if (variant === "school") return schoolSidebarItems;
  if (variant === "parent") return parentSidebarItems;
  return studentSidebarItems;
}

function intlNamespaceForVariant(variant: DashboardShellVariant): string {
  if (variant === "admin") return "admin.dashboard";
  if (variant === "teacher") return "teacher.dashboard";
  if (variant === "school") return "school.dashboard";
  if (variant === "parent") return "parent.dashboard";
  return "student.dashboard";
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  variant,
}) => {
  const sidebarItems: SidebarItems = sidebarForVariant(variant);
  const translationNamespace = intlNamespaceForVariant(variant);
  const isMobile = useMobileDetection();
  const { isSidebarCollapsed, isMobileMenuOpen, toggleSidebar, closeMobileMenu } =
    useDashboardState(isMobile);

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence>
        {isMobile && isMobileMenuOpen && <MobileOverlay onClick={closeMobileMenu} />}
      </AnimatePresence>

      <AnimatePresence>
        {(!isMobile || isMobileMenuOpen) && (
          <Sidebar
            items={sidebarItems}
            translationNamespace={translationNamespace}
            isCollapsed={isMobile ? false : isSidebarCollapsed}
            onToggle={isMobile ? closeMobileMenu : toggleSidebar}
            isMobile={isMobile}
          />
        )}
      </AnimatePresence>

      <DashboardContent
        translationNamespace={translationNamespace}
        variant={variant}
        isMobile={isMobile}
        isSidebarCollapsed={isSidebarCollapsed}
        isMobileMenuOpen={isMobileMenuOpen}
        onMobileMenuToggle={toggleSidebar}
      >
        {children}
      </DashboardContent>
    </div>
  );
};

export default DashboardLayout;
