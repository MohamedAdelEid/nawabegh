import { AdminPricingSubscriptionDetailsPage } from "@/modules/admin/presentation/pages/AdminPricingSubscriptionDetailsPage";

type PricingSubscriptionDetailsRouteParams = {
  params: Promise<{ subscriptionId: string }>;
};

export default async function PricingSubscriptionDetailsRoute({
  params,
}: PricingSubscriptionDetailsRouteParams) {
  const { subscriptionId } = await params;
  return <AdminPricingSubscriptionDetailsPage subscriptionId={subscriptionId} />;
}
