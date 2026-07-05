import { StudentFriendChallengeDuelPage } from "@/modules/student/presentation/pages/StudentFriendChallengeDuelPage";

type PageProps = {
  params: Promise<{ sessionId: string }>;
};

export default async function StudentFriendChallengeDuelRoute({ params }: PageProps) {
  const { sessionId } = await params;
  return <StudentFriendChallengeDuelPage sessionId={sessionId} />;
}
