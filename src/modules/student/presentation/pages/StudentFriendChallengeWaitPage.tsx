import { FriendChallengeWaitView } from "@/modules/student/presentation/components/friend-challenge/FriendChallengeWaitView";

type StudentFriendChallengeWaitPageProps = {
  sessionId: string;
  mode: "opponent" | "finish";
};

export function StudentFriendChallengeWaitPage({
  sessionId,
  mode,
}: StudentFriendChallengeWaitPageProps) {
  return <FriendChallengeWaitView sessionId={sessionId} mode={mode} />;
}
