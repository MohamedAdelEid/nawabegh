import { FriendChallengeUpcomingView } from "@/modules/student/presentation/components/friend-challenge/FriendChallengeUpcomingView";

type StudentFriendChallengeUpcomingPageProps = {
  challengeId: string;
};

export function StudentFriendChallengeUpcomingPage({
  challengeId,
}: StudentFriendChallengeUpcomingPageProps) {
  return <FriendChallengeUpcomingView challengeId={challengeId} />;
}
