"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useFriendChallengeDetail } from "@/modules/student/application/hooks/useFriendChallengeHub";
import {
  FriendChallengeInviterWaitingView,
  FriendChallengePendingView,
} from "@/modules/student/presentation/components/friend-challenge/FriendChallengePendingView";
import { FriendChallengeInviteModal } from "@/modules/student/presentation/components/friend-challenge/FriendChallengeInviteModal";
import { ROUTES } from "@/shared/infrastructure/config/routes";

type StudentFriendChallengeDetailPageProps = {
  challengeId: string;
};

export function StudentFriendChallengeDetailPage({
  challengeId,
}: StudentFriendChallengeDetailPageProps) {
  const router = useRouter();
  const detailQuery = useFriendChallengeDetail(challengeId);
  const item = detailQuery.data;

  useEffect(() => {
    if (!item) return;
    if (item.status === "Accepted" || item.status === "InProgress") {
      router.replace(ROUTES.USER.STUDENT.FRIEND_CHALLENGES.UPCOMING(challengeId));
    }
  }, [challengeId, item, router]);

  if (detailQuery.isLoading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-[#2b415e]" />
      </div>
    );
  }

  if (!item) {
    return null;
  }

  if (item.canAccept || item.canDecline) {
    return (
      <FriendChallengeInviteModal
        challengeId={challengeId}
        onClose={() => router.push(ROUTES.USER.STUDENT.FRIEND_CHALLENGES.HUB)}
        onAccepted={() =>
          router.push(ROUTES.USER.STUDENT.FRIEND_CHALLENGES.UPCOMING(challengeId))
        }
        onError={() => undefined}
      />
    );
  }

  if (item.status === "Pending" && item.role === "inviter") {
    return <FriendChallengeInviterWaitingView challengeId={challengeId} />;
  }

  if (item.status === "Pending") {
    return <FriendChallengePendingView challengeId={challengeId} />;
  }

  if (item.status === "Accepted" || item.status === "InProgress") {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-[#2b415e]" />
      </div>
    );
  }

  return <FriendChallengePendingView challengeId={challengeId} />;
}
