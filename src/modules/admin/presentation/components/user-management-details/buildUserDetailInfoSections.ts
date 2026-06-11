import type { useTranslations } from "next-intl";
import type { UserManagementRemoteDetail } from "./types";
import { formatPhoneNumber } from "./utils";

type Translate = ReturnType<typeof useTranslations>;

export type UserDetailInfoField = {
  label: string;
  value: string;
  dir?: "ltr" | "rtl";
};

export type UserDetailInfoSection = {
  title: string;
  fields: UserDetailInfoField[];
};

function formatDate(value: string | null, emptyLabel: string) {
  if (!value?.trim()) return emptyLabel;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatBoolean(value: boolean, t: Translate) {
  return value
    ? t("userManagement.details.info.yes")
    : t("userManagement.details.info.no");
}

function field(label: string, value: string | null | undefined, emptyLabel: string, dir?: "ltr" | "rtl") {
  return {
    label,
    value: value?.trim() ? value : emptyLabel,
    dir,
  };
}

export function buildUserDetailInfoSections(
  remoteDetail: UserManagementRemoteDetail,
  t: Translate,
  emptyLabel: string,
): UserDetailInfoSection[] {
  if (remoteDetail.kind === "student") {
    const data = remoteDetail.data;
    return [
      {
        title: t("userManagement.details.info.contactTitle"),
        fields: [
          field(t("userManagement.details.info.email"), data.email, emptyLabel, "ltr"),
          field(
            t("userManagement.details.info.phone"),
            formatPhoneNumber(data.phoneNumber, data.phoneCountryCode, emptyLabel),
            emptyLabel,
            "ltr",
          ),
          field(
            t("userManagement.details.info.whatsApp"),
            formatPhoneNumber(data.whatsAppNumber, data.whatsAppCountryCode, emptyLabel),
            emptyLabel,
            "ltr",
          ),
          field(t("userManagement.details.info.alternativePhone"), data.alternativePhone, emptyLabel, "ltr"),
          field(t("userManagement.details.info.parentPhone"), data.parentPhone, emptyLabel, "ltr"),
          field(t("userManagement.details.info.address"), data.address, emptyLabel),
        ],
      },
      {
        title: t("userManagement.details.info.academicTitle"),
        fields: [
          field(t("userManagement.details.info.country"), data.countryName, emptyLabel),
          field(t("userManagement.details.info.educationLevel"), data.educationLevelName, emptyLabel),
          field(t("userManagement.details.info.grade"), data.gradeName, emptyLabel),
          field(t("userManagement.details.info.school"), data.schoolName, emptyLabel),
        ],
      },
      {
        title: t("userManagement.details.info.accountTitle"),
        fields: [
          field(t("userManagement.details.info.username"), data.username, emptyLabel, "ltr"),
          field(
            t("userManagement.details.info.points"),
            data.points !== null ? String(data.points) : emptyLabel,
            emptyLabel,
          ),
          field(
            t("userManagement.details.info.maxPoints"),
            data.maxPointsEverReached !== null ? String(data.maxPointsEverReached) : emptyLabel,
            emptyLabel,
          ),
          field(
            t("userManagement.details.info.badgeCount"),
            data.achievementBadgeCount !== null ? String(data.achievementBadgeCount) : emptyLabel,
            emptyLabel,
          ),
          field(
            t("userManagement.details.info.onboardingQuiz"),
            formatBoolean(data.onboardingQuizCompleted, t),
            emptyLabel,
          ),
          field(
            t("userManagement.details.info.createdAt"),
            formatDate(data.createdAt, emptyLabel),
            emptyLabel,
          ),
        ],
      },
    ];
  }

  if (remoteDetail.kind === "teacher") {
    const data = remoteDetail.data;
    return [
      {
        title: t("userManagement.details.info.contactTitle"),
        fields: [
          field(t("userManagement.details.info.email"), data.email, emptyLabel, "ltr"),
          field(
            t("userManagement.details.info.phone"),
            formatPhoneNumber(data.phoneNumber, data.phoneCountryCode, emptyLabel),
            emptyLabel,
            "ltr",
          ),
          field(t("userManagement.details.info.country"), data.countryName, emptyLabel),
          field(t("userManagement.details.info.address"), data.address, emptyLabel),
          field(t("userManagement.details.info.city"), data.city, emptyLabel),
        ],
      },
      {
        title: t("userManagement.details.info.professionalTitle"),
        fields: [
          field(t("userManagement.details.info.jobTitle"), data.jobTitle, emptyLabel),
          field(t("userManagement.details.info.school"), data.schoolName, emptyLabel),
          field(t("userManagement.details.info.about"), data.about, emptyLabel),
          field(
            t("userManagement.details.info.yearsOfExperience"),
            data.yearsOfExperience !== null ? String(data.yearsOfExperience) : emptyLabel,
            emptyLabel,
          ),
          field(
            t("userManagement.details.info.rating"),
            data.rating !== null ? String(data.rating) : emptyLabel,
            emptyLabel,
          ),
          field(
            t("userManagement.details.info.createdAt"),
            formatDate(data.createdAt, emptyLabel),
            emptyLabel,
          ),
        ],
      },
    ];
  }

  const data = remoteDetail.data;
  return [
    {
      title: t("userManagement.details.info.contactTitle"),
      fields: [
        field(t("userManagement.details.info.email"), data.email, emptyLabel, "ltr"),
        field(
          t("userManagement.details.info.phone"),
          formatPhoneNumber(data.phoneNumber, data.phoneCountryCode, emptyLabel),
          emptyLabel,
          "ltr",
        ),
        field(t("userManagement.details.info.country"), data.countryName, emptyLabel),
        field(t("userManagement.details.info.address"), data.address, emptyLabel),
        field(
          t("userManagement.details.info.createdAt"),
          formatDate(data.createdAt, emptyLabel),
          emptyLabel,
        ),
      ],
    },
  ];
}
