import type { DashboardBadgeTone } from "@/shared/presentation/components/dashboard";
import type {
  SupportTicketPriority,
  SupportTicketStatus,
} from "@/modules/admin/domain/types/supportTickets.types";
import { SUPPORT_TICKET_PRIORITY, SUPPORT_TICKET_STATUS } from "@/modules/admin/domain/types/supportTickets.types";

export function supportTicketStatusTone(status: SupportTicketStatus): DashboardBadgeTone {
  switch (status) {
    case SUPPORT_TICKET_STATUS.open:
      return "danger";
    case SUPPORT_TICKET_STATUS.inProgress:
      return "warning";
    case SUPPORT_TICKET_STATUS.closed:
      return "success";
    default:
      return "neutral";
  }
}

export function supportTicketPriorityTone(priority: SupportTicketPriority): DashboardBadgeTone {
  switch (priority) {
    case SUPPORT_TICKET_PRIORITY.urgent:
      return "danger";
    case SUPPORT_TICKET_PRIORITY.high:
      return "warning";
    case SUPPORT_TICKET_PRIORITY.normal:
      return "info";
    case SUPPORT_TICKET_PRIORITY.low:
      return "neutral";
    default:
      return "neutral";
  }
}

export function formatSupportTicketDate(value: string, locale: string): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0] ?? "";
  if (parts.length === 1) return first.slice(0, 2).toUpperCase();
  const second = parts[1] ?? "";
  return `${first.charAt(0)}${second.charAt(0)}`.toUpperCase();
}
