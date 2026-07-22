"use client";

import { useLocale, useTranslations } from "next-intl";
import type { ParentAvailableOffer } from "@/modules/parent/domain/types/parentPayments.types";
import { resolveLocalizedLabel } from "@/modules/parent/application/lib/parentPayments.utils";
import { notify } from "@/shared/application/lib/toast";
import { resolveFileUrl } from "@/shared/infrastructure/files/fileUrl";
import { Button } from "@/shared/presentation/components/ui/button";
import { cn } from "@/shared/application/lib/cn";

export function ParentOfferCard({
  offer,
  onSubscribe,
  className,
}: {
  offer: ParentAvailableOffer | null;
  onSubscribe?: (offer: ParentAvailableOffer) => void;
  className?: string;
}) {
  const t = useTranslations("parent.dashboard.payments");
  const locale = useLocale();

  if (!offer) {
    return (
      <article
        className={cn(
          "flex min-h-[280px] items-center justify-center rounded-[20px] bg-[#2b415e] p-8 text-white shadow-[0px_8px_0px_rgba(0,0,0,0.05)]",
          className,
        )}
      >
        <p className="text-sm text-[#b2c8eb]">{t("offer.empty")}</p>
      </article>
    );
  }

  const title = resolveLocalizedLabel(locale, offer.titleAr, offer.title);
  const description = resolveLocalizedLabel(
    locale,
    offer.descriptionAr,
    offer.description,
    "",
  );
  const imageUrl = resolveFileUrl(offer.imageUrl ?? null);

  return (
    <article
      className={cn(
        "relative flex min-h-[280px] overflow-hidden rounded-[20px] bg-[#2b415e] shadow-[0px_8px_0px_rgba(0,0,0,0.05)] lg:min-h-[420px]",
        className,
      )}
    >
      {offer.discountPercent != null && offer.discountPercent > 0 ? (
        <div className="pointer-events-none absolute start-6 top-6 z-10 rotate-45">
          <div className="bg-[#c7af6d] px-8 py-2 text-sm font-bold text-white shadow-md">
            {t("offer.savePercent", { percent: Math.round(offer.discountPercent) })}
          </div>
        </div>
      ) : null}

      <div className="relative z-[2] flex w-full flex-col justify-between gap-8 p-8 lg:max-w-[55%]">
        <div className="space-y-3 text-start">
          <h2 className="text-2xl font-bold leading-tight text-white sm:text-[30px] sm:leading-9">
            {title}
          </h2>
          {description ? (
            <p className="text-sm leading-5 text-[#b2c8eb]">{description}</p>
          ) : null}
        </div>

        <Button
          type="button"
          className="h-12 w-full max-w-[301px] rounded-xl bg-[#c7af6d] text-base font-bold text-white shadow-[0px_4px_0px_#a38f5a] hover:bg-[#b89f5d]"
          onClick={() => {
            if (onSubscribe) {
              onSubscribe(offer);
              return;
            }
            notify.success(t("comingSoon"));
          }}
        >
          {t("offer.subscribeNow")}
        </Button>
      </div>

      <div className="pointer-events-none absolute inset-y-0 end-0 hidden w-[45%] lg:block">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt=""
            className="h-full w-full object-cover opacity-90"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-[#3a5478] via-[#2b415e] to-[#1a2a40]" />
        )}
      </div>
    </article>
  );
}
