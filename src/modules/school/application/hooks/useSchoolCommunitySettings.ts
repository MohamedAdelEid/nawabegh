"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/shared/application/hooks/useAuth";
import { schoolCommunityQueryKeys } from "@/modules/school/application/constants/schoolCommunityQueryKeys";
import {
  getSchoolCommunitySettings,
  patchSchoolCommunitySettings,
} from "@/modules/school/infrastructure/api/schoolCommunityApi";
import type {
  SchoolCommunityFeedSort,
  SchoolCommunityModerationMode,
  SchoolCommunityPatchSettingsPayload,
  SchoolCommunityPrivacyMode,
  SchoolCommunitySettings,
} from "@/modules/school/domain/types/schoolCommunity.types";

export function useSchoolCommunitySettings() {
  const auth = useAuth();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<SchoolCommunitySettings | null>(null);
  const [isInheritedFromGlobal, setIsInheritedFromGlobal] = useState(false);

  const query = useQuery({
    queryKey: schoolCommunityQueryKeys.settings(),
    queryFn: getSchoolCommunitySettings,
    enabled: auth.user?.role === "School",
  });

  useEffect(() => {
    if (!query.data) return;
    setForm(query.data.settings);
    setIsInheritedFromGlobal(query.data.isInheritedFromGlobal);
  }, [query.data]);

  const save = useMutation({
    mutationFn: (payload: SchoolCommunityPatchSettingsPayload) =>
      patchSchoolCommunitySettings(payload),
    onSuccess: async (data) => {
      setForm(data.settings);
      setIsInheritedFromGlobal(data.isInheritedFromGlobal);
      await queryClient.invalidateQueries({ queryKey: schoolCommunityQueryKeys.settings() });
    },
  });

  const patchForm = async <K extends keyof SchoolCommunitySettings>(
    key: K,
    value: SchoolCommunitySettings[K],
  ) => {
    setForm((current) => (current ? { ...current, [key]: value } : current));
    await save.mutateAsync({ [key]: value } as SchoolCommunityPatchSettingsPayload);
  };

  return {
    form,
    isInheritedFromGlobal,
    isLoading: query.isLoading,
    isError: query.isError,
    isSaving: save.isPending,
    error: query.error ?? save.error,
    refetch: query.refetch,
    setPrivacyMode: (privacyMode: SchoolCommunityPrivacyMode) =>
      patchForm("privacyMode", privacyMode),
    setModerationMode: (moderationMode: SchoolCommunityModerationMode) =>
      patchForm("moderationMode", moderationMode),
    setFeedSortDefault: (feedSortDefault: SchoolCommunityFeedSort) =>
      patchForm("feedSortDefault", feedSortDefault),
    setEnablePublishing: (enablePublishing: boolean) =>
      patchForm("enablePublishing", enablePublishing),
    setEnableComments: (enableComments: boolean) => patchForm("enableComments", enableComments),
    setEnableLikes: (enableLikes: boolean) => patchForm("enableLikes", enableLikes),
    setEnableRatings: (enableRatings: boolean) => patchForm("enableRatings", enableRatings),
    setEnableFollowing: (enableFollowing: boolean) =>
      patchForm("enableFollowing", enableFollowing),
  };
}
