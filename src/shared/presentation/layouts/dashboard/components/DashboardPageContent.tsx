import type React from "react";
import { cn } from "@/shared/application/lib/cn";
import {
  dashboardPageBackgroundClass,
  dashboardPagePaddingClass,
} from "../constants/pageLayout";

interface DashboardPageContentProps {
  children: React.ReactNode;
  className?: string;
  padded?: boolean;
  withBackground?: boolean;
}

export function DashboardPageContent({
  children,
  className,
  padded = true,
  withBackground = true,
}: DashboardPageContentProps) {
  return (
    <div
      className={cn(
        "min-h-full",
        withBackground && dashboardPageBackgroundClass,
        padded && dashboardPagePaddingClass,
        className,
      )}
    >
      {children}
    </div>
  );
}
