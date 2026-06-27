"use client";

import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import type { PathStationProgressDto } from "@/modules/student/domain/progress/progress.types";
import { formatCountdown } from "@/modules/student/domain/progress/progress.utils";
import { cn } from "@/shared/application/lib/cn";
import { resolveProgressPathNodeVisual } from "./progress-path-node.utils";

type ProgressPathNodeProps = {
  station: PathStationProgressDto;
  onSelect?: (station: PathStationProgressDto) => void;
};

export function ProgressPathNode({ station, onSelect }: ProgressPathNodeProps) {
  const visual = resolveProgressPathNodeVisual(station);
  const isLocked = visual.variant === "locked";

  return (
    <div className="flex flex-col items-center gap-2">
      {visual.showLivePulse && visual.countdownSeconds != null ? (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-1.5 rounded-xl bg-[#f4d8d8] px-3 py-1.5 shadow-[0px_3px_0px_#ff4b4b]"
        >
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#ff4d4f]/50" />
            <span className="relative inline-flex size-2 rounded-full bg-[#ff4d4f]" />
          </span>
          <span className="text-xs font-semibold text-[#ff4b4b]">
            {formatCountdown(visual.countdownSeconds)}
          </span>
        </motion.div>
      ) : null}

      <motion.button
        type="button"
        disabled={!visual.isInteractive}
        whileHover={visual.isInteractive ? { scale: 1.04, y: -4 } : undefined}
        whileTap={visual.isInteractive ? { scale: 0.97 } : undefined}
        onClick={() => visual.isInteractive && onSelect?.(station)}
        aria-label={station.stationName}
        className={cn(
          "relative block h-[155px] w-[135px] border-0 bg-transparent p-0 transition-opacity",
          !visual.isInteractive && "cursor-not-allowed opacity-75",
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={visual.shadowSrc}
          alt=""
          className="pointer-events-none absolute inset-0 size-full object-contain"
          draggable={false}
          aria-hidden
        />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center pt-1">
          <div className="relative flex size-[100px] items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={visual.maskSrc}
              alt=""
              className="absolute inset-0 size-full object-contain"
              draggable={false}
              aria-hidden
            />
            {visual.iconSrc ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={visual.iconSrc}
                alt=""
                className="relative z-10 size-12 object-contain"
                draggable={false}
                aria-hidden
              />
            ) : null}
          </div>
        </div>
        {isLocked ? (
          <span className="absolute bottom-6 end-4 flex size-7 items-center justify-center rounded-full bg-white shadow-md">
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
