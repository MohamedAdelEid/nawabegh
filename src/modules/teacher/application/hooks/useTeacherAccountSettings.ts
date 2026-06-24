"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { useAuth } from "@/shared/application/hooks/useAuth";
import type {
  TeacherAccountFormValues,
  TeacherAccountSettingsUpdatePayload,
  TeacherChangePasswordPayload,
} from "@/modules/teacher/domain/types/teacherAccount.types";
import {
  changeTeacherPassword,
  fetchTeacherAccountSettings,
  mapTeacherAccountSettingsToFormValues,
  updateTeacherAccountSettings,
  uploadTeacherAvatar,
} from "@/modules/teacher/infrastructure/api/teacherAccountApi";

export const TEACHER_ACCOUNT_SETTINGS_QUERY_KEY = ["teacher", "account", "settings"] as const;

export function buildTeacherAccountUpdatePayload(
  values: TeacherAccountFormValues,
): TeacherAccountSettingsUpdatePayload {
  const years = values.yearsOfExperience.trim();
  return {
    fullName: values.fullName.trim(),
    jobTitle: values.jobTitle.trim(),
    schoolName: values.schoolName.trim(),
    phoneNumber: values.phoneNumber.trim(),
    phoneCountryCode: Number(values.phoneCountryCode) || 20,
    countryId: Number(values.countryId),
    city: values.city.trim() || undefined,
    address: values.address.trim() || undefined,
    about: values.about.trim() || undefined,
    yearsOfExperience: years ? Number(years) : undefined,
    profileImageUrl: values.profileImageUrl,
  };
}

export function useTeacherAccountSettings() {
  const auth = useAuth();
  const queryClient = useQueryClient();

  const settingsQuery = useQuery({
    queryKey: TEACHER_ACCOUNT_SETTINGS_QUERY_KEY,
    queryFn: fetchTeacherAccountSettings,
    enabled: auth.user?.role === "Teacher",
  });

  const updateMutation = useMutation({
    mutationFn: updateTeacherAccountSettings,
    onSuccess: (data) => {
      queryClient.setQueryData(TEACHER_ACCOUNT_SETTINGS_QUERY_KEY, data);
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: changeTeacherPassword,
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: uploadTeacherAvatar,
  });

  const initialFormValues = useMemo(
    () => (settingsQuery.data ? mapTeacherAccountSettingsToFormValues(settingsQuery.data) : null),
    [settingsQuery.data],
  );

  const saveSettings = async (values: TeacherAccountFormValues) => {
    let nextValues = { ...values };

    if (values.avatarFile) {
      const uploadResult = await uploadAvatarMutation.mutateAsync(values.avatarFile);
      if (!uploadResult.ok) {
        throw new Error(uploadResult.errorMessage);
      }
      nextValues = {
        ...nextValues,
        profileImageUrl: uploadResult.filePath,
        avatarFile: null,
      };
    }

    const payload = buildTeacherAccountUpdatePayload(nextValues);
    const updated = await updateMutation.mutateAsync(payload);

    const hasPasswordInput =
      values.currentPassword.trim() ||
      values.newPassword.trim() ||
      values.confirmPassword.trim();

    if (hasPasswordInput) {
      const passwordPayload: TeacherChangePasswordPayload = {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      };
      await changePasswordMutation.mutateAsync(passwordPayload);
    }

    return {
      data: updated,
      formValues: {
        ...mapTeacherAccountSettingsToFormValues(updated),
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      },
    };
  };

  return {
    data: settingsQuery.data ?? null,
    initialFormValues,
    isLoading: settingsQuery.isLoading,
    isError: settingsQuery.isError,
    error: settingsQuery.error,
    refetch: settingsQuery.refetch,
    saveSettings,
    isSaving:
      updateMutation.isPending ||
      changePasswordMutation.isPending ||
      uploadAvatarMutation.isPending,
  };
}
