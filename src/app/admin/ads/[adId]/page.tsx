import { AdminAdDetailPage } from "@/modules/admin/presentation/pages/AdminAdDetailPage";

type PageProps = {
  params: Promise<{ adId: string }>;
};

export default async function Page({ params }: PageProps) {
  const { adId } = await params;
  return <AdminAdDetailPage adId={adId} />;
}
