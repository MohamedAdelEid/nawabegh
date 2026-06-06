import {
  getParentUserDetail,
  getStudentUserDetail,
  getTeacherUserDetail,
} from "@/modules/admin/infrastructure/api/userManagementApi";

export type UserManagementRoleId = "student" | "teacher" | "parent";

export type UserManagementDisplay = {
  userId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  profileImageUrl: string | null;
  roleId: UserManagementRoleId;
};

function mapDetail(
  data: {
    userId: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    profileImageUrl: string | null;
  },
  roleId: UserManagementRoleId,
): UserManagementDisplay {
  return {
    userId: data.userId,
    fullName: data.fullName,
    email: data.email.trim() || "—",
    phoneNumber: data.phoneNumber.trim() || "—",
    profileImageUrl: data.profileImageUrl,
    roleId,
  };
}

/** Resolves a user id via existing role-specific UserManagement detail endpoints. */
export async function fetchUserManagementDisplayById(
  userId: string,
): Promise<UserManagementDisplay | null> {
  const trimmedId = userId.trim();
  if (!trimmedId) return null;

  const [studentResult, teacherResult, parentResult] = await Promise.all([
    getStudentUserDetail(trimmedId),
    getTeacherUserDetail(trimmedId),
    getParentUserDetail(trimmedId),
  ]);

  if (studentResult.data) {
    return mapDetail(studentResult.data, "student");
  }
  if (teacherResult.data) {
    return mapDetail(teacherResult.data, "teacher");
  }
  if (parentResult.data) {
    return mapDetail(parentResult.data, "parent");
  }

  return null;
}
