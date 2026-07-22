import type { QueryClient } from "@tanstack/react-query";
import { parentLearningQueryKeys } from "@/modules/parent/application/constants/parentLearningQueryKeys";
import { parentPaymentsQueryKeys } from "@/modules/parent/application/constants/parentPaymentsQueryKeys";

export async function invalidateParentEnrollmentCaches(
  queryClient: QueryClient,
  studentUserId: string,
) {
  await Promise.all([
    queryClient.invalidateQueries({
      queryKey: parentLearningQueryKeys.courses(studentUserId),
    }),
    queryClient.invalidateQueries({
      queryKey: [...parentLearningQueryKeys.all, "catalog"],
    }),
    queryClient.invalidateQueries({
      queryKey: parentPaymentsQueryKeys.dashboard(),
    }),
    queryClient.invalidateQueries({
      queryKey: parentPaymentsQueryKeys.all,
    }),
  ]);
}
