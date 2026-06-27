"use client";

import type { CourseDetailsInitialData } from "@/modules/student/application/hooks/useCourseDetails";
import { CheckoutDashboard } from "@/modules/student/presentation/components/checkout/CheckoutDashboard";

type StudentCheckoutPageProps = {
  courseId: string;
  initial?: CourseDetailsInitialData;
};

export function StudentCheckoutPage({ courseId, initial }: StudentCheckoutPageProps) {
  return <CheckoutDashboard courseId={courseId} initial={initial} />;
}
