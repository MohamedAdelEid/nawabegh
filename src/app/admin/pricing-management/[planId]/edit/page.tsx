import { redirect } from "next/navigation";
import { ROUTES } from "@/shared/infrastructure/config/routes";

type PricingManagementEditRouteParams = {
  params: Promise<{ planId: string }>;
};

export default async function PricingManagementEditLegacyRoute({
  params,
}: PricingManagementEditRouteParams) {
  const { planId } = await params;
  redirect(ROUTES.ADMIN.PRICING_MANAGEMENT.PLANS.EDIT(planId));
}
