"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  FileText,
  ImageIcon,
  Paperclip,
  Send,
  UserRound,
} from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useSupportTicketDetail } from "@/modules/admin/application/hooks/useSupportTicketDetail";
import {
  SUPPORT_TICKET_STATUS,
  type SupportTicketStatus,
} from "@/modules/admin/domain/types/supportTickets.types";
import {
  formatSupportTicketDate,
  getInitials,
  supportTicketPriorityTone,
  supportTicketStatusTone,
} from "@/modules/admin/presentation/components/support-tickets/supportTicketDisplay";
import { notify } from "@/shared/application/lib/toast";
import { DashboardBadge, DashboardFilterSelect } from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";
import { LabeledTextarea } from "@/shared/presentation/components/ui/labeled-textarea";
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/shared/presentation/components/ui/sheet";
import { resolveFileUrl } from "@/shared/infrastructure/files/fileUrl";

export type SupportTicketDetailSheetProps = {
  ticketId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated?: () => void;
};

export function SupportTicketDetailSheet({
  ticketId,
  open,
  onOpenChange,
  onUpdated,
}: SupportTicketDetailSheetProps) {
  const t = useTranslations("admin.dashboard.supportTickets.detail");
  const tTable = useTranslations("admin.dashboard.supportTickets.table");
  const locale = useLocale();
  const detail = useSupportTicketDetail(open ? ticketId : null);
  const ticket = detail.ticket;

  const [reply, setReply] = useState("");
  const [statusDraft, setStatusDraft] = useState<SupportTicketStatus>(SUPPORT_TICKET_STATUS.open);

  useEffect(() => {
    if (ticket) {
      setStatusDraft(ticket.status);
    }
  }, [ticket]);

  const allAttachments = useMemo(() => {
    if (!ticket) return [];
    return ticket.messages.flatMap((message) => message.attachments);
  }, [ticket]);

  const handleSendReply = async () => {
    if (!reply.trim()) return;
    
    const result = await detail.sendReply(reply);
    if (!result.ok) {
      notify.error(result.errorMessage ?? t("errors.sendReply"));
      return;
    }

    notify.success(t("reply.success"));
    setReply("");
    onUpdated?.();
  };

  const handleSaveChanges = async () => {
    if (!ticket || statusDraft === ticket.status) return;

    const result = await detail.changeStatus(statusDraft);
    console.log(JSON.stringify(result, null, 2));
    if (!result.ok) {
      notify.error(result.errorMessage ?? t("errors.updateStatus"));
      return;
    }

    notify.success(t("status.success"));
    onUpdated?.();
  };

  const handleCloseTicket = async () => {
    const result = await detail.changeStatus(SUPPORT_TICKET_STATUS.closed);
    if (!result.ok) {
      notify.error(result.errorMessage ?? t("errors.closeTicket"));
      return;
    }

    notify.success(t("close.success"));
    onUpdated?.();
  };

  const handleAssignToMe = async () => {
    const result = await detail.assignTicket();
    if (!result.ok) {
      notify.error(result.errorMessage ?? t("errors.assign"));
      return;
    }

    notify.success(t("assign.success"));
    onUpdated?.();
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="w-full overflow-y-auto border-slate-200 bg-[#F8FAFC] p-0 sm:max-w-2xl lg:max-w-3xl"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>
            {ticket
              ? t("ticketNumber", { number: ticket.ticketNumber })
              : t("sheetTitle")}
          </SheetTitle>
          {ticket ? (
            <SheetDescription>
              {t("createdAt", {
                date: formatSupportTicketDate(ticket.createdAt || ticket.lastMessageAt, locale),
              })}
            </SheetDescription>
          ) : null}
        </SheetHeader>

        {detail.isLoading ? (
          <div className="space-y-6 p-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-48 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
          </div>
        ) : detail.errorMessage || !ticket ? (
          <div className="flex min-h-full flex-col items-center justify-center gap-4 p-8 text-center">
            <p className="text-lg font-semibold text-slate-700">
              {detail.errorMessage ?? t("errors.notFound")}
            </p>
            <Button type="button" variant="outline" onClick={() => void detail.loadTicket()}>
              {t("errors.retry")}
            </Button>
          </div>
        ) : (
          <div className="flex min-h-full flex-col">
            <SheetHeader className="space-y-4 border-b border-slate-200 bg-white p-6 text-right">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <DashboardBadge tone={supportTicketStatusTone(ticket.status)} withDot>
                  {tTable(`statuses.${ticket.status}`)}
                </DashboardBadge>
                <div className="space-y-1">
                  <h2 className="text-right text-xl font-bold text-slate-800">
                    {t("ticketNumber", { number: ticket.ticketNumber })}
                  </h2>
                  <p className="text-right text-sm text-slate-500">
                    {t("createdAt", {
                      date: formatSupportTicketDate(ticket.createdAt || ticket.lastMessageAt, locale),
                    })}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2">
                <DashboardBadge tone={supportTicketPriorityTone(ticket.priority)}>
                  {tTable(`priorities.${ticket.priority}`)}
                </DashboardBadge>
                {ticket.assignedAdminName ? (
                  <span className="text-sm text-slate-500">
                    {t("assignedTo", { name: ticket.assignedAdminName })}
                  </span>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                    disabled={detail.isSaving}
                    onClick={() => void handleAssignToMe()}
                  >
                    {t("assign.action")}
                  </Button>
                )}
              </div>
            </SheetHeader>

            <div className="space-y-6 p-6">
              <section className="rounded-[1.75rem] border border-white/80 bg-white p-5 shadow-[var(--dashboard-shadow-soft)]">
                <h3 className="mb-4 text-right text-sm font-semibold text-slate-700">
                  {t("owner.title")}
                </h3>
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#DCE6F5] text-lg font-bold text-[#2C4260]">
                    {getInitials(ticket.createdByName)}
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="font-semibold text-slate-800">{ticket.createdByName}</p>
                    <div className="flex items-center justify-end gap-2 text-sm text-slate-500">
                      <UserRound className="h-4 w-4" aria-hidden />
                      <span>{t("owner.userId", { id: ticket.createdByUserId.slice(0, 8) })}</span>
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-[1.75rem] border border-white/80 bg-white p-5 shadow-[var(--dashboard-shadow-soft)]">
                <h3 className="mb-2 text-right text-sm font-semibold text-slate-700">
                  {t("problem.title")}
                </h3>
                <p className="mb-2 text-right text-base font-semibold text-slate-800">
                  {ticket.subject}
                </p>
                <p className="whitespace-pre-wrap text-right text-sm leading-7 text-slate-600">
                  {ticket.description}
                </p>
              </section>

              {allAttachments.length > 0 ? (
                <section className="rounded-[1.75rem] border border-white/80 bg-white p-5 shadow-[var(--dashboard-shadow-soft)]">
                  <h3 className="mb-4 text-right text-sm font-semibold text-slate-700">
                    {t("attachments.title", { count: allAttachments.length })}
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {allAttachments.map((attachment, index) => {
                      const url = resolveFileUrl(attachment.url) ?? attachment.url;
                      const isImage = attachment.mimeType.startsWith("image/");

                      return (
                        <a
                          key={`${attachment.url}-${index}`}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3 transition hover:border-[#C7AF6E]/40"
                        >
                          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white">
                            {isImage && url ? (
                              <Image
                                src={url}
                                alt={attachment.fileName}
                                fill
                                unoptimized
                                className="object-cover"
                              />
                            ) : (
                              <FileText className="h-6 w-6 text-slate-400" aria-hidden />
                            )}
                          </div>
                          <div className="min-w-0 flex-1 text-right">
                            <p className="truncate text-sm font-medium text-slate-700">
                              {attachment.fileName}
                            </p>
                            <p className="text-xs text-slate-400">
                              {isImage ? (
                                <span className="inline-flex items-center gap-1">
                                  <ImageIcon className="h-3 w-3" aria-hidden />
                                  {t("attachments.image")}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1">
                                  <Paperclip className="h-3 w-3" aria-hidden />
                                  {t("attachments.file")}
                                </span>
                              )}
                            </p>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </section>
              ) : null}

              {ticket.messages.length > 0 ? (
                <section className="space-y-3">
                  <h3 className="text-right text-sm font-semibold text-slate-700">
                    {t("messages.title")}
                  </h3>
                  {ticket.messages.map((message) => (
                    <article
                      key={message.id}
                      className="rounded-[1.5rem] border border-slate-100 bg-white p-4 text-right shadow-sm"
                    >
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <span className="text-xs text-slate-400">
                          {formatSupportTicketDate(message.createdAt, locale)}
                        </span>
                        <span className="text-sm font-semibold text-slate-700">
                          {message.senderName}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap text-sm leading-7 text-slate-600">
                        {message.message}
                      </p>
                    </article>
                  ))}
                </section>
              ) : null}

              <section className="rounded-[1.75rem] border border-white/80 bg-white p-5 shadow-[var(--dashboard-shadow-soft)]">
                <LabeledTextarea
                  label={t("reply.label")}
                  placeholder={t("reply.placeholder")}
                  value={reply}
                  onChange={setReply}
                  rows={5}
                  disabled={detail.isSaving || ticket.status === SUPPORT_TICKET_STATUS.closed}
                  textareaClassName="min-h-[8rem]"
                />
                <div className="mt-4 flex justify-end">
                  <Button
                    type="button"
                    className="h-12 rounded-2xl bg-[#2C4260] px-6 text-white hover:bg-[#243751]"
                    disabled={detail.isSaving || !reply.trim() || ticket.status === SUPPORT_TICKET_STATUS.closed}
                    onClick={() => void handleSendReply()}
                  >
                    <Send className="ms-2 h-4 w-4" aria-hidden />
                    {t("reply.send")}
                  </Button>
                </div>
              </section>
            </div>

            <footer className="mt-auto border-t border-slate-200 bg-white p-6">
              <div className="mb-4">
                <DashboardFilterSelect
                  label={t("status.label")}
                  value={String(statusDraft)}
                  options={[
                    { id: "1", label: tTable("statuses.1") },
                    { id: "2", label: tTable("statuses.2") },
                    { id: "3", label: tTable("statuses.3") },
                  ]}
                  onChange={(value) => setStatusDraft(Number(value) as SupportTicketStatus)}
                  disabled={detail.isSaving || ticket.status === SUPPORT_TICKET_STATUS.closed}
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 rounded-2xl"
                  disabled={detail.isSaving || ticket.status === SUPPORT_TICKET_STATUS.closed}
                  onClick={() => void handleCloseTicket()}
                >
                  <CheckCircle2 className="ms-2 h-4 w-4" aria-hidden />
                  {t("close.action")}
                </Button>
                <Button
                  type="button"
                  className="h-12 rounded-2xl bg-[#C7AF6E] px-6 text-white hover:bg-[#B89D5E]"
                  disabled={
                    detail.isSaving ||
                    statusDraft === ticket.status ||
                    ticket.status === SUPPORT_TICKET_STATUS.closed
                  }
                  onClick={() => void handleSaveChanges()}
                >
                  {t("status.save")}
                </Button>
              </div>
            </footer>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
