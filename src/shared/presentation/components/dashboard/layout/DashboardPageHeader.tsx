"use client";

import type React from "react";
import { motion } from "framer-motion";
import { cn } from "@/shared/application/lib/cn";

interface DashboardPageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function DashboardPageHeader({
  title,
  description,
  action,
  className,
}: DashboardPageHeaderProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className={cn(
        "flex flex-col-reverse gap-4 md:flex-row md:items-start md:justify-between",
        className,
      )}
    >
      <div className="space-y-2 text-right">
        <h1 className="text-3xl font-bold tracking-tight text-[#2b415e]">{title}</h1>
        {description ? (
          <p className="max-w-2xl text-base leading-7 text-[#64748b]">{description}</p>
        ) : null}
      </div>
      {action ? (
        <div className="flex shrink-0 justify-start md:justify-end">{action}</div>
      ) : null}
    </motion.section>
  );
}
