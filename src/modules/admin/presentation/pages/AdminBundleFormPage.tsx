"use client";

import { BundleFormPage } from "@/modules/admin/presentation/components/bundle-management";

type AdminBundleFormPageProps = {
  bundleId?: string;
};

export function AdminBundleFormPage({ bundleId }: AdminBundleFormPageProps) {
  return <BundleFormPage bundleId={bundleId} />;
}
