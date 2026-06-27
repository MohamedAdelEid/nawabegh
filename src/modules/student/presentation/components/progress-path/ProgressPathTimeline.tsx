"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { PathStationProgressDto } from "@/modules/student/domain/progress/progress.types";
import { JOURNEY_ASSETS } from "./journey.assets";
import { ProgressPathNode } from "./ProgressPathNode";
import {
  buildConnectorPath,
  getNodeX,
  getNodeY,
  TIMELINE_LAYOUT,
} from "./progress-path-node.utils";

type ProgressPathTimelineProps = {
  stations: PathStationProgressDto[];
  onStationSelect?: (station: PathStationProgressDto) => void;
};

export function ProgressPathTimeline({
  stations,
  onStationSelect,
}: ProgressPathTimelineProps) {
  if (stations.length === 0) {
    return null;
  }

  const totalHeight =
    getNodeY(stations.length - 1) + TIMELINE_LAYOUT.nodeHeight / 2 + 120;

  return (
    <div className="relative mx-auto w-full max-w-3xl px-4 py-10 md:px-8 md:py-14">
      <motion.div
        initial={{ opacity: 0, x: -40, rotate: -16 }}
        animate={{ opacity: 1, x: 0, rotate: -16 }}
        transition={{ duration: 0.9, delay: 0.4 }}
        className="pointer-events-none absolute start-0 top-[20%] z-10 hidden w-40 md:block lg:w-52"
        aria-hidden
      >
        <Image
          src={JOURNEY_ASSETS.capGraduation}
          alt=""
          width={208}
          height={208}
          className="h-auto w-full object-contain drop-shadow-xl"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 40, rotate: 26 }}
        animate={{ opacity: 1, x: 0, rotate: 26 }}
        transition={{ duration: 0.9, delay: 0.55 }}
        className="pointer-events-none absolute end-0 bottom-[8%] z-10 hidden w-36 md:block lg:w-48"
        aria-hidden
      >
        <Image
          src={JOURNEY_ASSETS.cup}
          alt=""
          width={192}
          height={192}
          className="h-auto w-full object-contain drop-shadow-xl"
        />
      </motion.div>

      <div
        className="relative mx-auto w-full"
        style={{
          height: totalHeight,
          maxWidth: TIMELINE_LAYOUT.viewWidth,
        }}
      >
        <svg
          viewBox={`0 0 ${TIMELINE_LAYOUT.viewWidth} ${totalHeight}`}
          className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
          aria-hidden
        >
          {stations.map((_, index) => {
            if (index === 0) return null;
            const x1 = getNodeX(index - 1);
            const y1 = getNodeY(index - 1) + 55;
            const x2 = getNodeX(index);
            const y2 = getNodeY(index) - 55;
            const path = buildConnectorPath(x1, y1, x2, y2);

            return (
              <motion.path
                key={`connector-${index}`}
                d={path}
                fill="none"
                stroke="#c7af6d"
                strokeWidth="4"
                strokeDasharray="8 8"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{
                  duration: 0.7,
                  delay: 0.2 + index * 0.1,
                  ease: "easeInOut",
                }}
              />
            );
          })}
        </svg>

        {stations.map((station, index) => {
          const x = getNodeX(index);
          const y = getNodeY(index);

          return (
            <motion.div
              key={station.stationId}
              className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${(x / TIMELINE_LAYOUT.viewWidth) * 100}%`,
                top: y,
              }}
              initial={{ opacity: 0, scale: 0.75 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.5,
                delay: 0.25 + index * 0.12,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <ProgressPathNode station={station} onSelect={onStationSelect} />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
