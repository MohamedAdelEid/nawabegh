"use client";

import { FriendChallengeDetailDashboard } from "@/modules/admin/presentation/components/friend-challenges";

export function AdminFriendChallengeDetailPage({ challengeId }: { challengeId: string }) {
  return <FriendChallengeDetailDashboard challengeId={challengeId} />;
}
