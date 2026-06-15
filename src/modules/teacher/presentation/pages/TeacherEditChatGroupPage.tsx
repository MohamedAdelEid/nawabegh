"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Loader2, LockIcon, Save } from "lucide-react";
import {
  ChatGroupFormSectionCard,
  ChatGroupMediaToggles,
  ChatGroupSendPermissionSelector,
} from "@/modules/admin/presentation/components/chat-groups";
import { defaultChatGroupFormValues } from "@/modules/admin/domain/data/chatGroupFormData";
import {
  mapChatGroupDetailToFormValues,
  mapChatGroupFormToUpdatePayload,
} from "@/modules/admin/domain/utils/chatGroupMappers";
import type {
  ChatGroupChatModeId,
  ChatGroupFormValues,
  ChatGroupMediaPermissions,
} from "@/modules/admin/domain/types/chatGroups.types";
import {
  getChatGroupByCourseId,
  updateChatGroupByCourseId,
} from "@/modules/admin/infrastructure/api/chatGroupsApi";
import { SettingStar } from "@/modules/admin/presentation/assets/icons/SettingStar";
import { EditList } from "@/modules/admin/presentation/assets/icons/EditList";
import Relational from "@/modules/admin/presentation/assets/icons/relational.svg";
import { IconComp } from "@/modules/admin/presentation/assets/icons/IconComp";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { notify } from "@/shared/application/lib/toast";
import { DashboardPageHeader } from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";
import { LabeledInput } from "@/shared/presentation/components/ui/labeled-input";
import { StatusSwitch } from "@/shared/presentation/components/ui/StatusSwitch";

interface TeacherEditChatGroupPageProps {
  courseId: string;
  mode?: "edit" | "create";
}

