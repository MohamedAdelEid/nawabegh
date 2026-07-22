"use client";

import Link from "next/link";
import { Download, Pencil } from "lucide-react";
import { useTranslations } from "next-intl";
import { ParentAvatar } from "@/modules/parent/presentation/components/home/ParentAvatar";
import { Button } from "@/shared/presentation/components/ui/button";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { notify } from "@/shared/application/lib/toast";

export function ParentWelcomeCard({
  fullName,
  profileImageUrl,
}: {
  fullName: string;
  profileImageUrl: string | null;
}) {
  const t = useTranslations("parent.dashboard.home.welcome");
  const tMessages = useTranslations("parent.dashboard.profilePage.messages");

  return (
    <section className="flex flex-col gap-6 rounded-[32px] border-2 border-[rgba(226,232,240,0.3)] bg-white p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex min-w-0 flex-1 items-center gap-4 sm:gap-6">
        <ParentAvatar
          url={profileImageUrl}
          name={fullName}
          className="size-20 border-4 border-[rgba(199,175,109,0.2)] sm:size-24"
          roundedClassName="rounded-full"
        />
        <div className="min-w-0 space-y-2 text-start">
          <h1 className="text-2xl font-bold text-[#2b415e] sm:text-[30px] sm:leading-9">
            {t("title", { name: fullName })}
          </h1>
          <p className="text-sm text-[#64748b] sm:text-base">{t("subtitle")}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
        <Button
          asChild
          variant="outline"
          className="h-auto gap-2 rounded-xl border-[#e2e8f0] bg-[#f1f5f9] px-6 py-3 text-base font-bold text-[#2b415e] hover:bg-[#e2e8f0]"
        >
          <Link href={ROUTES.USER.PARENT.SETTINGS}>
            <Pencil className="size-5" aria-hidden />
            {t("editAccount")}
          </Link>
        </Button>
        <Button
          type="button"
          className="h-auto gap-2 rounded-xl bg-[#c7af6d] px-6 py-3 text-base font-bold text-white shadow-[0px_4px_0px_rgba(0,0,0,0.1)] hover:bg-[#b89f5d]"
          onClick={() => notify.success(tMessages("comingSoon"))}
        >
          <Download className="size-4" aria-hidden />
          {t("downloadReports")}
        </Button>
      </div>
    </section>
  );
}
