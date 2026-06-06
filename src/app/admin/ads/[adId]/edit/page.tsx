import { AdminAdEditPage } from "@/modules/admin/presentation/pages/AdminAdEditPage";

type PageProps = {
  params: Promise<{ adId: string }>;
};

export default async function Page({ params }: PageProps) {
  const { adId } = await params;
  return <AdminAdEditPage adId={adId} />;
}
