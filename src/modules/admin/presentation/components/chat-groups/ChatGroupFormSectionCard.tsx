"use client";

import type React from "react";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { cn } from "@/shared/application/lib/cn";

interface ChatGroupFormSectionCardProps {
  title: string;
  subtitle?: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>> ;
  accentColor?: string;
  children: React.ReactNode;
  className?: string;
  /** When true, card fills parent height (e.g. grid row) and body grows with flex. */
  fillHeight?: boolean;
}

export function ChatGroupFormSectionCard({
  title,
  subtitle,
  icon: Icon,
  accentColor = "#67C23A",
  children,
  className,
  fillHeight = false,
}: ChatGroupFormSectionCardProps) {
  return (
    <Card
      className={cn(
        "overflow-hidden rounded-[2rem] border-white/80 bg-white",
        fillHeight && "flex h-full min-h-0 flex-col",
        className,
      )}
      style={{
        boxShadow: "var(--dashboard-shadow-soft)"
      }}
    >
      <CardContent
        className={cn(
          "p-6 sm:p-8",
          fillHeight ? "flex min-h-0 flex-1 flex-col gap-6" : "space-y-6",
        )}
      >
        <div className="flex shrink-0 items-center gap-3">
          <div
            className="h-8 w-1"
            style={{ backgroundColor: accentColor }}
          />
          <div className="flex items-center gap-3">
            {Icon ? (
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${accentColor}15` }}
              >
                <Icon className="h-5 w-5" style={{ color: accentColor }} aria-hidden />
              </div>
            ) : null}
            <div className="space-y-0.5 text-right">
              <h2 className="text-xl font-bold text-[#2b415e]">{title}</h2>
              {subtitle ? (
                <p className="text-sm text-slate-500">{subtitle}</p>
              ) : null}
            </div>
          </div>
        </div>
        <div
          className={cn(
            fillHeight && "flex min-h-0 flex-1 flex-col",
          )}
        >
          {children}
        </div>
      </CardContent>
    </Card>
  );
}
