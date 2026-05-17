"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Users, BookOpen, Shield, Save, X, Loader2, LockIcon } from "lucide-react";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { DashboardPageHeader } from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";
import { LabeledInput } from "@/shared/presentation/components/ui/labeled-input";
import { LabeledSelect } from "@/shared/presentation/components/ui/labeled-select";
import { LabeledTextarea } from "@/shared/presentation/components/ui/labeled-textarea";
import { StatusSwitch } from "@/shared/presentation/components/ui/StatusSwitch";
import Relational from "../assets/icons/relational.svg";

import {
  ChatGroupFormSectionCard,
  ChatGroupSendPermissionSelector,
  ChatGroupMediaToggles,
  ChatGroupLinkedCourseSection,
  ChatGroupIdentityUpload,
} from "@/modules/admin/presentation/components/chat-groups";
import {
  sampleChatGroupEditData,
  chatGroupSubjectOptions,
  chatGroupGradeOptions,
} from "@/modules/admin/domain/data/chatGroupFormData";
import { chatGroupsDashboardData } from "@/modules/admin/domain/data/chatGroupsDashboardData";
import type {
  ChatGroupFormValues,
  ChatGroupChatModeId,
  ChatGroupMediaPermissions,
  ChatGroupGradeId,
  ChatGroupSubjectId,
} from "@/modules/admin/domain/types/chatGroups.types";
import PhotoFram from "../assets/icons/PhotoFram";
import { EditList } from "../assets/icons/EditList";
import { SettingStar } from "../assets/icons/SettingStar";
import { IconComp } from "../assets/icons/IconComp";
import { Network } from "../assets/icons/Network";

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

interface AdminEditChatGroupPageProps {
  groupId: string;
}

