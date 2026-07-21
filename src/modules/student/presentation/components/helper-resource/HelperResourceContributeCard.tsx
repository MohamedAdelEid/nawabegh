"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { HELPER_RESOURCE_ASSETS } from "./helper-resource.assets";

const SUPPORT_MAIL =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "support@nawabegh.com";

export function HelperResourceContributeCard() {
  const t = useTranslations("student.dashboard.helperResource.contribute");

  return (
    <article className="flex h-full min-h-[435px] flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-[#cbd5e1] bg-[rgba(43,65,94,0.02)] p-6 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-[rgba(43,65,94,0.08)]">
        <Image
          src={HELPER_RESOURCE_ASSETS.contributePlus}
          alt=""
          width={28}
          height={28}
          className="size-7 object-contain"
          unoptimized
        />
      </div>
      <p className="max-w-[240px] text-sm leading-6 text-[#64748b]">
        {t("description")}
      </p>
      <a
        href={`mailto:${SUPPORT_MAIL}?subject=${encodeURIComponent(t("mailSubject"))}`}
        className="inline-flex h-10 items-center justify-center rounded-lg bg-[#c7af6d] px-5 text-sm font-bold text-[#1e293b] transition hover:bg-[#bba15c]"
      >
        {t("cta")}
      </a>
    </article>
  );
}
