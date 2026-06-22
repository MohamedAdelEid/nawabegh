"use client";

import { StudentEnrollmentDetailView } from "@/modules/admin/presentation/components/payments";

type AdminPaymentEnrollmentDetailPageProps = {
  enrollmentId: string;
};

export function AdminPaymentEnrollmentDetailPage({
  enrollmentId,
}: AdminPaymentEnrollmentDetailPageProps) {
  return <StudentEnrollmentDetailView enrollmentId={enrollmentId} />;
}
