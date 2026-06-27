"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Save, Loader2, LockIcon } from "lucide-react";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { notify } from "@/shared/application/lib/toast";
import {DashboardPageHeader,
  DashboardBreadcrumb,} from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";
import { LabeledInput } from "@/shared/presentation/components/ui/labeled-input";
import { StatusSwitch } from "@/shared/presentation/components/ui/StatusSwitch";
import Relational from "../assets/icons/relational.svg";

import {
  ChatGroupFormSectionCard,
  ChatGroupSendPermissionSelector,
  ChatGroupMediaToggles,
} from "@/modules/admin/presentation/components/chat-groups";
import {
  getChatGroupByCourseId,
  updateChatGroupByCourseId,
} from "@/modules/admin/infrastructure/api/chatGroupsApi";
import {
  mapChatGroupDetailToFormValues,
  mapChatGroupFormToUpdatePayload,
} from "@/modules/admin/domain/utils/chatGroupMappers";
import type {
  ChatGroupFormValues,
  ChatGroupChatModeId,
  ChatGroupMediaPermissions,
} from "@/modules/admin/domain/types/chatGroups.types";
import { EditList } from "../assets/icons/EditList";
import { SettingStar } from "../assets/icons/SettingStar";
import { IconComp } from "../assets/icons/IconComp";

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

interface AdminEditChatGroupPageProps {
  /** Route segment value — API path uses `courseId`. */
  courseId: string;
}

export function AdminEditChatGroupPage({ courseId }: AdminEditChatGroupPageProps) {
  const t = useTranslations("admin.dashboard.chatGroups.editPage");
  const router = useRouter();
  const queryClient = useQueryClient();
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState<ChatGroupFormValues | null>(null);

  useEffect(() => {
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
  }, [courseId, t]);

  const handleFieldChange = useCallback(
    <K extends keyof ChatGroupFormValues>(field: K, value: ChatGroupFormValues[K]) => {
      setForm((prev) => (prev ? { ...prev, [field]: value } : prev));
    },
    [],
  );

  const handleCancel = () => {
    router.push(`${ROUTES.ADMIN.HOME}?tab=chatGroups`);
  };

  const handleSave = async () => {
    if (!form) return;

    const displayName = form.groupName.trim();
    if (!displayName) {
      notify.error(t("states.nameRequired"));
      return;
    }

    setIsSaving(true);
    const result = await updateChatGroupByCourseId(
      courseId,
      mapChatGroupFormToUpdatePayload({ ...form, groupName: displayName }),
    );
    setIsSaving(false);

    console.log("result", result);
    if (!result.data) {
      notify.error(result.errorMessage ?? t("states.saveError"));
      return;
    }

    notify.success(result.message ?? t("states.saveSuccess"));
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["admin-chat-groups"] }),
      queryClient.invalidateQueries({ queryKey: ["admin-chat-groups-statistics"] }),
    ]);
    router.push(`${ROUTES.ADMIN.HOME}?tab=chatGroups`);
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
            <div className="space-y-2">
        <DashboardBreadcrumb items={[
          { label: t("breadcrumbs.home"), href: ROUTES.ADMIN.HOME },
          { label: t("breadcrumbs.chatGroups"), href: `${ROUTES.ADMIN.HOME}?tab=chatGroups` },
          { label: t("breadcrumbs.edit") },
        ]} />
        <DashboardPageHeader
        title={t("titleWithName", { name: form.groupName })}
        action={
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="flex items-center justify-start gap-4"
          >
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSaving}
              className="h-14 gap-2 rounded-2xl border-2 border-[#243B5A] px-8 text-base font-semibold text-[#243B5A] transition-colors hover:bg-slate-50"
            >
              {t("buttons.cancel")}
            </Button>
            <Button
              type="button"
              onClick={() => void handleSave()}
              disabled={isSaving}
              className="h-14 gap-2 rounded-2xl bg-[#243B5A] px-8 text-base font-semibold text-white shadow-[0_4px_0_0_#1a2d45] hover:bg-[#243B5A]"
            >
              {isSaving ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Save className="h-5 w-5" />
              )}
              {t("buttons.save")}
            </Button>
          </motion.div>
        }
      />
      </div>

      <div className="space-y-10">
        <div className="grid items-stretch gap-10 lg:grid-cols-[minmax(0,1fr)]">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="flex min-h-0 h-full flex-col"
          >
            <ChatGroupFormSectionCard
              fillHeight
              title={t("sections.identity.title")}
              subtitle={t("sections.identity.subtitle")}
              icon={EditList}
              accentColor="#67C23A"
            >
              <div className="space-y-5">
                <div className="grid gap-5 grid-cols-1">
                  <LabeledInput
                    className="sm:col-span-2"
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
                </div>
              </div>
            </ChatGroupFormSectionCard>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 gap-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ delay: 0.2 }}
          >
            <ChatGroupFormSectionCard
              title={t("sections.controlPrivacy.title")}
              subtitle={t("sections.controlPrivacy.subtitle")}
              icon={SettingStar}
              accentColor="#FF4B4B"
            >
              <div className="space-y-8">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-slate-700">
                    {t("fields.chatMode.title")}
                  </h3>
                  <ChatGroupSendPermissionSelector
                    value={form.chatModeId}
                    onChange={(val: ChatGroupChatModeId) => handleFieldChange("chatModeId", val)}
                    everyoneLabel={t("fields.chatMode.everyone")}
                    everyoneDescription={t("fields.chatMode.everyoneDesc")}
                    teacherOnlyLabel={t("fields.chatMode.teacherOnly")}
                    teacherOnlyDescription={t("fields.chatMode.teacherOnlyDesc")}
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-slate-700">
                    {t("fields.media.title")}
                  </h3>
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
                </div>

                <div className="border-t border-slate-200 pt-6">
                  <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-[#F8FAFC] p-5">
                    <div className="flex items-center gap-3">
                      <IconComp src={Relational} width={20} height={20} aria-hidden />
                      <div className="space-y-0.5 text-right">
                        <span className="text-sm font-medium text-slate-700">
                          {t("fields.parentMode.label")}
                        </span>
                        <p className="text-xs text-slate-400">
                          {t("fields.parentMode.description")}
                        </p>
                      </div>
                    </div>
                    <StatusSwitch
                      checked={form.parentViewOnly}
                      onChange={(checked) => handleFieldChange("parentViewOnly", checked)}
                      activeLabel={t("fields.parentMode.label")}
                      inactiveLabel={t("fields.parentMode.label")}
                      activeClassName="bg-[#9B59B6]"
                      inactiveClassName="bg-slate-300"
                    />
                  </label>
                </div>

                <div className="border-t border-slate-200 pt-6">
                  <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-[#F8FAFC] p-5">
                    <div className="flex items-center gap-3">
                      <LockIcon className="h-5 w-5 text-slate-500" aria-hidden />
                      <div className="space-y-0.5 text-right">
                        <span className="text-sm font-medium text-slate-700">
                          {t("fields.lockGroup.label")}
                        </span>
                        <p className="text-xs text-slate-400">{t("fields.lockGroup.description")}</p>
                      </div>
                    </div>
                    <StatusSwitch
                      checked={form.isLocked}
                      onChange={(checked) => handleFieldChange("isLocked", checked)}
                      activeLabel={t("fields.lockGroup.label")}
                      inactiveLabel={t("fields.lockGroup.label")}
                      activeClassName="bg-red-500"
                      inactiveClassName="bg-slate-300"
                    />
                  </label>
                </div>
              </div>
            </ChatGroupFormSectionCard>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
