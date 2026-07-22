"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { parentChildrenQueryKeys } from "@/modules/parent/application/constants/parentChildrenQueryKeys";
import { parentHomeQueryKeys } from "@/modules/parent/application/constants/parentHomeQueryKeys";
import {
  createParentChild,
  linkParentChild,
  unlinkParentChild,
} from "@/modules/parent/infrastructure/api/parentChildrenApi";
import type {
  ParentCreateChildRequest,
  ParentLinkChildRequest,
} from "@/modules/parent/domain/types/parentChildren.types";

function invalidateChildrenQueries(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: parentChildrenQueryKeys.all });
  void queryClient.invalidateQueries({ queryKey: parentHomeQueryKeys.all });
}

export function useCreateParentChild() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ParentCreateChildRequest) => createParentChild(payload),
    onSuccess: () => invalidateChildrenQueries(queryClient),
  });
}

export function useLinkParentChild() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ParentLinkChildRequest) => linkParentChild(payload),
    onSuccess: () => invalidateChildrenQueries(queryClient),
  });
}

export function useUnlinkParentChild() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (studentUserId: string) => unlinkParentChild(studentUserId),
    onSuccess: () => invalidateChildrenQueries(queryClient),
  });
}
