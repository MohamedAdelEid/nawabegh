"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { teacherApi } from "@/modules/teacher/infrastructure/api/teacherApi";

export function useTeacherEndLiveSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => teacherApi.endLiveSession(sessionId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["teacher", "live-sessions"] }),
        queryClient.invalidateQueries({ queryKey: ["teacher", "live-analytics"] }),
        queryClient.invalidateQueries({ queryKey: ["teacher", "schedule"] }),
        queryClient.invalidateQueries({ queryKey: ["teacher", "session"] }),
      ]);
    },
  });
}
