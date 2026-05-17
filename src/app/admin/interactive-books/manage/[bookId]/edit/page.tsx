import { AdminInteractiveBookManagePage } from "@/modules/admin/presentation/pages/AdminInteractiveBookManagePage";

type InteractiveBookManageEditRouteParams = {
  params: Promise<{ bookId: string }>;
};

export default async function InteractiveBookManageEditRoute({
  params,
}: InteractiveBookManageEditRouteParams) {
  const { bookId } = await params;
  return <AdminInteractiveBookManagePage editBookId={bookId} />;
}
