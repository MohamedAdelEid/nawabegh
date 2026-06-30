"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { schoolAnnouncementsQueryKeys } from "@/modules/school/application/constants/schoolAnnouncementsQueryKeys";
import {
  archiveSchoolAnnouncement,
  createSchoolAnnouncement,
  deleteSchoolAnnouncement,
  resendSchoolAnnouncement,
} from "@/modules/school/infrastructure/api/schoolAnnouncementsApi";
import type { UpsertSchoolAnnouncementPayload } from "@/modules/school/domain/types/schoolAnnouncements.types";

export function useSchoolAnnouncementMutations() {
  const queryClient = useQueryClient();

  const invalidateAll = () =>
    queryClient.invalidateQueries({ queryKey: schoolAnnouncementsQueryKeys.all });

  const create = useMutation({
    mutationFn: (payload: UpsertSchoolAnnouncementPayload) => createSchoolAnnouncement(payload),
    onSuccess: invalidateAll,
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteSchoolAnnouncement(id),
    onSuccess: invalidateAll,
  });

  const resend = useMutation({
    mutationFn: (id: string) => resendSchoolAnnouncement(id),
    onSuccess: invalidateAll,
  });

  const archive = useMutation({
    mutationFn: (id: string) => archiveSchoolAnnouncement(id),
    onSuccess: invalidateAll,
  });

  return { create, remove, resend, archive };
}
