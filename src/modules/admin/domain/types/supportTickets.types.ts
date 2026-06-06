/** Backend enum values for ticket status. */
export const SUPPORT_TICKET_STATUS = {
  open: 1,
  inProgress: 2,
  closed: 3,
} as const;

export type SupportTicketStatus =
  (typeof SUPPORT_TICKET_STATUS)[keyof typeof SUPPORT_TICKET_STATUS];

/** Backend enum values for ticket priority. */
export const SUPPORT_TICKET_PRIORITY = {
  low: 1,
  normal: 2,
  high: 3,
  urgent: 4,
} as const;

export type SupportTicketPriority =
  (typeof SUPPORT_TICKET_PRIORITY)[keyof typeof SUPPORT_TICKET_PRIORITY];

export type SupportTicketAttachment = {
  id?: string;
  url: string;
  fileName: string;
  mimeType: string;
  sizeInBytes: number;
};

export type SupportTicketAttachmentPayload = Omit<SupportTicketAttachment, "id">;

export type SupportTicketRow = {
  id: string;
  ticketNumber: string;
  subject: string;
  status: SupportTicketStatus;
  priority: SupportTicketPriority;
  createdByName: string;
  assignedAdminName: string;
  lastMessageAt: string;
  createdAt: string;
};

export type SupportTicketMessage = {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  isInternalNote: boolean;
  createdAt: string;
  attachments: SupportTicketAttachment[];
};

export type SupportTicketDetail = {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  status: SupportTicketStatus;
  priority: SupportTicketPriority;
  createdByUserId: string;
  createdByName: string;
  assignedAdminId: string | null;
  assignedAdminName: string | null;
  closedAt: string | null;
  createdAt: string;
  lastMessageAt: string;
  messages: SupportTicketMessage[];
};

export type SupportTicketTablePage = {
  rows: SupportTicketRow[];
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

export type SupportTicketStats = {
  open: number;
  inProgress: number;
  closed: number;
  total: number;
};

export type CreateSupportTicketPayload = {
  subject: string;
  description: string;
  priority: SupportTicketPriority;
  attachments: SupportTicketAttachmentPayload[];
};

export type AddSupportTicketMessagePayload = {
  message: string;
  isInternalNote: boolean;
  attachments: SupportTicketAttachmentPayload[];
};
