import { AdminBundleFormPage } from "@/modules/admin/presentation/pages/AdminBundleFormPage";

type EditBundlePageProps = {
  params: Promise<{ bundleId: string }>;
};

export default async function EditBundlePage({ params }: EditBundlePageProps) {
  const { bundleId } = await params;
  return <AdminBundleFormPage bundleId={bundleId} />;
}