export function AdminEditChatGroupPage({ groupId }: AdminEditChatGroupPageProps) {
  const t = useTranslations("admin.dashboard.chatGroups.editPage");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [form, setForm] = useState<ChatGroupFormValues | null>(null);
  const [enableLinkedCourse, setEnableLinkedCourse] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const row = chatGroupsDashboardData.rows.find((r) => r.id === groupId);
      const data = {
        ...sampleChatGroupEditData,
        id: groupId,
        groupName: row?.groupName ?? sampleChatGroupEditData.groupName,
      };
      setForm(data);
      setEnableLinkedCourse(
        Boolean(data.linkedCourses?.length || data.linkedCourseDraftUrl),
      );
      setIsLoading(false);
    };
    fetchData();
  }, [groupId]);

  const subjectSelectOptions = useMemo(
    () => [
      { value: "", label: t("fields.subject.placeholder") },
      ...chatGroupSubjectOptions.map((opt) => ({
        value: opt.id,
        label: t(`subjects.${opt.id}`),
      })),
    ],
    [t],
  );

  const gradeSelectOptions = useMemo(
    () => [
      { value: "", label: t("fields.grade.placeholder") },
      ...chatGroupGradeOptions.map((opt) => ({
        value: opt.id,
        label: t(`grades.${opt.id}`),
      })),
    ],
    [t],
  );

  if (isLoading || !form) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#243B5A]" />
      </div>
    );
  }

  const handleFieldChange = <K extends keyof ChatGroupFormValues>(
    field: K,
    value: ChatGroupFormValues[K],
  ) => {
    setForm((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleImageChange = (file: File | null, previewUrl: string) => {
    setForm((prev) =>
      prev
        ? { ...prev, groupImageFile: file, groupImagePreviewUrl: previewUrl }
        : prev,
    );
  };

  const handleAddVerifiedCourse = (url: string) => {
    const name = displayNameFromLinkedCourseUrl(url);
    setForm((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        linkedCourses: [
          ...prev.linkedCourses,
          { id: globalThis.crypto.randomUUID(), url, name },
        ],
        linkedCourseDraftUrl: "",
      };
    });
  };

  const handleRemoveLinkedCourse = (id: string) => {
    setForm((prev) =>
      prev
        ? { ...prev, linkedCourses: prev.linkedCourses.filter((c) => c.id !== id) }
        : null,
    );
  };

  const handleCancel = () => {
    router.push(`${ROUTES.ADMIN.HOME}?tab=chatGroups`);
  };

  const handleSave = () => {
    console.log("Saving chat group:", groupId, form);
    router.push(`${ROUTES.ADMIN.HOME}?tab=chatGroups`);
  };

  return (
    <section className="space-y-8">
      <DashboardPageHeader
        title={t("titleWithName", { name: form.groupName })}
        breadcrumbs={[
          { label: t("breadcrumbs.home"), href: ROUTES.ADMIN.HOME },
          { label: t("breadcrumbs.chatGroups"), href: `${ROUTES.ADMIN.HOME}?tab=chatGroups` },
          { label: t("breadcrumbs.edit") },
        ]}
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
            className="h-14 gap-2 rounded-2xl border-2 border-[#243B5A] px-8 text-base font-semibold text-[#243B5A] transition-colors hover:bg-slate-50"
          >
            {t("buttons.cancel")}
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            className="h-14 gap-2 rounded-2xl bg-[#243B5A] px-8 text-base font-semibold text-white shadow-[0_4px_0_0_#1a2d45] hover:bg-[#243B5A]"
          >
            <Save className="h-5 w-5" />
            {t("buttons.save")}
          </Button>
        </motion.div>
        }
      />

      <div className="space-y-10">
        <div className="grid items-stretch gap-10 lg:grid-cols-[minmax(0,1fr)_25rem]">
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
                <div className="grid gap-5 sm:grid-cols-2">
                  <LabeledInput
                    className="sm:col-span-2"
                    label={t("fields.groupName.label")}
                    value={form.groupName}
                    placeholder={t("fields.groupName.placeholder")}
                    onChange={(value) => handleFieldChange("groupName", value)}
                  />
                  <LabeledSelect
                    label={t("fields.subject.label")}
                    options={subjectSelectOptions}
                    value={form.subjectId}
                    onChange={(value) =>
                      handleFieldChange("subjectId", value as ChatGroupSubjectId)
                    }
                  />
                  <LabeledSelect
                    label={t("fields.grade.label")}
                    options={gradeSelectOptions}
                    value={form.gradeId}
                    onChange={(value) =>
                      handleFieldChange("gradeId", value as ChatGroupGradeId)
                    }
                  />
                </div>
                <LabeledTextarea
                  label={t("fields.description.label")}
                  value={form.description}
                  placeholder={t("fields.description.placeholder")}
                  onChange={(value) => handleFieldChange("description", value)}
                />
              </div>
            </ChatGroupFormSectionCard>
          </motion.div>
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
              icon={PhotoFram}
              accentColor="#B89B53"
            >
              <div className="flex flex-1 items-center justify-center">
                <ChatGroupIdentityUpload
                  previewUrl={form.groupImagePreviewUrl}
                  onFileChange={handleImageChange}
                  uploadLabel={t("fields.image.upload")}
                  changeLabel={t("fields.image.change")}
                  hint={t("fields.image.hint")}
                />
              </div>
            </ChatGroupFormSectionCard>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
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
                      <p className="text-xs text-slate-400">{t("fields.parentMode.description")}</p>
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
              </div>
            </ChatGroupFormSectionCard>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ delay: 0.1 }}
          >
            <ChatGroupFormSectionCard
              title={t("sections.linkedCourse.title")}
              subtitle={t("sections.linkedCourse.subtitle")}
              icon={Network}
              accentColor=" #2B415E"
            >
              <ChatGroupLinkedCourseSection
                intro={t("fields.linkedCourse.intro")}
                draftUrl={form.linkedCourseDraftUrl}
                onDraftUrlChange={(url) => handleFieldChange("linkedCourseDraftUrl", url)}
                linkedCourses={form.linkedCourses}
                onAddVerifiedCourse={handleAddVerifiedCourse}
                onRemoveCourse={handleRemoveLinkedCourse}
                enableToggle={enableLinkedCourse}
                onEnableToggleChange={setEnableLinkedCourse}
                toggleLabel={t("fields.linkedCourse.toggle")}
                toggleDescription={t("fields.linkedCourse.toggleDesc")}
                urlLabel={t("fields.linkedCourse.urlLabel")}
                urlPlaceholder={t("fields.linkedCourse.urlPlaceholder")}
                verifyLabel={t("fields.linkedCourse.verify")}
                verifyingLabel={t("fields.linkedCourse.verifying")}
                verifiedMessage={t("fields.linkedCourse.verifiedMessage")}
                linkedCourseLabel={t("fields.linkedCourse.linkedCourseLabel")}
                linkedListTitle={t("fields.linkedCourse.linkedListTitle")}
                removeCourseLabel={t("fields.linkedCourse.removeCourse")}
                duplicateInListMessage={t("fields.linkedCourse.duplicateInList")}
              />
            </ChatGroupFormSectionCard>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function displayNameFromLinkedCourseUrl(urlString: string): string {
  const withProtocol = urlString.includes("://") ? urlString : `https://${urlString}`;
  try {
    const u = new URL(withProtocol);
    const parts = u.pathname.split("/").filter(Boolean);
    const last = parts[parts.length - 1];
    if (last) {
      return decodeURIComponent(last.replace(/\+/g, " ")).replace(/-/g, " ");
    }
    return u.hostname || urlString;
  } catch {
    return urlString.length > 64 ? `${urlString.slice(0, 64)}…` : urlString;
  }
}
