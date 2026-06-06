"use client";

import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import type { AdCreateWizardValues } from "@/modules/admin/domain/types/adCreateWizard.types";
import { cn } from "@/shared/application/lib/cn";
import { Button } from "@/shared/presentation/components/ui/button";

type AdCreateLivePreviewProps = {
  values: AdCreateWizardValues;
  className?: string;
  variant?: "inline" | "browser";
  viewport?: "desktop" | "mobile";
};

export function AdCreateLivePreview({
  values,
  className,
  variant = "inline",
  viewport = "desktop",
}: AdCreateLivePreviewProps) {
  const t = useTranslations("admin.dashboard.adManagement.create.preview");

  const title = values.title.trim() || t("fallbackTitle");
  const description = values.description.trim() || t("fallbackDescription");
  const cta = values.ctaText.trim() || t("fallbackCta");

  if (values.type === "banner") {
    return (
      <div
        className={cn(
          "rounded-2xl border border-[#C7AF6E]/30 bg-gradient-to-l from-[#2C4260] to-[#3d5678] p-4 text-white",
          className,
        )}
      >
        <p className="text-xs font-semibold text-[#C7AF6E]">{t("bannerBadge")}</p>
        <p className="mt-1 text-lg font-bold">{title}</p>
        <p className="mt-1 text-sm text-white/80">{description}</p>
        {cta ? (
          <Button type="button" size="sm" className="mt-3 bg-[#C7AF6E] text-[#2C4260] hover:bg-[#b89d5e]">
            {cta}
          </Button>
        ) : null}
      </div>
    );
  }

  if (values.type === "card") {
    return (
      <div className={cn("overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm", className)}>
        <div className="h-28 bg-gradient-to-br from-slate-100 to-slate-200" />
        <div className="space-y-2 p-4 text-right">
          <p className="font-bold text-slate-800">{title}</p>
          <p className="text-sm text-slate-500">{description}</p>
          {cta ? (
            <Button type="button" size="sm" className="bg-[#2C4260] text-white">
              {cta}
            </Button>
          ) : null}
        </div>
      </div>
    );
  }

  const popup = (
    <div className="relative mx-auto max-w-md rounded-2xl border border-slate-100 bg-white p-6 text-right shadow-xl">
      <button type="button" className="absolute left-4 top-4 text-slate-400" aria-label={t("close")}>
        <X className="h-4 w-4" />
      </button>
      <span className="inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
        {t("popupBadge")}
      </span>
      <p className="mt-4 text-xl font-bold text-slate-800">{title}</p>
      <p className="mt-2 text-sm leading-7 text-slate-500">{description}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        {cta ? (
          <Button type="button" className="bg-[#2C4260] text-white">
            {cta}
          </Button>
        ) : null}
        <Button type="button" variant="outline">
          {t("close")}
        </Button>
      </div>
    </div>
  );

  if (variant === "browser") {
    return (
      <div className={cn("rounded-[1.75rem] border border-slate-100 bg-slate-50 p-4", className)}>
        <div className="mb-3 flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs text-slate-400">
          <span className="h-2 w-2 rounded-full bg-rose-300" />
          <span className="h-2 w-2 rounded-full bg-amber-300" />
          <span className="h-2 w-2 rounded-full bg-emerald-300" />
          <span className="flex-1 truncate">{t("browserUrl")}</span>
        </div>
        <div
          className={cn(
            "flex min-h-[16rem] items-center justify-center rounded-xl bg-slate-200/60 p-6",
            viewport === "mobile" && "max-w-sm mx-auto",
          )}
        >
          {popup}
        </div>
      </div>
    );
  }

  return <div className={className}>{popup}</div>;
}
