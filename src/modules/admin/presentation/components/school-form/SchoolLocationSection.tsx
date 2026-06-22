"use client";

import type React from "react";
import dynamic from "next/dynamic";
import { SchoolFormSectionCard } from "./SchoolFormSectionCard";
import type { SchoolCountryOption } from "./SchoolContactSection";

export type { SchoolCountryOption };

export interface SchoolLocationInput {
  city: string;
  region: string;
  country: string;
  searchCity?: string;
  searchRegion?: string;
  searchCountry?: string;
}

const SchoolLocationPreview = dynamic(
  () =>
    import("@/modules/admin/infrastructure/integrations/map/SchoolLocationPreview").then(
      (module) => module.SchoolLocationPreview,
    ),
  { ssr: false },
);

interface SchoolLocationSectionProps {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  locationInput: SchoolLocationInput;
  providerLabel: string;
  loadingLabel: string;
  emptyLabel: string;
  errorLabel: string;
}

export function SchoolLocationSection({
  icon,
  title,
  locationInput,
  providerLabel,
  loadingLabel,
  emptyLabel,
  errorLabel,
}: SchoolLocationSectionProps) {
  return (
    <SchoolFormSectionCard icon={icon} title={title}>
      <div className="p-2 bg-white rounded-[1.75rem] border border-white/60 shadow-[0_10px_36px_rgba(15,23,42,0.08)]">
        <SchoolLocationPreview
          cityLabel={locationInput.city}
          regionLabel={locationInput.region}
          countryLabel={locationInput.country}
          searchCity={locationInput.searchCity}
          searchRegion={locationInput.searchRegion}
          searchCountry={locationInput.searchCountry}
          providerLabel={providerLabel}
          loadingLabel={loadingLabel}
          emptyLabel={emptyLabel}
          errorLabel={errorLabel}
        />
      </div>
    </SchoolFormSectionCard>
  );
}
