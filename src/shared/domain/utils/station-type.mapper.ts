import {
  CircleHelp,
  FileText,
  Layers,
  Radio,
  Trophy,
  Video,
  type LucideIcon,
} from "lucide-react";
import { StationAccessPolicy, StationType } from "@/shared/domain/enums/learning-path.enums";

export type StationTypeMeta = {
  icon: LucideIcon;
  labelKey: string;
  colorClass: string;
  bgClass: string;
};

const STATION_TYPE_META: Record<StationType, StationTypeMeta> = {
  [StationType.LiveStream]: {
    icon: Radio,
    labelKey: "liveStream",
    colorClass: "text-blue-600",
    bgClass: "bg-blue-50",
  },
  [StationType.Flashcards]: {
    icon: Layers,
    labelKey: "flashcards",
    colorClass: "text-amber-600",
    bgClass: "bg-amber-50",
  },
  [StationType.ShortQuiz]: {
    icon: CircleHelp,
    labelKey: "shortQuiz",
    colorClass: "text-rose-600",
    bgClass: "bg-rose-50",
  },
  [StationType.Challenge]: {
    icon: Trophy,
    labelKey: "challenge",
    colorClass: "text-purple-600",
    bgClass: "bg-purple-50",
  },
  [StationType.HelperResource]: {
    icon: FileText,
    labelKey: "helperResource",
    colorClass: "text-slate-600",
    bgClass: "bg-slate-50",
  },
  [StationType.RecordedLecture]: {
    icon: Video,
    labelKey: "recordedLecture",
    colorClass: "text-indigo-600",
    bgClass: "bg-indigo-50",
  },
};

const DEFAULT_STATION_META = STATION_TYPE_META[StationType.RecordedLecture];

export function getStationTypeMeta(type: number): StationTypeMeta {
  return STATION_TYPE_META[type as StationType] ?? DEFAULT_STATION_META;
}

export function isStationSubscribersOnly(accessPolicy: number): boolean {
  return accessPolicy === StationAccessPolicy.Subscribers;
}
