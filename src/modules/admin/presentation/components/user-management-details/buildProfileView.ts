import type { useTranslations } from "next-intl";
import type {
  UserManagementProfileView,
  UserManagementRemoteDetail,
} from "./types";
import { formatPhoneNumber } from "./utils";

type Translate = ReturnType<typeof useTranslations>;

export function buildProfileView(
  remoteDetail: UserManagementRemoteDetail,
  t: Translate,
  emptyLabel: string,
): UserManagementProfileView {
  if (remoteDetail.kind === "student") {
    const data = remoteDetail.data;
    return {
      fullName: data.fullName,
      subtitle: [
        t("userManagement.roles.student"),
        data.gradeName,
        data.educationLevelName,
      ]
        .filter(Boolean)
        .join(" - "),
      schoolLabel: data.schoolName || emptyLabel,
      statusLabel: t(`userManagement.status.${data.isActive ? "active" : "inactive"}`),
      subscriptionLabel: t("userManagement.subscriptions.active"),
      codeValue: data.username || emptyLabel,
      profileImageUrl: data.profileImageUrl,
      profileTag: t("userManagement.details.profile.pointsTag", {
        points: data.points ?? 0,
      }),
      isActive: data.isActive,
      phoneNumber: formatPhoneNumber(data.phoneNumber, data.phoneCountryCode, emptyLabel),
      linkedParentName: data.linkedParent?.fullName || emptyLabel,
      linkedParentPhone: data.linkedParent?.phoneNumber
        ? formatPhoneNumber(data.linkedParent.phoneNumber, null, emptyLabel)
        : emptyLabel,
      schoolLabelTitle: t("userManagement.details.profile.school"),
      contactKey: "userManagement.details.floatingActions.contactStudent",
    };
  }

  if (remoteDetail.kind === "teacher") {
    const data = remoteDetail.data;
    return {
      fullName: data.fullName,
      subtitle: [t("userManagement.roles.teacher"), data.jobTitle, data.educationLevelName]
        .filter(Boolean)
        .join(" - "),
      schoolLabel: data.schoolName || emptyLabel,
      statusLabel: t(`userManagement.status.${data.isActive ? "active" : "inactive"}`),
      subscriptionLabel: t("userManagement.subscriptions.active"),
      codeValue: data.email || data.userId,
      profileImageUrl: data.profileImageUrl,
      profileTag: t("userManagement.roles.teacher"),
      isActive: data.isActive,
      phoneNumber: formatPhoneNumber(data.phoneNumber, data.phoneCountryCode, emptyLabel),
      linkedParentName: emptyLabel,
      linkedParentPhone: emptyLabel,
      schoolLabelTitle: t("userManagement.details.profile.school"),
      contactKey: "userManagement.details.floatingActions.contactTeacher",
    };
  }

  const data = remoteDetail.data;
  return {
    fullName: data.fullName,
    subtitle: [t("userManagement.roles.parent"), data.countryName].filter(Boolean).join(" - "),
    schoolLabel: data.countryName || emptyLabel,
    statusLabel: t(`userManagement.status.${data.isActive ? "active" : "inactive"}`),
    subscriptionLabel: t("userManagement.subscriptions.active"),
    codeValue: data.email || data.userId,
    profileImageUrl: data.profileImageUrl,
    profileTag: t("userManagement.roles.parent"),
    isActive: data.isActive,
    phoneNumber: formatPhoneNumber(data.phoneNumber, data.phoneCountryCode, emptyLabel),
    linkedParentName: emptyLabel,
    linkedParentPhone: emptyLabel,
    schoolLabelTitle: t("userManagement.details.profile.country"),
    contactKey: "userManagement.details.floatingActions.contactParent",
  };
}
