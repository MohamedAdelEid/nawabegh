import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { LoginPage } from "@/modules/auth/presentation/pages/login/LoginPage";
import { auth } from "@/shared/infrastructure/auth/nextAuth";
import { getRedirectPathForRole } from "@/modules/auth/infrastructure/authSession";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.login");
  return {
    title: t("meta.title"),
  };
}

export default async function AuthLoginRoute() {
  const session = await auth();

  if (session?.user) {
    redirect(getRedirectPathForRole(session.user.role));
  }

  return <LoginPage />;
}
