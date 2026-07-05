import { FriendChallengeDuelArena } from "@/modules/student/presentation/components/friend-challenge/FriendChallengeDuelArena";

type StudentFriendChallengeDuelPageProps = {
  sessionId: string;
};

export function StudentFriendChallengeDuelPage({ sessionId }: StudentFriendChallengeDuelPageProps) {
  return <FriendChallengeDuelArena sessionId={sessionId} />;
}
