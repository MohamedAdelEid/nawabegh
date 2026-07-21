import {
  LiveSessionRuntimeMode,
  StudentStationProgressStatus,
} from "@/modules/student/domain/progress/progress.enums";
import type { PathStationProgressDto } from "@/modules/student/domain/progress/progress.types";
import { StationType } from "@/shared/domain/enums/learning-path.enums";
import { JOURNEY_ASSETS } from "./journey.assets";

export type ProgressPathNodeVariant =
  | "completed"
  | "active"
  | "locked"
  | "live"
  | "liveUpcoming"
  | "missed";

export type ProgressPathNodeVisual = {
  variant: ProgressPathNodeVariant;
  isInteractive: boolean;
  showLivePulse: boolean;
  countdownSeconds: number | null;
  stoneSrc: string;
  desaturated: boolean;
};

/** Desktop zigzag layout inspired by Figma 1698:3045 + mobile stone sizes. */
export const TIMELINE_LAYOUT = {
  viewWidth: 420,
  nodeSlotHeight: 210,
  stoneWidth: 135,
  stoneHeight: 155,
  chestWidth: 152,
  chestHeight: 171,
  rightX: 280,
  leftX: 140,
} as const;

export function resolveStationStoneSrc(type: StationType): string {
  switch (type) {
    case StationType.LiveStream:
      return JOURNEY_ASSETS.stones.live;
    case StationType.Flashcards:
      return JOURNEY_ASSETS.stones.flashcards;
    case StationType.ShortQuiz:
      return JOURNEY_ASSETS.stones.quiz;
    case StationType.Challenge:
      return JOURNEY_ASSETS.stones.challenge;
    case StationType.HelperResource:
    default:
      return JOURNEY_ASSETS.stones.book;
  }
}

export function resolveProgressPathNodeVisual(
  station: PathStationProgressDto,
  pathLocked = false,
): ProgressPathNodeVisual {
  const isLive = station.stationType === StationType.LiveStream;
  const liveMode = station.liveSessionSchedule?.runtimeMode;
  const countdown = station.liveSessionSchedule?.countdownSeconds ?? null;
  const stoneSrc = resolveStationStoneSrc(station.stationType);

  if (pathLocked) {
    return {
      variant: "locked",
      isInteractive: false,
      showLivePulse: false,
      countdownSeconds: null,
      stoneSrc,
      desaturated: true,
    };
  }

  if (isLive && liveMode === LiveSessionRuntimeMode.Live) {
    return {
      variant: "live",
      isInteractive: station.status !== StudentStationProgressStatus.Locked,
      showLivePulse: true,
      countdownSeconds: countdown,
      stoneSrc: JOURNEY_ASSETS.stones.live,
      desaturated: false,
    };
  }

  if (isLive && liveMode === LiveSessionRuntimeMode.Upcoming) {
    return {
      variant: "liveUpcoming",
      isInteractive: station.status !== StudentStationProgressStatus.Locked,
      showLivePulse: true,
      countdownSeconds: countdown,
      stoneSrc: JOURNEY_ASSETS.stones.live,
      desaturated: false,
    };
  }

  if (
    station.status === StudentStationProgressStatus.Missed ||
    station.status === StudentStationProgressStatus.Incomplete
  ) {
    return {
      variant: "missed",
      isInteractive: true,
      showLivePulse: false,
      countdownSeconds: null,
      stoneSrc,
      desaturated: true,
    };
  }

  if (station.status === StudentStationProgressStatus.Completed) {
    return {
      variant: "completed",
      isInteractive: true,
      showLivePulse: false,
      countdownSeconds: null,
      stoneSrc,
      desaturated: false,
    };
  }

  if (
    station.status === StudentStationProgressStatus.Available ||
    station.status === StudentStationProgressStatus.InProgress
  ) {
    return {
      variant: "active",
      isInteractive: true,
      showLivePulse: false,
      countdownSeconds: null,
      stoneSrc,
      desaturated: false,
    };
  }

  return {
    variant: "locked",
    isInteractive: false,
    showLivePulse: false,
    countdownSeconds: null,
    stoneSrc,
    desaturated: true,
  };
}

export function getNodeX(index: number): number {
  return index % 2 === 0 ? TIMELINE_LAYOUT.rightX : TIMELINE_LAYOUT.leftX;
}

export function getNodeY(index: number): number {
  return 100 + index * TIMELINE_LAYOUT.nodeSlotHeight;
}

export function buildConnectorPath(x1: number, y1: number, x2: number, y2: number): string {
  const midY = (y1 + y2) / 2;
  return `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;
}
