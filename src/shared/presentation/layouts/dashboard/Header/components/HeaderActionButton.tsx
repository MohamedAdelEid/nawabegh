"use client";

import type React from "react";
import { cn } from "@/shared/application/lib/cn";

interface HeaderActionButtonProps {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  onClick?: () => void;
  className?: string;
}

export const HeaderActionButton: React.FC<HeaderActionButtonProps> = ({
  icon: Icon,
  label,
  onClick,
  className,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex h-11 w-11 items-center justify-center rounded-2xl",
        "text-slate-500",
        "transition-colors duration-200 hover:bg-slate-50 hover:text-slate-700",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25",
        className,
      )}
    >
      <Icon className="h-5 w-5" aria-hidden />
    </button>
  );
};
