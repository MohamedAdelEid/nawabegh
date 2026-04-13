import type React from "react";
import { PanelRight } from "lucide-react";
import { cn } from "@/shared/application/lib/cn";

interface MobileMenuButtonProps {
  isOpen: boolean;
  onToggle: () => void;
  openLabel: string;
  closeLabel: string;
}

export const MobileMenuButton: React.FC<MobileMenuButtonProps> = ({
  isOpen,
  onToggle,
  openLabel,
  closeLabel,
}) => {
  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "inline-flex h-11 w-11 items-center justify-center rounded-2xl",
          "border border-slate-200 bg-white text-slate-600 shadow-sm",
          "transition-colors duration-200 hover:bg-slate-50 hover:text-slate-800",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25",
        )}
        aria-label={isOpen ? closeLabel : openLabel}
      >
        <PanelRight className="h-5 w-5" aria-hidden />
      </button>
    </div>
  );
};
