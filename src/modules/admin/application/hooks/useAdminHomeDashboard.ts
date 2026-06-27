"use client";

import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { getAdminHomeDashboard } from "@/modules/admin/infrastructure/api/adminDashboardApi";
import type { AdminHomeDashboardParams } from "@/modules/admin/domain/types/adminHomeDashboard.types";

export function useAdminHomeDashboard(params: AdminHomeDashboardParams = {}) {
  const locale = useLocale();

  return useQuery({
    queryKey: ["admin", "home-dashboard", params, locale],
    queryFn: () => getAdminHomeDashboard(params),
    placeholderData: (previousData) => previousData,
  });
}
