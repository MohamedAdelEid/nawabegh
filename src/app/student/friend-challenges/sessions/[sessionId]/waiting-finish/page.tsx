import { StudentFriendChallengeWaitPage } from "@/modules/student/presentation/pages/StudentFriendChallengeWaitPage";

type PageProps = {
  params: Promise<{ sessionId: string }>;
};

export default async function StudentFriendChallengeWaitFinishRoute({ params }: PageProps) {
  const { sessionId } = await params;
  return <StudentFriendChallengeWaitPage sessionId={sessionId} mode="finish" />;
}
