"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/shared/application/lib/cn";
import { clampPercent } from "@/modules/parent/application/lib/parentHome.utils";

export function ParentProgressRing({
  value,
  size = 128,
  strokeWidth = 8,
  color = "#58cc02",
  trackColor = "#EEF2F6",
  className,
  children,
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  className?: string;
  children?: ReactNode;
}) {
  const normalized = clampPercent(value);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          initial={{ strokeDasharray: `0 ${circumference}` }}
          animate={{
            strokeDasharray: `${(normalized / 100) * circumference} ${circumference}`,
          }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
}
