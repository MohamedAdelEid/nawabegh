import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ForgotPasswordPage } from "@/modules/auth/presentation/pages/password/ForgotPasswordPage";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.password.forgot");
  return {
    title: t("meta.title"),
  };
}

export default function AuthForgotPasswordRoute() {
  return <ForgotPasswordPage />;
}
