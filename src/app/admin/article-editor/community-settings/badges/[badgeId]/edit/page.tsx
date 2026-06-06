import { AdminCommunityBadgeEditPage } from "@/modules/admin/presentation/pages/AdminCommunityBadgeEditPage";

type PageProps = {
  params: Promise<{ badgeId: string }>;
};

export default async function Page({ params }: PageProps) {
  const { badgeId } = await params;
  return <AdminCommunityBadgeEditPage badgeId={badgeId} />;
}
