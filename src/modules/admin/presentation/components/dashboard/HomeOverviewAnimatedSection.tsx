"use client";

import type React from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  HOME_NAV_ENTRANCE_VISIBLE,
  getHomeNavEntranceInitial,
  type HomeNavEntranceDirection,
} from "@/modules/admin/domain/utils/homeNavEntrance";

export function HomeOverviewAnimatedSection({
  children,
  delay = 0,
  direction = "top",
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  direction?: HomeNavEntranceDirection;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? { opacity: 0 } : getHomeNavEntranceInitial(direction, false)}
      animate={reduceMotion ? { opacity: 1 } : HOME_NAV_ENTRANCE_VISIBLE}
      transition={{
        duration: reduceMotion ? 0.18 : 0.55,
        ease: [0.22, 1, 0.36, 1],
        delay: reduceMotion ? 0 : delay,
      }}
    >
      {children}
    </motion.div>
  );
}
