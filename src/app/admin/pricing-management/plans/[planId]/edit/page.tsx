import { AdminPricingPlanFormPage } from "@/modules/admin/presentation/pages/AdminPricingPlanFormPage";

type PricingPlanEditRouteParams = {
  params: Promise<{ planId: string }>;
};

export default async function PricingPlanEditRoute({
  params,
}: PricingPlanEditRouteParams) {
  const { planId } = await params;
  return <AdminPricingPlanFormPage mode="edit" planId={planId} />;
}
