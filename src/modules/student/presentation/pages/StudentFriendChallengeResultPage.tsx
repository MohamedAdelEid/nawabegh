import { FriendChallengeResultView } from "@/modules/student/presentation/components/friend-challenge/FriendChallengeResultView";

type StudentFriendChallengeResultPageProps = {
  sessionId: string;
};

export function StudentFriendChallengeResultPage({
  sessionId,
}: StudentFriendChallengeResultPageProps) {
  return <FriendChallengeResultView sessionId={sessionId} />;
}
