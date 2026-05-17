import { CalendarDays, CloudCheck, Radio, Video } from "lucide-react";
import type { SidebarIcon } from "@/shared/domain/types/sidebar.types";
import type { IconTone } from "@/shared/domain/types/common.types";

export type LiveSessionStatusId = "live" | "upcoming" | "ended";
export type LiveSessionRecordingId = "uploaded" | "none";

export interface LiveBroadcastStat {
  id: string;
  labelKey: string;
  value: string;
  indicatorKey: string;
  indicatorToneClassName: string;
  icon: SidebarIcon;
  iconTone: IconTone;
}

export interface LiveBroadcastSessionRow {
  id: string;
  titleKey: string;
  subtitleKey: string;
  courseKey: string;
  teacherNameKey: string;
  teacherInitials: string;
  dateLabelKey: string;
  timeLabelKey: string;
  durationKey: string;
  statusId: LiveSessionStatusId;
  recordingId: LiveSessionRecordingId;
}

export interface LiveBroadcastDashboardData {
  stats: LiveBroadcastStat[];
  rows: LiveBroadcastSessionRow[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    visibleItems: number;
  };
}

export const liveBroadcastDashboardData: LiveBroadcastDashboardData = {
  stats: [
    {
      id: "totalSessions",
      labelKey: "liveBroadcast.list.stats.totalSessions.label",
      value: "148",
      indicatorKey: "liveBroadcast.list.stats.totalSessions.indicator",
      indicatorToneClassName: "text-emerald-500",
      icon: Video,
      iconTone: "info",
    },
    {
      id: "liveNow",
      labelKey: "liveBroadcast.list.stats.liveNow.label",
      value: "03",
      indicatorKey: "liveBroadcast.list.stats.liveNow.indicator",
      indicatorToneClassName: "text-rose-500",
      icon: Radio,
      iconTone: "danger",
    },
    {
      id: "upcoming",
      labelKey: "liveBroadcast.list.stats.upcoming.label",
      value: "24",
      indicatorKey: "liveBroadcast.list.stats.upcoming.indicator",
      indicatorToneClassName: "text-slate-400",
      icon: CalendarDays,
      iconTone: "warning",
    },
    {
      id: "recorded",
      labelKey: "liveBroadcast.list.stats.recorded.label",
      value: "121",
      indicatorKey: "liveBroadcast.list.stats.recorded.indicator",
      indicatorToneClassName: "text-emerald-500",
      icon: CloudCheck,
      iconTone: "success",
    },
  ],
  rows: [
    {
      id: "1",
      titleKey: "liveBroadcast.list.rows.organic.title",
      subtitleKey: "liveBroadcast.list.rows.organic.subtitle",
      courseKey: "liveBroadcast.list.rows.organic.course",
      teacherNameKey: "liveBroadcast.list.rows.teacher1",
      teacherInitials: "AM",
      dateLabelKey: "liveBroadcast.list.rows.sampleDate",
      timeLabelKey: "liveBroadcast.list.rows.sampleTime",
      durationKey: "liveBroadcast.list.rows.duration1",
      statusId: "live",
      recordingId: "none",
    },
    {
      id: "2",
      titleKey: "liveBroadcast.list.rows.biology.title",
      subtitleKey: "liveBroadcast.list.rows.biology.subtitle",
      courseKey: "liveBroadcast.list.rows.biology.course",
      teacherNameKey: "liveBroadcast.list.rows.teacher2",
      teacherInitials: "SK",
      dateLabelKey: "liveBroadcast.list.rows.sampleDate2",
      timeLabelKey: "liveBroadcast.list.rows.sampleTime2",
      durationKey: "liveBroadcast.list.rows.duration2",
      statusId: "upcoming",
      recordingId: "none",
    },
    {
      id: "3",
      titleKey: "liveBroadcast.list.rows.math.title",
      subtitleKey: "liveBroadcast.list.rows.math.subtitle",
      courseKey: "liveBroadcast.list.rows.math.course",
      teacherNameKey: "liveBroadcast.list.rows.teacher3",
      teacherInitials: "HA",
      dateLabelKey: "liveBroadcast.list.rows.sampleDate3",
      timeLabelKey: "liveBroadcast.list.rows.sampleTime3",
      durationKey: "liveBroadcast.list.rows.duration3",
      statusId: "ended",
      recordingId: "uploaded",
    },
  ],
  pagination: {
    currentPage: 1,
    totalPages: 5,
    totalItems: 148,
    visibleItems: 3,
  },
};
