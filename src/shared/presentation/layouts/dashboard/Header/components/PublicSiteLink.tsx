"use client";

import type React from "react";
import Link from "next/link";
import { Home } from "lucide-react";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { cn } from "@/shared/application/lib/cn";

type Props = {
  className?: string;
};


export const PublicSiteLink: React.FC<Props> = ({ className }) => {
  return (
    <Link
      href={ROUTES.HOME}
      title="الانتقال إلى الصفحة الرئيسية للموقع"
      className={cn(
        "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-lg",
        "border border-border/90 bg-card/90 px-3 py-2 text-sm font-semibold text-foreground",
        "backdrop-blur-[2px]",
        "transition-[color,box-shadow,border-color] duration-300",
        "hover:border-primary/40 hover:text-primary hover:shadow-[0_2px_24px_rgba(11,117,101,0.12)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2",
        "sm:px-4",
        className
      )}
    >
      <span
        className={cn(
          "pointer-events-none absolute inset-0 origin-right scale-x-0",
          "bg-linear-to-l from-primary/20 via-primary/10 to-transparent",
          "transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          "group-hover:scale-x-100"
        )}
        aria-hidden
      />
      <span className="relative z-10 flex items-center gap-2">
        <Home
          className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
          aria-hidden
        />
        <span className="hidden sm:inline">الصفحة الرئيسية</span>
        <span className="sm:hidden">الرئيسية</span>
      </span>
    </Link>
  );
};
