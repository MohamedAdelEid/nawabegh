import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { AccountTypeSelectionPage } from "@/modules/auth/presentation/pages/register/AccountTypeSelectionPage";
import { auth } from "@/shared/infrastructure/auth/nextAuth";
import { getRedirectPathForRole } from "@/modules/auth/infrastructure/authSession";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.accountType");
  return { title: t("meta.title") };
}

export default async function AuthRegisterRoute() {
  const session = await auth();
  if (session?.user) {
    redirect(getRedirectPathForRole(session.user.role));
  }

  return <AccountTypeSelectionPage />;
}
