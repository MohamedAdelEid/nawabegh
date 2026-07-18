"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { parentProfileQueryKeys } from "@/modules/parent/application/constants/parentProfileQueryKeys";
import type {
  ParentChangePasswordPayload,
  UpdateParentProfilePayload,
} from "@/modules/parent/domain/types/parentProfile.types";
import {
  changeParentPassword,
  fetchParentProfile,
  updateParentProfile,
} from "@/modules/parent/infrastructure/api/parentProfileApi";
import { useAuth } from "@/shared/application/hooks/useAuth";

export function useParentProfile() {
  const auth = useAuth();
  const queryClient = useQueryClient();
  const profileKey = parentProfileQueryKeys.detail();

  const profileQuery = useQuery({
    queryKey: profileKey,
    queryFn: fetchParentProfile,
    enabled: auth.user?.role?.toLowerCase() === "parent",
  });

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateParentProfilePayload) =>
      updateParentProfile(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: profileKey });
    },
  });

  const passwordMutation = useMutation({
    mutationFn: (payload: ParentChangePasswordPayload) =>
      changeParentPassword(payload),
  });

  return {
    data: profileQuery.data,
    isLoading: profileQuery.isLoading,
    isError: profileQuery.isError,
    refetch: profileQuery.refetch,
    updateProfile: updateMutation.mutateAsync,
    changePassword: passwordMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    isChangingPassword: passwordMutation.isPending,
  };
}
