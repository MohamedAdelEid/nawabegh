"use client";

import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { useTranslations } from "next-intl";
import type { MilestoneBoxDto } from "@/modules/student/domain/progress/progress.types";
import { cn } from "@/shared/application/lib/cn";
import { JOURNEY_ASSETS } from "./journey.assets";

type ProgressPathChestProps = {
  milestone: MilestoneBoxDto;
  claimable: boolean;
  opening?: boolean;
  onOpen?: (milestone: MilestoneBoxDto) => void;
  pathLocked?: boolean;
};

export function ProgressPathChest({
  milestone,
  claimable,
  opening = false,
  onOpen,
  pathLocked = false,
}: ProgressPathChestProps) {
  const t = useTranslations("student.dashboard.progressPath.chest");
  const isOpened = milestone.isOpened;
  const canTap = !pathLocked && claimable && !isOpened && !opening;
  const src =
    isOpened || opening
      ? JOURNEY_ASSETS.treasureOpen
      : JOURNEY_ASSETS.treasureClosed;

  return (
    <div className="flex flex-col items-center gap-2">
      <motion.button
        type="button"
        disabled={!canTap}
        whileHover={canTap ? { scale: 1.05, y: -4 } : undefined}
        whileTap={canTap ? { scale: 0.96 } : undefined}
        animate={
          claimable && !isOpened
            ? {
                filter: [
                  "drop-shadow(0 0 0px rgba(199,175,109,0))",
                  "drop-shadow(0 0 16px rgba(199,175,109,0.85))",
                  "drop-shadow(0 0 0px rgba(199,175,109,0))",
                ],
              }
            : undefined
        }
        transition={
          claimable && !isOpened
            ? { duration: 1.6, repeat: Infinity, ease: "easeInOut" }
            : undefined
        }
        onClick={() => canTap && onOpen?.(milestone)}
        aria-label={
          isOpened
            ? t("opened")
            : claimable
              ? t("claimable", { points: milestone.pointsReward })
              : t("locked", { points: milestone.pointsReward })
        }
        className={cn(
          "relative block h-[171px] w-[152px] border-0 bg-transparent p-0",
          !canTap && !isOpened && "cursor-not-allowed",
          !claimable && !isOpened && "opacity-70 grayscale",
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt=""
          className="pointer-events-none absolute inset-0 size-full object-contain"
          draggable={false}
          aria-hidden
        />
        {!claimable && !isOpened ? (
          <span className="absolute bottom-8 end-4 flex size-7 items-center justify-center rounded-full bg-white shadow-md">
            <Lock className="size-3.5 text-[#64748b]" aria-hidden />
          </span>
        ) : null}
      </motion.button>

      <p className="max-w-[160px] text-center text-xs font-medium text-[#475569]">
        {isOpened
          ? t("claimed", { points: milestone.pointsReward })
          : t("reward", { points: milestone.pointsReward })}
      </p>
    </div>
  );
}
