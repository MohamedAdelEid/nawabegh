import { StudentFriendChallengeUpcomingPage } from "@/modules/student/presentation/pages/StudentFriendChallengeUpcomingPage";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function StudentFriendChallengeUpcomingRoute({ params }: PageProps) {
  const { id } = await params;
  return <StudentFriendChallengeUpcomingPage challengeId={id} />;
}
