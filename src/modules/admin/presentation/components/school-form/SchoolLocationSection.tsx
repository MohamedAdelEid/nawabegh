"use client";

import { MapPinned } from "lucide-react";
import { SchoolLocationPreview } from "@/modules/admin/infrastructure/integrations/map/SchoolLocationPreview";
import { SchoolFormSectionCard } from "./SchoolFormSectionCard";

interface SchoolLocationSectionProps {
  title: string;
  locationData: {
    cityLabel: string;
    regionLabel: string;
    providerLabel: string;
    loadingLabel: string;
    emptyLabel: string;
    errorLabel: string;
  };
}

export function SchoolLocationSection({
  title,
  locationData,
}: SchoolLocationSectionProps) {
  return (
    <div className="p-2 bg-white rounded-[1.75rem] border border-white/60 shadow-[0_10px_36px_rgba(15,23,42,0.08)]">
      <SchoolLocationPreview
        cityLabel={locationData.cityLabel}
        regionLabel={locationData.regionLabel}
        providerLabel={locationData.providerLabel}
        loadingLabel={locationData.loadingLabel}
        emptyLabel={locationData.emptyLabel}
        errorLabel={locationData.errorLabel}
      />
    </div>
  );
}
