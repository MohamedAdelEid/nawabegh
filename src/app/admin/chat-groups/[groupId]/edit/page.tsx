import { AdminEditChatGroupPage } from "@/modules/admin/presentation/pages/AdminEditChatGroupPage";

type EditChatGroupRouteParams = {
  params: Promise<{ groupId: string }>;
};

export default async function EditChatGroupRoute({ params }: EditChatGroupRouteParams) {
  const { groupId } = await params;
  return <AdminEditChatGroupPage groupId={groupId} />;
}
