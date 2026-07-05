import { StudentFriendChallengeResultPage } from "@/modules/student/presentation/pages/StudentFriendChallengeResultPage";

type PageProps = {
  params: Promise<{ sessionId: string }>;
};

export default async function StudentFriendChallengeResultRoute({ params }: PageProps) {
  const { sessionId } = await params;
  return <StudentFriendChallengeResultPage sessionId={sessionId} />;
}
