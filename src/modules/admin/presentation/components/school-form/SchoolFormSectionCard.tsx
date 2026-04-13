"use client";

import type React from "react";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { cn } from "@/shared/application/lib/cn";

interface SchoolFormSectionCardProps {
  title: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  children: React.ReactNode;
  className?: string;
}

export function SchoolFormSectionCard({
  title,
  icon: Icon,
  children,
  className,
}: SchoolFormSectionCardProps) {
  return (
    <Card
      className={cn(
        "rounded-[2rem] border-white/80 bg-white shadow-[0_14px_36px_rgba(15,23,42,0.08)]",
        className,
      )}
    >
      <CardContent className="space-y-6 p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F8EFD5] text-[#8F6C0B]">
            <Icon className="h-5 w-5" aria-hidden />
          </div>
          <h2 className="text-xl font-bold text-[#2b415e]">{title}</h2>
        </div>
        {children}
      </CardContent>
    </Card>
  );
}
