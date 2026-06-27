"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/shared/application/lib/cn";

type DashboardSectionHeaderProps = {
  title: string;
  actions?: ReactNode;
  accent?: boolean;
  className?: string;
};

export function DashboardSectionHeader({
  title,
  actions,
  accent = true,
  className,
}: DashboardSectionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn("flex items-center justify-between gap-4", className)}
    >
      <div className="flex items-center gap-3">
        {accent ? (
          <span
            className="h-10 w-2 shrink-0 rounded-full bg-[#58cc02]"
            aria-hidden
          />
        ) : null}
        <h2 className="text-2xl font-bold tracking-tight text-[#2b415e] md:text-3xl">
          {title}
        </h2>
      </div>
      <div className="flex items-center gap-3">
        {actions}
      </div>
    </motion.div>
  );
}
