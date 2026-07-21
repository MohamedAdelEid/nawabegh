"use client";

import { motion } from "framer-motion";
import { Check, Lock } from "lucide-react";
import type { PathStationProgressDto } from "@/modules/student/domain/progress/progress.types";
import { formatCountdown } from "@/modules/student/domain/progress/progress.utils";
import { cn } from "@/shared/application/lib/cn";
import { resolveProgressPathNodeVisual } from "./progress-path-node.utils";

type ProgressPathNodeProps = {
  station: PathStationProgressDto;
  onSelect?: (station: PathStationProgressDto) => void;
  pathLocked?: boolean;
  isCurrent?: boolean;
};

export function ProgressPathNode({
  station,
  onSelect,
  pathLocked = false,
  isCurrent = false,
}: ProgressPathNodeProps) {
  const visual = resolveProgressPathNodeVisual(station, pathLocked);
  const isLocked = visual.variant === "locked";
  const isCompleted = visual.variant === "completed";

  return (
    <div className="flex flex-col items-center gap-2">
      {visual.showLivePulse && visual.countdownSeconds != null ? (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex max-w-[220px] items-center gap-1.5 rounded-xl bg-[#f4d8d8] px-3 py-1.5 shadow-[0px_3px_0px_#ff4b4b]"
        >
          <span className="relative flex size-2 shrink-0">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#ff4d4f]/50" />
            <span className="relative inline-flex size-2 rounded-full bg-[#ff4d4f]" />
          </span>
          <span className="text-[11px] font-semibold leading-tight text-[#ff4b4b]">
            {formatCountdown(visual.countdownSeconds)}
          </span>
        </motion.div>
      ) : null}

      <motion.button
        type="button"
        disabled={!visual.isInteractive}
        whileHover={visual.isInteractive ? { scale: 1.04, y: -4 } : undefined}
        whileTap={visual.isInteractive ? { scale: 0.97 } : undefined}
        animate={
          isCurrent && visual.isInteractive
            ? { scale: [1, 1.05, 1] }
            : undefined
        }
        transition={
          isCurrent && visual.isInteractive
            ? { duration: 1.8, repeat: Infinity, ease: "easeInOut" }
            : undefined
        }
        onClick={() => visual.isInteractive && onSelect?.(station)}
        aria-label={station.stationName}
        className={cn(
          "relative block h-[155px] w-[135px] border-0 bg-transparent p-0 transition-opacity",
          !visual.isInteractive && "cursor-not-allowed opacity-80",
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={visual.stoneSrc}
          alt=""
          className={cn(
            "pointer-events-none absolute inset-0 size-full object-contain",
            visual.desaturated && "grayscale",
          )}
          draggable={false}
          aria-hidden
        />
        {isCompleted ? (
          <span className="absolute bottom-5 end-3 flex size-7 items-center justify-center rounded-full bg-[#58cc02] shadow-md">
            <Check className="size-3.5 text-white" strokeWidth={3} aria-hidden />
          </span>
        ) : null}
        {isLocked ? (
          <span className="absolute bottom-5 end-3 flex size-7 items-center justify-center rounded-full bg-white shadow-md">
            <Lock className="size-3.5 text-[#64748b]" aria-hidden />
          </span>
        ) : null}
      </motion.button>

      <p className="max-w-[160px] text-center text-xs font-medium leading-tight text-[#475569] md:text-sm">
        {station.stationName}
      </p>
    </div>
  );
}
