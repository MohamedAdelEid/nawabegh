import { AdminFriendChallengeDetailPage } from "@/modules/admin/presentation/pages/AdminFriendChallengeDetailPage";

type PageProps = {
  params: Promise<{ challengeId: string }>;
};

export default async function Page({ params }: PageProps) {
  const { challengeId } = await params;
  return <AdminFriendChallengeDetailPage challengeId={challengeId} />;
}
