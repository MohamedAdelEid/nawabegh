"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import {
  getDashboardScopeFromPathname,
  getScopedDashboardRoutes,
} from "@/shared/infrastructure/config/scopedDashboardRoutes";

export function useScopedDashboardRoutes() {
  const pathname = usePathname();

  return useMemo(() => {
    const scope = getDashboardScopeFromPathname(pathname);
    return getScopedDashboardRoutes(scope);
  }, [pathname]);
}
