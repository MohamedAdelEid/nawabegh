"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { AUTH_ROUTES } from "@/modules/auth/config/routes";

type AuthFormHeaderProps = {
  brandAlt: string;
  backLabel: string;
  backHref?: string;
};

export function AuthFormHeader({ brandAlt, backLabel, backHref }: AuthFormHeaderProps) {
  const locale = useLocale();
  const router = useRouter();
  const isArabic = locale === "ar";
  const BackIcon = isArabic ? ArrowRight : ArrowLeft;

  const handleBack = () => {
    if (backHref) {
      router.push(backHref);
      return;
    }
    router.push(AUTH_ROUTES.REGISTER);
  };

  return (
    <header className="flex w-full items-center justify-between px-8 py-9 lg:px-10">
      <Image
        src="/images/logos/main-logo.png"
        alt={brandAlt}
        width={169}
        height={54}
        priority
        className="h-auto w-[120px] object-contain sm:w-[169px]"
      />

      <button
        type="button"
        onClick={handleBack}
        aria-label={backLabel}
        className="inline-flex size-[50px] shrink-0 items-center justify-center rounded-full text-[var(--dashboard-primary)] transition-colors hover:bg-slate-100"
      >
        <BackIcon className="size-7" />
      </button>
    </header>
  );
}
