"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  AlertTriangle,
  Ban,
  Calendar,
  Download,
  FileText,
  MoreVertical,
  Search,
} from "lucide-react";
import {
  useTeacherChatGroupSettingsMutation,
  useTeacherChatMembers,
} from "@/modules/teacher/application/hooks/useTeacherChatMembers";
import { useTeacherChatParticipantActions } from "@/modules/teacher/application/hooks/useTeacherChatConversation";
import { TeacherChatReasonModal } from "@/modules/teacher/presentation/components/chat-groups/TeacherChatReasonModal";
import type { TeacherChatParticipant } from "@/modules/teacher/domain/types/teacher.types";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { notify } from "@/shared/application/lib/toast";
import { Button } from "@/shared/presentation/components/ui/button";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/presentation/components/ui/popover";
import { StatusSwitch } from "@/shared/presentation/components/ui/StatusSwitch";
import { TeacherChatMembersSkeleton } from "@/modules/teacher/presentation/components/chat-groups/TeacherChatMembersSkeleton";
import { UserAvatarImageOrInitials } from "@/shared/presentation/components/user";
import { cn } from "@/shared/application/lib/cn";

type ParticipantAction = "ban" | "violation";

export function TeacherChatMembersView({ courseId }: { courseId: string }) {
  const t = useTranslations("teacher.dashboard.chatGroups.members");
  const tCommon = useTranslations("teacher.dashboard");
  const { data, isLoading, isError } = useTeacherChatMembers(courseId);
  const settingsMutation = useTeacherChatGroupSettingsMutation(courseId);
  const { banMutation, violationMutation } = useTeacherChatParticipantActions(courseId);
  const [query, setQuery] = useState("");
  const [actionTarget, setActionTarget] = useState<{
    participant: TeacherChatParticipant;
    action: ParticipantAction;
  } | null>(null);

  const filteredParticipants = useMemo(() => {
    if (!data) return [];
    if (!query.trim()) return data.participants;
    return data.participants.filter((participant) =>
      participant.name.toLowerCase().includes(query.trim().toLowerCase()),
    );
  }, [data, query]);

  const handleSettingsChange = async (settings: Parameters<typeof settingsMutation.mutate>[0]) => {
    try {
      await settingsMutation.mutateAsync(settings);
    } catch (error) {
      notify.error(error instanceof Error ? error.message : t("settingsError"));
    }
  };

  const handleParticipantAction = async (reason: string) => {
    if (!actionTarget) return;

    try {
      if (actionTarget.action === "ban") {
        await banMutation.mutateAsync({ userId: actionTarget.participant.id, reason });
        notify.success(t("actions.banSuccess", { name: actionTarget.participant.name }));
      } else {
        await violationMutation.mutateAsync({ userId: actionTarget.participant.id, reason });
        notify.success(t("actions.violationSuccess", { name: actionTarget.participant.name }));
      }
    } catch (error) {
      notify.error(
        error instanceof Error
          ? error.message
          : actionTarget.action === "ban"
            ? t("actions.banError")
            : t("actions.violationError"),
      );
      throw error;
    }
  };

  if (isLoading) {
    return <TeacherChatMembersSkeleton label={tCommon("common.loading")} />;
  }

  if (isError || !data) {
    return <p className="text-sm text-red-600">{t("error")}</p>;
  }

  const teacher = filteredParticipants.find((p) => p.role === "teacher");
  const students = filteredParticipants.filter((p) => p.role === "student");

  const statusLabel = (status: string) => {
    if (status === "online") return t("status.online");
    if (status === "typing") return t("status.typing");
    return t("status.offline");
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <Card className="rounded-[2rem] border-white/80 bg-white shadow-[var(--dashboard-shadow-soft)]">
        <CardContent className="space-y-5 p-6">
          <div className="flex items-center justify-between">
            <div className="flex -space-x-2 rtl:space-x-reverse">
              {data.participants.slice(0, 4).map((participant) => (
                <UserAvatarImageOrInitials
                  key={participant.id}
                  trackKey={participant.id}
                  name={participant.name}
                  imageUrl={participant.profileImageUrl ?? null}
                  size="sm"
                />
              ))}
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600 ring-2 ring-white">
                +{Math.max(data.totalParticipants - 4, 0)}
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-800">
              {t("participantsTitle", { count: data.totalParticipants })}
            </h2>
          </div>

          <div className="relative">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("searchPlaceholder")}
              className="w-full rounded-xl border border-slate-200 py-3 pr-10 pl-4 text-right text-sm outline-none focus:border-[#243B5A]"
            />
          </div>

          <div className="space-y-3">
            {teacher ? (
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <span className="rounded-full bg-[#243B5A] px-3 py-1 text-xs font-medium text-white">
                  {teacher.isGroupAdmin ? t("groupAdmin") : t("youTeacher")}
                </span>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-medium text-slate-800">{teacher.name}</p>
                    <p className="text-xs text-emerald-600">{t("status.online")}</p>
                  </div>
                  <UserAvatarImageOrInitials
                    trackKey={teacher.id}
                    name={teacher.name}
                    imageUrl={teacher.profileImageUrl ?? null}
                    size="sm"
                  />
                </div>
              </div>
            ) : null}

            <p className="text-right text-xs font-semibold text-slate-400">{t("connectedStudents")}</p>

            {students.length === 0 ? (
              <p className="text-center text-sm text-slate-400">{t("noStudents")}</p>
            ) : (
              students.map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center justify-between rounded-2xl px-2 py-2 hover:bg-slate-50"
                >
                  <div className="flex items-center gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="start" className="w-44 space-y-1 p-2">
                        <button
                          type="button"
                          className="flex w-full items-center justify-end gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                          onClick={() =>
                            setActionTarget({ participant, action: "ban" })
                          }
                        >
                          {t("actions.ban")}
                          <Ban className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          className="flex w-full items-center justify-end gap-2 rounded-lg px-3 py-2 text-sm text-amber-700 hover:bg-amber-50"
                          onClick={() =>
                            setActionTarget({ participant, action: "violation" })
                          }
                        >
                          {t("actions.violation")}
                          <AlertTriangle className="h-4 w-4" />
                        </button>
                      </PopoverContent>
                    </Popover>
                    {participant.isMuted ? (
                      <span className="text-xs text-red-400">{t("muted")}</span>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-medium text-slate-800">{participant.name}</p>
                      <p
                        className={cn(
                          "text-xs",
                          participant.status === "typing"
                            ? "text-sky-600"
                            : participant.status === "online"
                              ? "text-emerald-600"
                              : "text-slate-400",
                        )}
                      >
                        {statusLabel(participant.status)}
                      </p>
                    </div>
                    <div className="relative">
                      <UserAvatarImageOrInitials
                        trackKey={participant.id}
                        name={participant.name}
                        imageUrl={participant.profileImageUrl ?? null}
                        size="sm"
                      />
                      {participant.status === "online" || participant.status === "typing" ? (
                        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
                      ) : null}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {data.totalParticipants > data.visibleParticipants ? (
            <Button variant="outline" className="w-full rounded-xl" disabled>
              {t("loadMore", { count: data.totalParticipants - data.visibleParticipants })}
            </Button>
          ) : null}
        </CardContent>
      </Card>

      <div className="space-y-5">
        <Card className="rounded-[2rem] border-white/80 bg-white shadow-[var(--dashboard-shadow-soft)]">
          <CardContent className="space-y-4 p-6 text-right">
            <div className="mx-auto flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-slate-100">
              {data.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={data.imageUrl} alt={data.title} className="h-full w-full object-cover" />
              ) : (
                <FileText className="h-8 w-8 text-slate-400" />
              )}
            </div>
            <h3 className="text-lg font-bold text-slate-800">{data.title}</h3>
            <p className="text-sm leading-relaxed text-slate-500">{data.description || t("noDescription")}</p>
            <p className="flex items-center justify-end gap-2 text-xs text-slate-400">
              <Calendar className="h-4 w-4" />
              {t("createdAt", { date: data.createdAtLabel })}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-white/80 bg-white shadow-[var(--dashboard-shadow-soft)]">
          <CardContent className="space-y-4 p-6">
            <h3 className="text-right font-bold text-slate-800">{t("settings.title")}</h3>
            {[
              {
                key: "muteNotifications" as const,
                label: t("settings.mute"),
                value: data.settings.muteNotifications,
              },
              {
                key: "pinGroup" as const,
                label: t("settings.pin"),
                value: data.settings.pinGroup,
              },
            ].map((item) => (
              <label
                key={item.key}
                className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 px-4 py-3"
              >
                <StatusSwitch
                  checked={item.value}
                  disabled={settingsMutation.isPending}
                  onChange={(checked) => void handleSettingsChange({ [item.key]: checked })}
                  activeLabel={item.label}
                  inactiveLabel={item.label}
                />
                <span className="text-sm text-slate-700">{item.label}</span>
              </label>
            ))}

            <div className="space-y-2 text-right">
              <p className="text-sm font-medium text-slate-700">{t("settings.chatStatus")}</p>
              <div className="grid grid-cols-2 gap-2">
                {[true, false].map((open) => (
                  <button
                    key={String(open)}
                    type="button"
                    disabled={settingsMutation.isPending}
                    onClick={() => void handleSettingsChange({ chatOpen: open })}
                    className={cn(
                      "rounded-xl border px-4 py-2 text-sm font-medium transition-colors",
                      data.settings.chatOpen === open
                        ? "border-[#243B5A] bg-[#243B5A] text-white"
                        : "border-slate-200 bg-white text-slate-600",
                    )}
                  >
                    {open ? t("settings.open") : t("settings.closed")}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-white/80 bg-white shadow-[var(--dashboard-shadow-soft)]">
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center justify-between">
              <Button variant="link" className="h-auto p-0 text-sm" asChild>
                <Link href={ROUTES.USER.TEACHER.CHAT_GROUPS.VIEW(courseId)}>
                  {t("media.viewAll")}
                </Link>
              </Button>
              <h3 className="font-bold text-slate-800">{t("media.title")}</h3>
            </div>
            {data.mediaUrls.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {data.mediaUrls.map((url, index) => (
                  <div
                    key={url}
                    className="relative aspect-square overflow-hidden rounded-xl bg-slate-100"
                    style={{ backgroundImage: `url(${url})`, backgroundSize: "cover" }}
                  >
                    {index === 0 && data.extraMediaCount > 0 ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-sm font-bold text-white">
                        +{data.extraMediaCount}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-sm text-slate-400">{t("media.empty")}</p>
            )}
            <div className="space-y-2">
              {data.files.length === 0 ? (
                <p className="text-center text-sm text-slate-400">{t("files.empty")}</p>
              ) : (
                data.files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2"
                  >
                    {file.url ? (
                      <a href={file.url} target="_blank" rel="noreferrer" aria-label={file.name}>
                        <Download className="h-4 w-4 text-slate-400" />
                      </a>
                    ) : (
                      <Download className="h-4 w-4 text-slate-400" />
                    )}
                    <div className="text-right">
                      <p className="text-sm font-medium text-slate-700">{file.name}</p>
                      <p className="text-xs text-slate-400">
                        {file.dateLabel} · {file.sizeLabel}
                      </p>
                    </div>
                    <FileText
                      className={cn(
                        "h-5 w-5",
                        file.type === "pdf" ? "text-red-500" : "text-blue-500",
                      )}
                    />
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <TeacherChatReasonModal
        open={Boolean(actionTarget)}
        onOpenChange={(open) => !open && setActionTarget(null)}
        title={
          actionTarget?.action === "ban"
            ? t("actions.banTitle", { name: actionTarget.participant.name })
            : t("actions.violationTitle", { name: actionTarget?.participant.name ?? "" })
        }
        description={
          actionTarget?.action === "ban"
            ? t("actions.banDescription")
            : t("actions.violationDescription")
        }
        confirmLabel={
          actionTarget?.action === "ban" ? t("actions.banConfirm") : t("actions.violationConfirm")
        }
        placeholder={t("actions.reasonPlaceholder")}
        isPending={banMutation.isPending || violationMutation.isPending}
        onConfirm={handleParticipantAction}
      />
    </div>
  );
}
