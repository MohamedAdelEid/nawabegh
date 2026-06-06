"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  AddSupportTicketMessagePayload,
  SupportTicketAttachmentPayload,
  SupportTicketDetail,
  SupportTicketStatus,
} from "@/modules/admin/domain/types/supportTickets.types";
import {
  addSupportTicketMessage,
  assignSupportTicket,
  getSupportTicketById,
  updateSupportTicketStatus,
} from "@/modules/admin/infrastructure/api/supportTicketsApi";

export function useSupportTicketDetail(ticketId: string | null) {
  const [ticket, setTicket] = useState<SupportTicketDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadTicket = useCallback(async () => {
    if (!ticketId) {
      setTicket(null);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const result = await getSupportTicketById(ticketId);
    if (result.data) {
      setTicket(result.data);
    } else {
      setTicket(null);
      setErrorMessage(result.errorMessage ?? "Failed to load ticket");
    }

    setIsLoading(false);
  }, [ticketId]);

  useEffect(() => {
    void loadTicket();
  }, [loadTicket]);

  const sendReply = useCallback(
    async (
      message: string,
      options?: {
        isInternalNote?: boolean;
        attachments?: SupportTicketAttachmentPayload[];
      },
    ) => {
      if (!ticketId || !message.trim()) return { ok: false as const, errorMessage: "Empty message" };

      const payload: AddSupportTicketMessagePayload = {
        message: message.trim(),
        isInternalNote: options?.isInternalNote ?? false,
        attachments: options?.attachments ?? [],
      };

      setIsSaving(true);
      const result = await addSupportTicketMessage(ticketId, payload);
      setIsSaving(false);

      if (result.errorMessage) {
        return { ok: false as const, errorMessage: result.errorMessage };
      }

      await loadTicket();
      return { ok: true as const };
    },
    [loadTicket, ticketId],
  );

  const changeStatus = useCallback(
    async (status: SupportTicketStatus) => {
      if (!ticketId) return { ok: false as const, errorMessage: "No ticket selected" };

      setIsSaving(true);
      const result = await updateSupportTicketStatus(ticketId, status);
      setIsSaving(false);

      if (+result.status === 200) {
        setTicket(result.data ?? null);
        return { ok: true as const };
      }

      return { ok: false as const, errorMessage: result.errorMessage ?? "Failed to update status" };
    },
    [ticketId],
  );

  const assignTicket = useCallback(
    async (assignedAdminId?: string) => {
      if (!ticketId) return { ok: false as const, errorMessage: "No ticket selected" };

      setIsSaving(true);
      const result = await assignSupportTicket(ticketId, assignedAdminId);
      console.log(JSON.stringify(result, null, 2));
      setIsSaving(false);

      if (+result.status === 200) {
        setTicket(result.data);
        return { ok: true as const };
      }

      return { ok: false as const, errorMessage: result.errorMessage ?? "Failed to assign ticket" };
    },
    [ticketId],
  );

  return {
    ticket,
    isLoading,
    isSaving,
    errorMessage,
    loadTicket,
    sendReply,
    changeStatus,
    assignTicket,
  };
}
