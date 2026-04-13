"use client";

import type React from "react";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { cn } from "@/shared/application/lib/cn";

export function AddUserFormSectionCard({
  title,
  icon: Icon,
  children,
  className,
}: {
  title: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card
      className={cn(
        "rounded-[2rem] border-white/80 bg-[var(--dashboard-surface)]",
        className,
      )}
      style={{
        boxShadow: "0px 8px 0px 0px #0000000D"
      }}
    >
      <CardContent className="space-y-6 p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--dashboard-warning-soft)] text-[var(--dashboard-gold-foreground)]">
            <Icon className="h-5 w-5" aria-hidden />
          </div>
          <h2 className="text-xl font-bold text-[var(--dashboard-primary)]">{title}</h2>
        </div>
        {children}
      </CardContent>
    </Card>
  );
}
