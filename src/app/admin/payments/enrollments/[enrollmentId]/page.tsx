import { AdminPaymentEnrollmentDetailPage } from "@/modules/admin/presentation/pages/AdminPaymentEnrollmentDetailPage";

type PageProps = {
  params: Promise<{ enrollmentId: string }>;
};

export default async function PaymentEnrollmentDetailRoute({ params }: PageProps) {
  const { enrollmentId } = await params;
  return <AdminPaymentEnrollmentDetailPage enrollmentId={enrollmentId} />;
}
