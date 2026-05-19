import type { LiveBroadcastStation } from "@/modules/admin/domain/data/journeyEditorData";
import type { LiveSession } from "@/modules/admin/infrastructure/api/liveSessionsApi";

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

export function mapLiveSessionToStation(session: LiveSession): LiveBroadcastStation {
  const scheduledAt = session.scheduledAt || `${session.scheduledDate}T${session.scheduledTime}`;
  const teacher = session.responsibleTeacher;

  return {
    id: session.id,
    stationId: session.stationId,
    title: session.title,
    thumbnailUrl: session.coverImageUrl || undefined,
    description: session.description,
    presenter: teacher?.fullName || "—",
    presenterAvatarUrl: teacher?.profileImageUrl || undefined,
    presenterTitle: teacher?.jobTitle || undefined,
    durationMin: session.durationMinutes,
    date: formatDisplayDate(session.scheduledDate || scheduledAt),
    time: session.scheduledTime,
    broadcastLink: session.roomUrl,
    registeredCount: session.activeEnrollmentCount,
    isLive: session.status.toLowerCase() === "live",
    countdown: computeCountdown(scheduledAt),
    objectives: session.goals.map((goal) => ({
      id: String(goal.id || goal.order),
      text: goal.text,
    })),
    attachments: session.attachments.map((attachment) => ({
      id: String(attachment.id || attachment.order),
      name: attachment.fileName,
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
