import {
  LiveSessionRuntimeMode,
  StudentStationProgressStatus,
} from "@/modules/student/domain/progress/progress.enums";
import type { PathStationProgressDto } from "@/modules/student/domain/progress/progress.types";
import { StationType } from "@/shared/domain/enums/learning-path.enums";
import { JOURNEY_ASSETS } from "./journey.assets";

export type ProgressPathNodeVariant =
  | "completedGreen"
  | "completedBlue"
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
  shadowSrc: string;
  maskSrc: string;
  iconSrc: string;
};

export const TIMELINE_LAYOUT = {
  viewWidth: 400,
  nodeSlotHeight: 200,
  nodeWidth: 135,
  nodeHeight: 155,
  rightX: 268,
  leftX: 132,
} as const;

export function resolveProgressPathNodeVisual(
  station: PathStationProgressDto,
): ProgressPathNodeVisual {
  const isLive = station.stationType === StationType.LiveStream;
  const liveMode = station.liveSessionSchedule?.runtimeMode;
  const countdown = station.liveSessionSchedule?.countdownSeconds ?? null;
  const iconSrc = resolveStationIcon(station.stationType);

  if (isLive && liveMode === LiveSessionRuntimeMode.Live) {
    return {
      variant: "live",
      isInteractive: station.status !== StudentStationProgressStatus.Locked,
      showLivePulse: true,
      countdownSeconds: countdown,
      shadowSrc: JOURNEY_ASSETS.stations.shadowRed,
      maskSrc: JOURNEY_ASSETS.stations.maskRed,
      iconSrc: JOURNEY_ASSETS.stations.iconLive,
    };
  }

  if (isLive && liveMode === LiveSessionRuntimeMode.Upcoming) {
    return {
      variant: "liveUpcoming",
      isInteractive: station.status !== StudentStationProgressStatus.Locked,
      showLivePulse: false,
      countdownSeconds: countdown,
      shadowSrc: JOURNEY_ASSETS.stations.shadowRed,
      maskSrc: JOURNEY_ASSETS.stations.maskRed,
      iconSrc: JOURNEY_ASSETS.stations.iconLive,
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
      shadowSrc: JOURNEY_ASSETS.stations.shadowGray,
      maskSrc: JOURNEY_ASSETS.stations.maskGray,
      iconSrc,
    };
  }

  if (station.status === StudentStationProgressStatus.Completed) {
    const isQuiz = station.stationType === StationType.ShortQuiz;
    return {
      variant: isQuiz ? "completedBlue" : "completedGreen",
      isInteractive: true,
      showLivePulse: false,
      countdownSeconds: null,
      shadowSrc: isQuiz ? JOURNEY_ASSETS.stations.shadowBlue : JOURNEY_ASSETS.stations.shadow,
      maskSrc: isQuiz ? JOURNEY_ASSETS.stations.maskBlue : JOURNEY_ASSETS.stations.maskGreen,
      iconSrc,
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
      shadowSrc: JOURNEY_ASSETS.stations.shadowGold,
      maskSrc: JOURNEY_ASSETS.stations.maskGold,
      iconSrc,
    };
  }

  return {
    variant: "locked",
    isInteractive: false,
    showLivePulse: false,
    countdownSeconds: null,
    shadowSrc: JOURNEY_ASSETS.stations.shadowGray,
    maskSrc: JOURNEY_ASSETS.stations.maskGray,
    iconSrc,
  };
}

function resolveStationIcon(type: StationType): string {
  switch (type) {
    case StationType.LiveStream:
      return JOURNEY_ASSETS.stations.iconLive;
    case StationType.Challenge:
      return JOURNEY_ASSETS.stations.iconChallenge;
    case StationType.ShortQuiz:
    case StationType.Flashcards:
      return "";
    default:
      return JOURNEY_ASSETS.stations.iconBook;
  }
}

export function getNodeX(index: number): number {
  return index % 2 === 0 ? TIMELINE_LAYOUT.rightX : TIMELINE_LAYOUT.leftX;
}

export function getNodeY(index: number): number {
  return 90 + index * TIMELINE_LAYOUT.nodeSlotHeight;
}

export function buildConnectorPath(x1: number, y1: number, x2: number, y2: number): string {
  const midY = (y1 + y2) / 2;
  return `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;
}
