import type {
  UserManagementParentChildRow,
  UserManagementProfileView,
  UserManagementRemoteDetail,
} from "./types";
import { LinkedParentCard } from "./LinkedParentCard";
import { ParentChildrenCard } from "./ParentChildrenCard";
import { TeacherAssignmentsCard } from "./TeacherAssignmentsCard";
import { useTranslations } from "next-intl";

export type UserManagementDetailsRolePanelProps = {
  remoteDetail: UserManagementRemoteDetail;
  profileView: UserManagementProfileView;
  teacherGrades: string[];
  parentChildren: UserManagementParentChildRow[];
  emptyLabel: string;
  onParentChanged?: () => void;
  labels: {
    teacherSectionTitle: string;
    teacherRoleLabel: string;
    subjectsTitle: string;
    gradesTitle: string;
    parentSectionTitle: string;
    parentRoleLabel: string;
    linkedParentTitle: string;
    linkedParentType: string;
    changeParent: string;
    unlinkParent: string;
    linkedParentNote: string;
  };
};

export function UserManagementDetailsRolePanel({
  remoteDetail,
  profileView,
  teacherGrades,
  parentChildren,
  emptyLabel,
  onParentChanged,
  labels,
}: UserManagementDetailsRolePanelProps) {
  const t = useTranslations("admin.dashboard");
  if (remoteDetail.kind === "teacher") {
    return (
      <TeacherAssignmentsCard
        title={labels.teacherSectionTitle}
        roleLabel={labels.teacherRoleLabel}
        subjectsTitle={labels.subjectsTitle}
        gradesTitle={labels.gradesTitle}
        permissionsTitle={t("userManagement.details.permissions.title")}
        permissionLabels={{
          canManageLearningPaths: t(
            "userManagement.addUser.teacher.permissions.manageLearningPaths.title",
          ),
          canCreateLearningPaths: t(
            "userManagement.addUser.teacher.permissions.createLearningPaths.title",
          ),
          canStartLiveSessions: t("userManagement.addUser.teacher.permissions.liveBroadcast.title"),
          canUploadFiles: t("userManagement.addUser.teacher.permissions.uploadFiles.title"),
          canAddExams: t("userManagement.addUser.teacher.permissions.addTests.title"),
          canManageConversations: t("userManagement.addUser.teacher.permissions.manageChats.title"),
        }}
        enabledLabel={t("userManagement.details.permissions.enabled")}
        disabledLabel={t("userManagement.details.permissions.disabled")}
        subjects={remoteDetail.data.courses}
        grades={teacherGrades}
        permissions={remoteDetail.data.permissions}
        emptyLabel={emptyLabel}
      />
    );
  }

  if (remoteDetail.kind === "parent") {
    return (
      <ParentChildrenCard
        title={labels.parentSectionTitle}
        roleLabel={labels.parentRoleLabel}
        children={parentChildren}
        emptyLabel={t("userManagement.details.parent.noLinkedChildren")}
      />
    );
  }

  return (
    <LinkedParentCard
      studentUserId={remoteDetail.data.userId}
      initialParentUserId={remoteDetail.data.linkedParent?.parentUserId}
      title={labels.linkedParentTitle}
      parentType={labels.linkedParentType}
      fallbackName={profileView.linkedParentName}
      fallbackPhone={profileView.linkedParentPhone}
      noParentMessage={t("userManagement.details.parent.studentHasNoParent")}
      loadingMessage={t("userManagement.details.parent.loading")}
      changeLabel={labels.changeParent}
      unlinkLabel={labels.unlinkParent}
      note={labels.linkedParentNote}
      onParentChanged={onParentChanged}
    />
  );
}
