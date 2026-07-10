import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ResetPasswordPage } from "@/modules/auth/presentation/pages/password/ResetPasswordPage";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.password.reset");
  return {
    title: t("meta.title"),
  };
}

export default function AuthResetPasswordRoute() {
  return <ResetPasswordPage />;
}