export function TeacherEditChatGroupPage({
  courseId,
  mode = "edit",
}: TeacherEditChatGroupPageProps) {
  const t = useTranslations("teacher.dashboard.chatGroups.editPage");
  const router = useRouter();
  const queryClient = useQueryClient();
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">(
    mode === "create" ? "ready" : "loading",
  );
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState<ChatGroupFormValues | null>(
    mode === "create" ? { ...defaultChatGroupFormValues } : null,
  );

  useEffect(() => {
    if (mode === "create") return;

    let alive = true;
    const load = async () => {
      setLoadState("loading");
      const result = await getChatGroupByCourseId(courseId);
      if (!alive) return;

      if (!result.data) {
        setLoadState("error");
        notify.error(result.errorMessage ?? t("states.loadError"));
        return;
      }

      setForm(mapChatGroupDetailToFormValues(result.data));
      setLoadState("ready");
    };

    void load();
    return () => {
      alive = false;
    };
  }, [courseId, mode, t]);

  const handleFieldChange = useCallback(
    <K extends keyof ChatGroupFormValues>(field: K, value: ChatGroupFormValues[K]) => {
      setForm((prev) => (prev ? { ...prev, [field]: value } : prev));
    },
    [],
  );

  const handleCancel = () => {
    router.push(ROUTES.USER.TEACHER.CHAT_GROUPS.LIST);
  };

  const handleSave = async () => {
    if (!form) return;

    const displayName = form.groupName.trim();
    if (!displayName) {
      notify.error(t("states.nameRequired"));
      return;
    }

    if (mode === "create") {
      notify.success(t("states.createPending"));
      router.push(ROUTES.USER.TEACHER.CHAT_GROUPS.LIST);
      return;
    }

    setIsSaving(true);
    const result = await updateChatGroupByCourseId(
      courseId,
      mapChatGroupFormToUpdatePayload({ ...form, groupName: displayName }),
    );
    setIsSaving(false);

    if (!result.data) {
      notify.error(result.errorMessage ?? t("states.saveError"));
      return;
    }

    notify.success(result.message ?? t("states.saveSuccess"));
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["admin-chat-groups"] }),
      queryClient.invalidateQueries({ queryKey: ["admin-chat-groups-statistics"] }),
    ]);
    router.push(ROUTES.USER.TEACHER.CHAT_GROUPS.LIST);
  };

  if (loadState === "loading" || !form) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        {loadState === "error" ? (
          <>
            <p className="text-sm text-slate-500">{t("states.loadError")}</p>
            <Button type="button" variant="outline" onClick={handleCancel}>
              {t("buttons.cancel")}
            </Button>
          </>
        ) : (
          <Loader2 className="h-8 w-8 animate-spin text-[#243B5A]" />
        )}
      </div>
    );
  }

  return (
    <section className="space-y-8">
      <DashboardPageHeader
        title={mode === "create" ? t("titleCreate") : t("titleWithName", { name: form.groupName })}
        description={mode === "create" ? t("descriptionCreate") : t("descriptionEdit")}
        breadcrumbs={[
          { label: t("breadcrumbs.home"), href: ROUTES.USER.TEACHER.HOME },
          { label: t("breadcrumbs.chatGroups"), href: ROUTES.USER.TEACHER.CHAT_GROUPS.LIST },
          { label: mode === "create" ? t("breadcrumbs.create") : t("breadcrumbs.edit") },
        ]}
        action={
          <div className="flex items-center gap-4">
            <Button type="button" variant="outline" onClick={handleCancel} disabled={isSaving}>
              {t("buttons.cancel")}
            </Button>
            <Button
              type="button"
              onClick={() => void handleSave()}
              disabled={isSaving}
              className="bg-[#243B5A]"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {t("buttons.save")}
            </Button>
          </div>
        }
      />

      <div className="grid gap-10 lg:grid-cols-2">
        <ChatGroupFormSectionCard
          title={t("sections.identity.title")}
          subtitle={t("sections.identity.subtitle")}
          icon={EditList}
          accentColor="#67C23A"
        >
          <div className="space-y-5">
            <LabeledInput
              label={t("fields.groupName.label")}
              value={form.groupName}
              placeholder={t("fields.groupName.placeholder")}
              onChange={(value) => handleFieldChange("groupName", value)}
            />
            <LabeledInput
              label={t("fields.subject.label")}
              value={form.subjectDisplayName}
              placeholder="—"
              readOnly
              onChange={() => undefined}
            />
            <LabeledInput
              label={t("fields.grade.label")}
              value={form.gradeDisplayName}
              placeholder="—"
              readOnly
              onChange={() => undefined}
            />
            <div className="space-y-2 text-right">
              <label className="text-sm text-[#64748B]">{t("fields.description.label")}</label>
              <textarea
                value={form.description}
                placeholder={t("fields.description.placeholder")}
                onChange={(event) => handleFieldChange("description", event.target.value)}
                rows={4}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#243B5A]"
              />
            </div>
          </div>
        </ChatGroupFormSectionCard>

        <ChatGroupFormSectionCard
          title={t("sections.controlPrivacy.title")}
          subtitle={t("sections.controlPrivacy.subtitle")}
          icon={SettingStar}
          accentColor="#FF4B4B"
        >
          <div className="space-y-8">
            <ChatGroupSendPermissionSelector
              value={form.chatModeId}
              onChange={(val: ChatGroupChatModeId) => handleFieldChange("chatModeId", val)}
              everyoneLabel={t("fields.chatMode.everyone")}
              everyoneDescription={t("fields.chatMode.everyoneDesc")}
              teacherOnlyLabel={t("fields.chatMode.teacherOnly")}
              teacherOnlyDescription={t("fields.chatMode.teacherOnlyDesc")}
            />
            <ChatGroupMediaToggles
              value={form.mediaPermissions}
              onChange={(val: ChatGroupMediaPermissions) =>
                handleFieldChange("mediaPermissions", val)
              }
              blockAttachments={form.blockAttachments}
              onBlockAttachmentsChange={(val) => handleFieldChange("blockAttachments", val)}
              filesLabel={t("fields.media.files")}
              imagesLabel={t("fields.media.images")}
              pdfLabel={t("fields.media.pdf")}
              webLinksLabel={t("fields.media.webLinks")}
              blockAllLabel={t("fields.media.blockAll")}
              blockAllDescription={t("fields.media.blockAllDesc")}
            />
            <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-[#F8FAFC] p-5">
              <StatusSwitch
                checked={form.parentViewOnly}
                onChange={(checked) => handleFieldChange("parentViewOnly", checked)}
                activeLabel={t("fields.parentMode.label")}
                inactiveLabel={t("fields.parentMode.label")}
                activeClassName="bg-[#9B59B6]"
              />
              <div className="space-y-0.5 text-right">
                <span className="text-sm font-medium text-slate-700">
                  {t("fields.parentMode.label")}
                </span>
                <p className="text-xs text-slate-400">{t("fields.parentMode.description")}</p>
              </div>
            </label>
            <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-[#F8FAFC] p-5">
              <StatusSwitch
                checked={form.isLocked}
                onChange={(checked) => handleFieldChange("isLocked", checked)}
                activeLabel={t("fields.lockGroup.label")}
                inactiveLabel={t("fields.lockGroup.label")}
                activeClassName="bg-red-500"
              />
              <div className="flex items-center gap-3">
                <LockIcon className="h-5 w-5 text-slate-500" />
                <div className="space-y-0.5 text-right">
                  <span className="text-sm font-medium text-slate-700">
                    {t("fields.lockGroup.label")}
                  </span>
                  <p className="text-xs text-slate-400">{t("fields.lockGroup.description")}</p>
                </div>
              </div>
            </label>
          </div>
        </ChatGroupFormSectionCard>
      </div>
    </section>
  );
}
