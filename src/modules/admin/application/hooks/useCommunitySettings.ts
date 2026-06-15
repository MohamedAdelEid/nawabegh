"use client";

import { useCallback, useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import {
  COMMUNITY_PRIVACY_MODE,
  type CommunitySettingsFormState,
} from "@/modules/admin/domain/types/communitySettings.types";
import {
  mapCommunitySettingsFormToUpdatePayload,
  mapCommunitySettingsToForm,
} from "@/modules/admin/domain/utils/communitySettingsMappers";
import {
  getCommunitySettings,
  updateCommunitySettings,
} from "@/modules/admin/infrastructure/api/communitySettingsApi";
import { notify } from "@/shared/application/lib/toast";

export const ADMIN_COMMUNITY_SETTINGS_QUERY_KEY = "admin-community-settings";

export function useCommunitySettings() {
  const t = useTranslations("admin.dashboard.articleEditor.communitySettings");
  const queryClient = useQueryClient();
  const [form, setForm] = useState<CommunitySettingsFormState | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const query = useQuery({
    queryKey: [ADMIN_COMMUNITY_SETTINGS_QUERY_KEY],
    queryFn: () => getCommunitySettings(),
  });

  const settings = query.data?.data ?? null;

  useEffect(() => {
    if (settings) {
      setForm(mapCommunitySettingsToForm(settings));
    }
  }, [settings]);

  const saveForm = useCallback(
    async (nextForm: CommunitySettingsFormState) => {
      if (!settings) return;

      const previousForm = form;
      setForm(nextForm);
      setIsSaving(true);

      const result = await updateCommunitySettings(
        mapCommunitySettingsFormToUpdatePayload(nextForm, settings),
      );

      setIsSaving(false);

      if (result.errorMessage || !result.data) {
        setForm(previousForm);
        notify.error(result.errorMessage ?? t("toast.saveError"));
        return;
      }

      queryClient.setQueryData([ADMIN_COMMUNITY_SETTINGS_QUERY_KEY], {
        ...query.data,
        data: result.data,
      });
    },
    [form, query.data, queryClient, settings, t],
  );

  const setPrivacyMode = useCallback(
    (privacyMode: (typeof COMMUNITY_PRIVACY_MODE)[keyof typeof COMMUNITY_PRIVACY_MODE]) => {
      if (!form) return;
      void saveForm({ ...form, privacyMode });
    },
    [form, saveForm],
  );

  const setEnablePublishing = useCallback(
    (enablePublishing: boolean) => {
      if (!form) return;
      void saveForm({ ...form, enablePublishing });
    },
    [form, saveForm],
  );

  const setEnableRatings = useCallback(
    (enableRatings: boolean) => {
      if (!form) return;
      void saveForm({ ...form, enableRatings });
    },
    [form, saveForm],
  );

  const setEnableComments = useCallback(
    (enableComments: boolean) => {
      if (!form) return;
      void saveForm({ ...form, enableComments });
    },
    [form, saveForm],
  );

  const setEnableLikes = useCallback(
    (enableLikes: boolean) => {
      if (!form) return;
      void saveForm({ ...form, enableLikes });
    },
    [form, saveForm],
  );

  const setEnableFollowing = useCallback(
    (enableFollowing: boolean) => {
      if (!form) return;
      void saveForm({ ...form, enableFollowing });
    },
    [form, saveForm],
  );

  return {
    form,
    settings,
    isLoading: query.isLoading,
    isSaving,
    errorMessage: query.data?.errorMessage,
    setPrivacyMode,
    setEnablePublishing,
    setEnableRatings,
    setEnableComments,
    setEnableLikes,
    setEnableFollowing,
    refetch: query.refetch,
  };
}
