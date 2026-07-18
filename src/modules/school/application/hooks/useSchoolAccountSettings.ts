"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { schoolAccountQueryKeys } from "@/modules/school/application/constants/schoolAccountQueryKeys";
import type {
  SchoolAccountFormValues,
  SchoolAccountNotifications,
  SchoolAccountSettingsData,
  SchoolChangePasswordPayload,
  UpdateSchoolAccountNotificationsPayload,
} from "@/modules/school/domain/types/schoolAccount.types";
import {
  buildSchoolAccountUpdatePayload,
  changeSchoolPassword,
  fetchSchoolAccountSettings,
  mapSchoolAccountSettingsToFormValues,
  removeSchoolAccountSession,
  revokeAllSchoolAccountSessions,
  updateSchoolAccountNotifications,
  updateSchoolAccountSettings,
  uploadSchoolAccountImage,
} from "@/modules/school/infrastructure/api/schoolAccountApi";
import { useAuth } from "@/shared/application/hooks/useAuth";

export function useSchoolAccountSettings() {
  const auth = useAuth();
  const queryClient = useQueryClient();
  const settingsKey = schoolAccountQueryKeys.settings();

  const settingsQuery = useQuery({
    queryKey: settingsKey,
    queryFn: fetchSchoolAccountSettings,
    enabled: auth.user?.role === "School",
  });

  const updateMutation = useMutation({
    mutationFn: updateSchoolAccountSettings,
    onSuccess: (data) => {
      queryClient.setQueryData(settingsKey, data);
    },
  });

  const notificationsMutation = useMutation({
    mutationFn: updateSchoolAccountNotifications,
    onSuccess: (notifications) => {
      queryClient.setQueryData<SchoolAccountSettingsData>(settingsKey, (current) => {
        if (!current) return current;
        return { ...current, notifications };
      });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: changeSchoolPassword,
  });

  const uploadImageMutation = useMutation({
    mutationFn: ({ file, kind }: { file: File; kind: "logo" | "cover" }) =>
      uploadSchoolAccountImage(file, kind),
  });

  const removeSessionMutation = useMutation({
    mutationFn: removeSchoolAccountSession,
    onSuccess: (_result, sessionId) => {
      queryClient.setQueryData<SchoolAccountSettingsData>(settingsKey, (current) => {
        if (!current) return current;
        return {
          ...current,
          sessions: current.sessions.filter((session) => session.id !== sessionId),
        };
      });
    },
  });

  const revokeAllMutation = useMutation({
    mutationFn: () => revokeAllSchoolAccountSessions(true),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: settingsKey });
    },
  });

  const initialFormValues = useMemo(
    () => (settingsQuery.data ? mapSchoolAccountSettingsToFormValues(settingsQuery.data) : null),
    [settingsQuery.data],
  );

  const saveSettings = async (values: SchoolAccountFormValues) => {
    let nextValues = { ...values };

    if (values.logoFile) {
      const uploadResult = await uploadImageMutation.mutateAsync({
        file: values.logoFile,
        kind: "logo",
      });
      if (!uploadResult.ok) {
        throw new Error(uploadResult.errorMessage);
      }
      nextValues = {
        ...nextValues,
        logoUrl: uploadResult.filePath,
        logoFile: null,
      };
    }

    if (values.coverFile) {
      const uploadResult = await uploadImageMutation.mutateAsync({
        file: values.coverFile,
        kind: "cover",
      });
      if (!uploadResult.ok) {
        throw new Error(uploadResult.errorMessage);
      }
      nextValues = {
        ...nextValues,
        coverImageUrl: uploadResult.filePath,
        coverFile: null,
      };
    }

    const payload = buildSchoolAccountUpdatePayload(nextValues);
    const updated = await updateMutation.mutateAsync(payload);

    const hasPasswordInput =
      values.currentPassword.trim() ||
      values.newPassword.trim() ||
      values.confirmPassword.trim();

    if (hasPasswordInput) {
      const passwordPayload: SchoolChangePasswordPayload = {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword || values.newPassword,
      };
      await changePasswordMutation.mutateAsync(passwordPayload);
    }

    return {
      data: updated,
      formValues: {
        ...mapSchoolAccountSettingsToFormValues(updated),
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      },
    };
  };

  const saveNotifications = async (payload: UpdateSchoolAccountNotificationsPayload) => {
    const previous = settingsQuery.data?.notifications;
    queryClient.setQueryData<SchoolAccountSettingsData>(settingsKey, (current) => {
      if (!current) return current;
      return { ...current, notifications: payload };
    });

    try {
      return await notificationsMutation.mutateAsync(payload);
    } catch (error) {
      if (previous) {
        queryClient.setQueryData<SchoolAccountSettingsData>(settingsKey, (current) => {
          if (!current) return current;
          return { ...current, notifications: previous };
        });
      }
      throw error;
    }
  };

  return {
    data: settingsQuery.data ?? null,
    initialFormValues,
    isLoading: settingsQuery.isLoading,
    isError: settingsQuery.isError,
    error: settingsQuery.error,
    refetch: settingsQuery.refetch,
    saveSettings,
    saveNotifications,
    removeSession: removeSessionMutation.mutateAsync,
    revokeAllSessions: revokeAllMutation.mutateAsync,
    isSaving:
      updateMutation.isPending ||
      changePasswordMutation.isPending ||
      uploadImageMutation.isPending,
    isUpdatingNotifications: notificationsMutation.isPending,
    isRemovingSession: removeSessionMutation.isPending,
    isRevokingAll: revokeAllMutation.isPending,
    removingSessionId: removeSessionMutation.isPending
      ? (removeSessionMutation.variables as string | undefined)
      : undefined,
  };
}

export type { SchoolAccountNotifications };
