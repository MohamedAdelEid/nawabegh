"use client";

import { SchoolAccountSettingsDashboard } from "@/modules/school/presentation/components/account-settings/SchoolAccountSettingsDashboard";
import { SchoolPageTransition } from "@/modules/school/presentation/components/shared/SchoolPageTransition";

export function SchoolSettingsPage() {
  return (
    <SchoolPageTransition>
      <SchoolAccountSettingsDashboard />
    </SchoolPageTransition>
  );
}
