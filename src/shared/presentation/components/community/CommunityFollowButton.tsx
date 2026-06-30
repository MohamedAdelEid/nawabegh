"use client";

import { useEffect, useState } from "react";
import {
  followKnowledgeCommunityUser,
  unfollowKnowledgeCommunityUser,
} from "@/modules/teacher/infrastructure/api/knowledgeCommunityApi";
import { notify } from "@/shared/application/lib/toast";
import { Button } from "@/shared/presentation/components/ui/button";
import { cn } from "@/shared/application/lib/cn";
import { useCommunityTranslations } from "@/shared/presentation/components/community/useCommunityTranslations";

type CommunityFollowButtonProps = {
  userId: string;
  isFollowing: boolean;
  onFollowingChange?: (isFollowing: boolean) => void;
  className?: string;
  fullWidth?: boolean;
};

export function CommunityFollowButton({
  userId,
  isFollowing,
  onFollowingChange,
  className,
  fullWidth = false,
}: CommunityFollowButtonProps) {
  const t = useCommunityTranslations("author");
  const [following, setFollowing] = useState(isFollowing);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setFollowing(isFollowing);
  }, [isFollowing]);

  const toggle = async () => {
    if (submitting) return;
    setSubmitting(true);
    const result = following
      ? await unfollowKnowledgeCommunityUser(userId)
      : await followKnowledgeCommunityUser(userId);
    setSubmitting(false);

    if (result.errorMessage) {
      notify.error(result.errorMessage);
      return;
    }

    const next = !following;
    setFollowing(next);
    onFollowingChange?.(next);
    notify.success(next ? t("followSuccess") : t("unfollowSuccess"));
  };

  return (
    <Button
      type="button"
      variant={following ? "default" : "outline"}
      disabled={submitting}
      className={cn("rounded-xl", fullWidth && "w-full", className)}
      onClick={() => void toggle()}
    >
      {following ? t("unfollow") : t("follow")}
    </Button>
  );
}
