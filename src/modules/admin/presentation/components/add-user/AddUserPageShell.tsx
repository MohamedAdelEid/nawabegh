"use client";

import type React from "react";
import { useRouter } from "next/navigation";
import {
  DashboardBreadcrumb,
  DashboardPageHeader,
} from "@/shared/presentation/components/dashboard";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { AddUserAnimatedSection } from "./AddUserAnimatedSection";
import { AddUserFormActions } from "./AddUserFormActions";

export function AddUserPageShell({
  title,
  description,
  breadcrumbs,
  cancelLabel,
  submitLabel,
  onSubmit,
  children,
}: {
  title: string;
  description: string;
  breadcrumbs: { label: string }[];
  cancelLabel: string;
  submitLabel: string;
  onSubmit: () => void;
  children: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <div className="space-y-8">
      <AddUserAnimatedSection>
        <div className="space-y-2">
          <DashboardBreadcrumb items={breadcrumbs} />
          <DashboardPageHeader
            title={title}
            description={description}
            action={
              <AddUserFormActions
                cancelLabel={cancelLabel}
                submitLabel={submitLabel}
                onCancel={() => router.back()}
                onSubmit={onSubmit}
              />
            }
          />
        </div>
      </AddUserAnimatedSection>

      {children}
    </div>
  );
}
