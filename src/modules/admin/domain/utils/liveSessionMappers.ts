import type { LiveBroadcastStation } from "@/modules/admin/domain/data/journeyEditorData";
import type { LiveSession } from "@/modules/admin/infrastructure/api/liveSessionsApi";
import { LiveSessionRuntimeMode } from "@/shared/domain/enums/cms.enums";

function formatDisplayTime(time: string) {
  if (!time.trim()) return "";
  const match = /^(\d{1,2}):(\d{2})(?::\d{2})?$/.exec(time.trim());
  if (!match) return time;
  const hour = Number(match[1]);
  const minute = match[2];
  const period = hour >= 12 ? "م" : "ص";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minute} ${period}`;
}

function formatDisplayDate(isoDate: string) {
  if (!isoDate.trim()) return "";
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) return isoDate;
  return parsed.toLocaleDateString("ar-SA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function computeCountdown(scheduledAt: string) {
  const target = new Date(scheduledAt).getTime();
  const now = Date.now();
  const diffMs = Math.max(0, target - now);
  const totalSeconds = Math.floor(diffMs / 1000);

  return {
    hours: Math.floor(totalSeconds / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

function formatTimeFromIso(iso: string) {
  if (!iso.trim()) return "";
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return "";
  const hours = parsed.getHours();
  const minutes = String(parsed.getMinutes()).padStart(2, "0");
  const period = hours >= 12 ? "م" : "ص";
  const hour12 = hours % 12 || 12;
  return `${hour12}:${minutes} ${period}`;
}

function isLiveSessionStatus(status: string, runtimeMode: number | null) {
  if (runtimeMode === LiveSessionRuntimeMode.Live) return true;
  const normalized = status.trim().toLowerCase();
  return normalized === "live" || normalized === "running" || normalized === "1";
}

export function mapLiveSessionToStation(session: LiveSession): LiveBroadcastStation {
  const scheduledAt = session.scheduledAt || `${session.scheduledDate}T${session.scheduledTime}`;
  const teacher = session.responsibleTeacher;
  return {
    id: session.id,
    stationId: session.stationId,
    stationName: session.stationName || undefined,
    courseTitle: session.courseTitle || undefined,
    learningPathTitle: session.learningPathTitle || undefined,
    status: session.status || undefined,
    title: session.title,
    thumbnailUrl: session.coverImageUrl || undefined,
    description: session.description,
    presenter: teacher?.fullName || "—",
    presenterAvatarUrl: teacher?.profileImageUrl ?? undefined,
    presenterTitle: teacher?.jobTitle || undefined,
    durationMin: session.durationMinutes,
    date: formatDisplayDate(session.scheduledDate || scheduledAt),
    time: formatDisplayTime(session.scheduledTime) || formatTimeFromIso(scheduledAt),
    scheduledAt,
    broadcastLink: session.roomUrl || session.zoomJoinUrl,
    registeredCount: session.activeEnrollmentCount,
    isLive: isLiveSessionStatus(session.status, session.runtimeMode),
    countdown: computeCountdown(scheduledAt),
    objectives: session.goals.map((goal) => ({
      id: String(goal.id || goal.order),
      text: goal.text,
    })),
    attachments: session.attachments.map((attachment) => ({
      id: String(attachment.id || attachment.order),
      name: attachment.fileName,
      fileUrl: attachment.fileUrl || undefined,
      type: (["pdf", "pptx", "mp4"].includes(attachment.fileType.toLowerCase())
        ? attachment.fileType.toLowerCase()
        : "other") as LiveBroadcastStation["attachments"][number]["type"],
      sizeLabel: attachment.fileType.toUpperCase(),
    })),
    preTasks: session.tasks.map((task) => ({
      id: String(task.id || task.order),
      label: task.title,
      subtitle: task.description,
      completed: false,
    })),
    relatedSessionIds: [],
  };
}
