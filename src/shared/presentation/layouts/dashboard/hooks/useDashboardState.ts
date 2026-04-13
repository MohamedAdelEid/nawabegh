import { useState, useEffect } from "react";

interface UseDashboardStateReturn {
  isSidebarCollapsed: boolean;
  isMobileMenuOpen: boolean;
  toggleSidebar: () => void;
  closeMobileMenu: () => void;
}

export const useDashboardState = (isMobile: boolean): UseDashboardStateReturn => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isMobile) setIsSidebarCollapsed(true);
  }, [isMobile]);

  const toggleSidebar = () => {
    if (isMobile) {
      setIsMobileMenuOpen(!isMobileMenuOpen);
    } else {
      setIsSidebarCollapsed(!isSidebarCollapsed);
    }
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return { isSidebarCollapsed, isMobileMenuOpen, toggleSidebar, closeMobileMenu };
};
