import { redirect } from "next/navigation";
import { ROUTES } from "@/shared/infrastructure/config/routes";

export default function PricingManagementAddLegacyRoute() {
  redirect(ROUTES.ADMIN.PRICING_MANAGEMENT.PLANS.ADD);
}
