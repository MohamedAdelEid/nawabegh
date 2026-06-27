"use client";

import type React from "react";
import { DashboardBreadcrumb } from "./DashboardBreadcrumb";
import { DashboardPageHeader } from "./DashboardPageHeader";
import { DashboardTabPlaceholder } from "./DashboardTabPlaceholder";

interface DashboardTabPageProps {
  homeLabel: string;
  title: string;
  description: string;
  breadcrumbLabels?: string[];
  children?: React.ReactNode;
}

export function DashboardTabPage({
  homeLabel,
  title,
  description,
  breadcrumbLabels,
  children,
}: DashboardTabPageProps) {
  const labels =
    breadcrumbLabels && breadcrumbLabels.length > 0
      ? breadcrumbLabels
      : title === homeLabel
        ? [homeLabel]
        : [homeLabel, title];

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <DashboardBreadcrumb items={labels.map((label) => ({ label }))} />
        <DashboardPageHeader title={title} description={description} />
      </div>
      {children ?? <DashboardTabPlaceholder title={title} description={description} />}
    </div>
  );
}
