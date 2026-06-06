"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { getUserManagementDetailsLayout } from "@/modules/admin/domain/data/userManagementDetailsData";
import {
  getParentUserDetail,
  getStudentUserDetail,
  getTeacherUserDetail,
  normalizeUserManagementRole,
} from "@/modules/admin/infrastructure/api/userManagementApi";
import { notify } from "@/shared/application/lib/toast";
import { buildProfileView } from "./buildProfileView";
import type {
  UserManagementParentChildRow,
  UserManagementRemoteDetail,
} from "./types";

export function useUserManagementDetail(userId: string) {
  const t = useTranslations("admin.dashboard");
  const searchParams = useSearchParams();
  const layout = useMemo(() => getUserManagementDetailsLayout(), []);
  const emptyLabel = t("userManagement.details.emptyValue");
  const [remoteDetail, setRemoteDetail] = useState<UserManagementRemoteDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadToken, setReloadToken] = useState(0);

  const reloadDetail = useCallback(() => {
    setReloadToken((current) => current + 1);
  }, []);

  useEffect(() => {
    let mounted = true;

    const fetchByRole = async (role: string) => {
      const normalizedRole = normalizeUserManagementRole(role);

      if (normalizedRole === "teacher") {
        const result = await getTeacherUserDetail(userId);
        return result.data ? ({ kind: "teacher", data: result.data } as const) : null;
      }
      if (normalizedRole === "parent") {
        const result = await getParentUserDetail(userId);
        return result.data ? ({ kind: "parent", data: result.data } as const) : null;
      }

      const result = await getStudentUserDetail(userId);
      return result.data ? ({ kind: "student", data: result.data } as const) : null;
    };

    const loadDetail = async () => {
      setIsLoading(true);
      setRemoteDetail(null);

      const preferredRole = searchParams.get("role");
      const roleCandidates = preferredRole
        ? [normalizeUserManagementRole(preferredRole)]
        : (["student", "teacher", "parent"] as const);

      for (const role of roleCandidates) {
        const result = await fetchByRole(role);
        if (!mounted) return;
        if (result) {
          setRemoteDetail(result);
          setIsLoading(false);
          return;
        }
      }

      if (mounted) {
        notify.error(t("userManagement.details.loadError"));
        setIsLoading(false);
      }
    };

    void loadDetail();

    return () => {
      mounted = false;
    };
  }, [reloadToken, searchParams, t, userId]);

  const profileView = useMemo(() => {
    if (!remoteDetail) return null;
    return buildProfileView(remoteDetail, t, emptyLabel);
  }, [emptyLabel, remoteDetail, t]);

  const teacherGrades =
    remoteDetail?.kind === "teacher"
      ? remoteDetail.data.assignedGrades.map((grade) => grade.gradeName).filter(Boolean)
      : [];

  const parentChildren: UserManagementParentChildRow[] =
    remoteDetail?.kind === "parent"
      ? remoteDetail.data.children.map((child) => ({
          id: child.studentUserId,
          fullName: child.fullName,
          username: child.username,
          gradeName: child.gradeName,
        }))
      : [];

  const pageTitle = profileView?.fullName ?? t("userManagement.details.page.loadingTitle");

  return {
    layout,
    emptyLabel,
    remoteDetail,
    isLoading,
    profileView,
    teacherGrades,
    parentChildren,
    pageTitle,
    reloadDetail,
    t,
  };
}
