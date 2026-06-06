"use client";

import { CommunityBadgeFormPage } from "./CommunityBadgeFormPage";

type AdminCommunityBadgeEditPageProps = {
  badgeId: string;
};

export function AdminCommunityBadgeEditPage({ badgeId }: AdminCommunityBadgeEditPageProps) {
  return <CommunityBadgeFormPage mode="edit" badgeId={badgeId} />;
}
