import { GraduationCap, Users } from "lucide-react";
import { DashboardBadge } from "@/shared/presentation/components/dashboard";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";

export type TeacherAssignmentsCardProps = {
  title: string;
  roleLabel: string;
  subjectsTitle: string;
  gradesTitle: string;
  permissionsTitle: string;
  permissionLabels: {
    canManageLearningPaths: string;
    canCreateLearningPaths: string;
    canStartLiveSessions: string;
    canUploadFiles: string;
    canAddExams: string;
    canManageConversations: string;
  };
  enabledLabel: string;
  disabledLabel: string;
  subjects: string[];
  grades: string[];
  permissions: {
    canManageLearningPaths: boolean;
    canCreateLearningPaths: boolean;
    canStartLiveSessions: boolean;
    canUploadFiles: boolean;
    canAddExams: boolean;
    canManageConversations: boolean;
  };
  emptyLabel: string;
};

export function TeacherAssignmentsCard({
  title,
  roleLabel,
  subjectsTitle,
  gradesTitle,
  permissionsTitle,
  permissionLabels,
  enabledLabel,
  disabledLabel,
  subjects,
  grades,
  permissions,
  emptyLabel,
}: TeacherAssignmentsCardProps) {
  const permissionRows = [
    {
      id: "canManageLearningPaths",
      label: permissionLabels.canManageLearningPaths,
      enabled: permissions.canManageLearningPaths,
    },
    {
      id: "canCreateLearningPaths",
      label: permissionLabels.canCreateLearningPaths,
      enabled: permissions.canCreateLearningPaths,
    },
    {
      id: "canStartLiveSessions",
      label: permissionLabels.canStartLiveSessions,
      enabled: permissions.canStartLiveSessions,
    },
    {
      id: "canUploadFiles",
      label: permissionLabels.canUploadFiles,
      enabled: permissions.canUploadFiles,
    },
    {
      id: "canAddExams",
      label: permissionLabels.canAddExams,
      enabled: permissions.canAddExams,
    },
    {
      id: "canManageConversations",
      label: permissionLabels.canManageConversations,
      enabled: permissions.canManageConversations,
    },
  ] as const;

  return (
    <Card
      className="rounded-[2rem] border-white/80 bg-white"
      style={{ boxShadow: "0px 8px 0px 0px #0000000D" }}
    >
      <CardContent className="space-y-5 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-right text-2xl font-bold text-slate-800">{title}</h2>
          <DashboardBadge tone="warning">{roleLabel}</DashboardBadge>
        </div>

        <div className="space-y-4">
          <div className="space-y-3 rounded-[1.5rem] bg-[#F8FAFC] p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[#F8EFD5] p-3 text-[#8F6C0B]">
                <GraduationCap className="h-5 w-5" aria-hidden />
              </div>
              <h3 className="text-lg font-bold text-slate-800">{subjectsTitle}</h3>
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              {subjects.length > 0 ? (
                subjects.map((subject) => (
                  <DashboardBadge key={subject} tone="gold">
                    {subject}
                  </DashboardBadge>
                ))
              ) : (
                <p className="text-sm text-slate-400">{emptyLabel}</p>
              )}
            </div>
          </div>

          <div className="space-y-3 rounded-[1.5rem] bg-[#F8FAFC] p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[#DCE6F5] p-3 text-[#243B5A]">
                <Users className="h-5 w-5" aria-hidden />
              </div>
              <h3 className="text-lg font-bold text-slate-800">{gradesTitle}</h3>
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              {grades.length > 0 ? (
                grades.map((grade) => (
                  <DashboardBadge key={grade} tone="primary">
                    {grade}
                  </DashboardBadge>
                ))
              ) : (
                <p className="text-sm text-slate-400">{emptyLabel}</p>
              )}
            </div>
          </div>

          <div className="space-y-3 rounded-[1.5rem] bg-[#F8FAFC] p-5">
            <h3 className="text-lg font-bold text-slate-800">{permissionsTitle}</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {permissionRows.map((permission) => (
                <div
                  key={permission.id}
                  className="flex items-center justify-between rounded-xl bg-white px-3 py-2"
                >
                  <p className="text-sm text-slate-700">{permission.label}</p>
                  <DashboardBadge tone={permission.enabled ? "success" : "neutral"}>
                    {permission.enabled ? enabledLabel : disabledLabel}
                  </DashboardBadge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
