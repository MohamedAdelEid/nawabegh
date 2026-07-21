"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { HELPER_RESOURCE_ASSETS } from "./helper-resource.assets";
import type { HelperResourceMediaFilter } from "@/modules/student/domain/helper-resource/helper-resource.utils";
import { HELPER_RESOURCE_MEDIA_FILTERS } from "@/modules/student/domain/helper-resource/helper-resource.utils";
import { cn } from "@/shared/application/lib/cn";

type HelperResourceFiltersProps = {
  value: HelperResourceMediaFilter;
  onChange: (value: HelperResourceMediaFilter) => void;
};

const FILTER_ICONS: Record<
  "all" | "Pdf" | "Presentation" | "Word" | "Image",
  string
> = {
  all: HELPER_RESOURCE_ASSETS.filterAll,
  Pdf: HELPER_RESOURCE_ASSETS.filterPdf,
  Presentation: HELPER_RESOURCE_ASSETS.filterPpt,
  Word: HELPER_RESOURCE_ASSETS.filterWord,
  Image: HELPER_RESOURCE_ASSETS.filterImage,
};

export function HelperResourceFilters({
  value,
  onChange,
}: HelperResourceFiltersProps) {
  const t = useTranslations("student.dashboard.helperResource.filters");

  const labelFor = (filter: HelperResourceMediaFilter) => {
    switch (filter) {
      case "all":
        return t("all");
      case "Pdf":
        return t("pdf");
      case "Presentation":
        return t("presentation");
      case "Word":
        return t("word");
      case "Image":
        return t("image");
      default:
        return filter;
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-end gap-3 py-2">
      {[...HELPER_RESOURCE_MEDIA_FILTERS].reverse().map((filter) => {
        const active = value === filter;
        return (
          <button
            key={filter}
            type="button"
            onClick={() => onChange(filter)}
            className={cn(
              "inline-flex h-10 items-center justify-center gap-2 rounded-full px-6 text-sm font-medium transition",
              active
                ? "bg-[#2b415e] text-white"
                : "border border-[#e2e8f0] bg-white text-[#475569] hover:bg-[#f8fafc]",
            )}
          >
            <span>{labelFor(filter)}</span>
            <span className="relative size-[15px] shrink-0 overflow-hidden">
              <Image
                src={FILTER_ICONS[filter]}
                alt=""
                width={15}
                height={15}
                className={cn(
                  "size-full object-contain",
                  active && "brightness-0 invert",
                )}
                unoptimized
              />
            </span>
          </button>
        );
      })}
    </div>
  );
}
