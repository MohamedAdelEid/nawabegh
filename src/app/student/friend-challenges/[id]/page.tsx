import { StudentFriendChallengeDetailPage } from "@/modules/student/presentation/pages/StudentFriendChallengeDetailPage";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function StudentFriendChallengeDetailRoute({ params }: PageProps) {
  const { id } = await params;
  return <StudentFriendChallengeDetailPage challengeId={id} />;
}
