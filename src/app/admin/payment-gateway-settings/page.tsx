import { redirect } from "next/navigation";
import { ROUTES } from "@/shared/infrastructure/config/routes";

export default function PaymentGatewaySettingsLegacyRoute() {
  redirect(ROUTES.ADMIN.PRICING_MANAGEMENT.PAYMENT_GATEWAYS);
}
