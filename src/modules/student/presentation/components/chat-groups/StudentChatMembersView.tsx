"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  ArrowRight,
  Bell,
  Calendar,
  Download,
  FileText,
  Pin,
  Share2,
} from "lucide-react";
import {
  useStudentChatGroupPreferencesMutation,
  useStudentChatMembers,
} from "@/modules/student/application/hooks/useStudentChatMembers";
import { StudentChatMembersSkeleton } from "@/modules/student/presentation/components/chat-groups/StudentChatSkeletons";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { notify } from "@/shared/application/lib/toast";
import { cn } from "@/shared/application/lib/cn";
import { Button } from "@/shared/presentation/components/ui/button";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { StatusSwitch } from "@/shared/presentation/components/ui/StatusSwitch";
import { UserAvatarImageOrInitials } from "@/shared/presentation/components/user";

type MediaTab = "media" | "files";

export function StudentChatMembersView({ courseId }: { courseId: string }) {
  const t = useTranslations("student.dashboard.chatGroups.members");
  const tList = useTranslations("student.dashboard.chatGroups");
  const { data, isLoading, isError } = useStudentChatMembers(courseId);
  const settingsMutation = useStudentChatGroupPreferencesMutation(courseId);
  const [showAllParticipants, setShowAllParticipants] = useState(false);
  const [mediaTab, setMediaTab] = useState<MediaTab>("media");

  const { teacher, students, visibleStudents } = useMemo(() => {
    if (!data) {
      return { teacher: null, students: [], visibleStudents: [] };
    }
    const nextTeacher = data.participants.find((p) => p.role === "teacher") ?? null;
    const nextStudents = data.participants.filter((p) => p.role === "student");
    return {
      teacher: nextTeacher,
      students: nextStudents,
      visibleStudents: showAllParticipants ? nextStudents : nextStudents.slice(0, 4),
    };
  }, [data, showAllParticipants]);

  const handleSettingsChange = async (
    settings: Parameters<typeof settingsMutation.mutate>[0],
  ) => {
    try {
      await settingsMutation.mutateAsync(settings);
    } catch (error) {
      notify.error(error instanceof Error ? error.message : t("settingsError"));
    }
  };

  const handleShare = async () => {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}${ROUTES.USER.STUDENT.CHAT_GROUPS.VIEW(courseId)}`
        : ROUTES.USER.STUDENT.CHAT_GROUPS.VIEW(courseId);
    try {
      await navigator.clipboard.writeText(url);
      notify.success(t("shareCopied"));
    } catch {
      notify.error(t("settingsError"));
    }
  };

  if (isLoading) {
    return <StudentChatMembersSkeleton label={tList("loading")} />;
  }

  if (isError || !data) {
    return <p className="text-sm text-red-600">{t("error")}</p>;
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="gap-2 rounded-xl text-slate-600"
          onClick={() => void handleShare()}
        >
          <Share2 className="h-4 w-4" />
          {t("share")}
        </Button>

        <div className="flex items-center gap-3 text-right">
          <Button variant="ghost" size="icon" className="rounded-xl" asChild>
            <Link href={ROUTES.USER.STUDENT.CHAT_GROUPS.VIEW(courseId)}>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <p className="font-bold text-slate-800">{data.title}</p>
            <p className="text-xs text-slate-500">{t("headerTitle")}</p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-slate-100">
            {data.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={data.imageUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <FileText className="h-5 w-5 text-slate-400" />
            )}
          </div>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <Card className="rounded-[2rem] border-white/80 bg-white shadow-[var(--dashboard-shadow-soft)]">
            <CardContent className="space-y-5 p-6">
              <h2 className="text-right text-lg font-bold text-slate-800">
                {t("participantsTitle", { count: data.totalParticipants })}
              </h2>

              {teacher ? (
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <span className="rounded-full bg-[#c7af6d] px-3 py-1 text-xs font-medium text-white">
                    {t("teacherBadge")}
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-medium text-slate-800">{teacher.name}</p>
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

              {visibleStudents.length === 0 && !teacher ? (
                <p className="text-center text-sm text-slate-400">{t("emptyParticipants")}</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {visibleStudents.map((participant) => (
                    <div
                      key={participant.id}
                      className="flex items-center justify-end gap-3 rounded-2xl px-2 py-2 hover:bg-slate-50"
                    >
                      <div className="min-w-0 text-right">
                        <p className="truncate font-medium text-slate-800">{participant.name}</p>
                      </div>
                      <UserAvatarImageOrInitials
                        trackKey={participant.id}
                        name={participant.name}
                        imageUrl={participant.profileImageUrl ?? null}
                        size="sm"
                      />
                    </div>
                  ))}
                </div>
              )}

              {students.length > 4 ? (
                <button
                  type="button"
                  className="w-full text-center text-sm font-medium text-[#c7af6d] hover:underline"
                  onClick={() => setShowAllParticipants((value) => !value)}
                >
                  {t("viewAll")}
                </button>
              ) : null}
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-white/80 bg-white shadow-[var(--dashboard-shadow-soft)]">
            <CardContent className="space-y-5 p-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <button
                  type="button"
                  className="text-sm font-medium text-[#c7af6d] hover:underline"
                  onClick={() => setShowAllParticipants(true)}
                >
                  {t("media.viewAll")}
                </button>
                <div className="flex items-center gap-4">
                  {(
                    [
                      { id: "files" as const, label: t("media.files") },
                      { id: "media" as const, label: t("media.title") },
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setMediaTab(tab.id)}
                      className={cn(
                        "pb-2 text-sm font-bold transition-colors",
                        mediaTab === tab.id
                          ? "border-b-2 border-[#c7af6d] text-[#2c4260]"
                          : "text-slate-400",
                      )}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {mediaTab === "media" ? (
                data.mediaUrls.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {data.mediaUrls.map((url) => (
                      <a
                        key={url}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="aspect-square overflow-hidden rounded-xl bg-slate-100 bg-cover bg-center"
                        style={{ backgroundImage: `url(${url})` }}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-sm text-slate-400">{t("media.empty")}</p>
                )
              ) : null}

              {mediaTab === "files" || data.files.length > 0 ? (
                <div className="space-y-3">
                  {mediaTab === "media" && data.files.length > 0 ? (
                    <h3 className="text-right text-sm font-bold text-slate-700">
                      {t("media.recentDocs")}
                    </h3>
                  ) : null}
                  {(mediaTab === "files" ? data.files : data.files.slice(0, 3)).length === 0 ? (
                    <p className="text-center text-sm text-slate-400">{t("files.empty")}</p>
                  ) : (
                    (mediaTab === "files" ? data.files : data.files.slice(0, 3)).map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-3"
                      >
                        {file.url ? (
                          <a href={file.url} target="_blank" rel="noreferrer" aria-label={file.name}>
                            <Download className="h-4 w-4 text-slate-400" />
                          </a>
                        ) : (
                          <Download className="h-4 w-4 text-slate-400" />
                        )}
                        <div className="min-w-0 flex-1 text-right">
                          <p className="truncate text-sm font-medium text-slate-700">{file.name}</p>
                          <p className="text-xs text-slate-400">
                            {file.sizeLabel} · {file.dateLabel}
                          </p>
                        </div>
                        <FileText
                          className={cn(
                            "h-5 w-5 shrink-0",
                            file.type === "pdf" ? "text-red-500" : "text-blue-500",
                          )}
                        />
                      </div>
                    ))
                  )}
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="rounded-[2rem] border-white/80 bg-white shadow-[var(--dashboard-shadow-soft)]">
            <CardContent className="space-y-4 p-6 text-right">
              <div className="mx-auto flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-slate-100">
                {data.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={data.imageUrl} alt={data.title} className="h-full w-full object-cover" />
                ) : (
                  <FileText className="h-8 w-8 text-slate-400" />
                )}
              </div>
              <h3 className="text-lg font-bold text-[#2c4260]">{data.title}</h3>
              <p className="text-sm leading-relaxed text-slate-500">
                {data.description || t("noDescription")}
              </p>
              <p className="flex items-center justify-end gap-2 text-xs text-slate-400">
                <Calendar className="h-4 w-4" />
                {t("createdAt", { date: data.createdAtLabel })}
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-white/80 bg-white shadow-[var(--dashboard-shadow-soft)]">
            <CardContent className="space-y-4 p-6">
              <h3 className="text-right text-sm font-medium text-slate-400">{t("settings.title")}</h3>
              {(
                [
                  {
                    key: "muteNotifications" as const,
                    label: t("settings.mute"),
                    icon: Bell,
                    value: data.settings.muteNotifications,
                  },
                  {
                    key: "pinGroup" as const,
                    label: t("settings.pin"),
                    icon: Pin,
                    value: data.settings.pinGroup,
                  },
                ] as const
              ).map((item) => (
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
                  <span className="inline-flex items-center gap-2 text-sm text-slate-700">
                    {item.label}
                    <item.icon className="h-4 w-4 text-slate-400" />
                  </span>
                </label>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
