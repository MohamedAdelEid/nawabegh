"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { Button } from "@/shared/presentation/components/ui/button";

const COMMUNITY_SETTINGS_PREVIEW = "/images/article-editor/community-settings-hero-v2.png";

export function CommunitySettingsHeaderAction() {
  const t = useTranslations("admin.dashboard.articleEditor.communitySettings.entry");
  const router = useRouter();

  return (
    <div className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
      <div className="relative h-12 w-[7.75rem] shrink-0 overflow-hidden rounded-xl border border-[#DCE6F3] bg-slate-100 shadow-sm">
        <Image
          src={COMMUNITY_SETTINGS_PREVIEW}
          alt={t("previewAlt")}
          fill
          sizes="124px"
          className="object-cover object-top"
          unoptimized
        />
      </div>
      <Button
        type="button"
        variant="outline"
        className="h-12 min-w-[12rem] cursor-pointer rounded-xl border-[#DCE6F3] bg-[#2B415E] text-md font-semibold text-white transition-none hover:bg-[#2B415E]/95 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        onClick={() => router.push(ROUTES.ADMIN.ARTICLE_EDITOR.COMMUNITY_SETTINGS)}
      >
        {t("button")}
      </Button>
    </div>
  );
}
