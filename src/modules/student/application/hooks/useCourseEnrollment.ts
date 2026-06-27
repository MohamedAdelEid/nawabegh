"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useCheckoutMutations } from "@/modules/student/application/hooks/useCheckoutFlow";
import { getCourseDetailsCtaVariant } from "@/modules/student/presentation/components/course-details/getCourseDetailsCta";
import type { CourseDetailsModel } from "@/shared/domain/types/course.types";
import { ROUTES } from "@/shared/infrastructure/config/routes";

export function useCourseEnrollment(course: CourseDetailsModel) {
  const router = useRouter();
  const { enrollFree } = useCheckoutMutations(course.id);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCtaClick = useCallback(async () => {
    const variant = getCourseDetailsCtaVariant(course);
    setError(null);

    if (variant === "continue") {
      document.getElementById("course-curriculum")?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    if (variant === "enrollFree") {
      setIsPending(true);
      try {
        await enrollFree.mutateAsync();
        router.push(ROUTES.USER.STUDENT.COURSE_DETAIL(course.id));
      } catch (err) {
        setError(err instanceof Error ? err.message : null);
      } finally {
        setIsPending(false);
      }
      return;
    }

    router.push(ROUTES.USER.STUDENT.COURSE_CHECKOUT(course.id));
  }, [course, enrollFree, router]);

  return {
    handleCtaClick,
    isPending: isPending || enrollFree.isPending,
    error,
    clearError: () => setError(null),
  };
}
