"use client";

import type React from "react";
import { Button } from "@/shared/presentation/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/presentation/components/ui/tooltip";
import { cn } from "@/shared/application/lib/cn";

export type DisabledFeatureButtonProps = {
  label: string;
  tooltip: string;
  icon?: React.ComponentType<{ className?: string }>;
  variant?: "default" | "outline" | "ghost";
  className?: string;
};

export function DisabledFeatureButton({
  label,
  tooltip,
  icon: Icon,
  variant = "outline",
  className,
}: DisabledFeatureButtonProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex">
            <Button
              type="button"
              variant={variant}
              disabled
              className={cn("pointer-events-none opacity-60", className)}
            >
              {Icon ? <Icon className="h-4 w-4" aria-hidden /> : null}
              {label}
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
