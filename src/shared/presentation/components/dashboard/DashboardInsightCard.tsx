"use client";

import type React from "react";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { Button } from "@/shared/presentation/components/ui/button";
import { cn } from "@/shared/application/lib/cn";

type DashboardInsightVariant = "default" | "primary";

const cardClasses: Record<DashboardInsightVariant, string> = {
  default:
    "bg-white text-slate-800 border-white/80 shadow-[0_14px_36px_rgba(15,23,42,0.08)]",
  primary:
    "border-[#2C4260] bg-[#2C4260] text-white shadow-[0_18px_40px_rgba(44,66,96,0.24)]",
};

interface DashboardInsightCardProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  floatingIcon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  variant?: DashboardInsightVariant;
  className?: string;
}

export function DashboardInsightCard({
  title,
  description,
  actionLabel,
  floatingIcon: FloatingIcon,
  onAction,
  icon: Icon,
  variant = "default",
  className,
}: DashboardInsightCardProps) {
  return (
    <Card className={cn("rounded-[2rem]", cardClasses[variant], className, "relative overflow-hidden")}>
      <CardContent className="flex h-full flex-col justify-between gap-6 p-8 relative z-10">
        <div className="flex items-start gap-4">
          {Icon ? (
            <div
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-full",
                variant === "primary" ? "bg-white/10 text-white" : "bg-[#F8EFD5] text-[#8F6C0B]",
              )}
            >
              <Icon className="h-6 w-6" aria-hidden />
            </div>
          ) : (
            <div className="hidden"/>
          )}
          <div className="space-y-3 text-right">
            <h3 className="text-3xl font-bold leading-tight">{title}</h3>
            <p
              className={cn(
                "text-md max-w-lg leading-7",
                variant === "primary" ? "text-white/75" : "text-slate-500",
              )}
            >
              {description}
            </p>
          </div>
        </div>
        {actionLabel ? (
          <div className="flex">
            <Button
              type="button"
              onClick={onAction}
              className={cn(
                "rounded-2xl px-5",
                variant === "primary"
                  ? "bg-[#C7AF6E] text-[#2C4260] hover:bg-[#bfa460]"
                  : "bg-transparent text-[#C7AF6D] hover:bg-[#fff]"
              )}
            >
              {actionLabel}
            </Button>
          </div>
        ) : null}
      </CardContent>
      {FloatingIcon ? (
          <div className="absolute bottom-[-20%] right-[0%] opacity-50">
            <FloatingIcon className="h-56 w-56" aria-hidden />
          </div>
        ) : <div className="absolute w-full bg-[#C7AF6D] h-[5px] bottom-0"></div>}
    </Card>
  );
}
