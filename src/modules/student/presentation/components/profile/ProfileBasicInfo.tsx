"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import type { StudentMyProfile } from "@/modules/student/domain/types/student-home.types";
import {
  formatProfileJoinDate,
  formatProfilePhone,
} from "@/modules/student/domain/profile/profile.utils";
import { STUDENT_PROFILE_ASSETS } from "@/modules/student/presentation/components/profile/student-profile.assets";

type ProfileBasicInfoProps = {
  profile: StudentMyProfile;
  onEdit: () => void;
};

type InfoRowProps = {
  label: string;
  value: string;
};

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#f6f7f7] py-3">
      <p className="text-base font-bold text-[#2b415e]">{value || "—"}</p>
      <p className="shrink-0 text-base font-medium text-[#64748b]">{label}</p>
    </div>
  );
}

export function ProfileBasicInfo({ profile, onEdit }: ProfileBasicInfoProps) {
  const t = useTranslations("student.dashboard.profile.info");
  const locale = useLocale();

  return (
    <div className="flex h-full flex-col gap-8">
      <div className="flex items-center justify-end gap-2 border-b-2 border-[rgba(43,65,94,0.1)] pb-2.5">
        <h3 className="text-lg font-bold text-[#2b415e]">{t("title")}</h3>
        <span className="relative inline-block size-4 overflow-hidden">
          <Image
            src={STUDENT_PROFILE_ASSETS.info}
            alt=""
            fill
            unoptimized
            className="object-contain"
          />
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1">
        <InfoRow label={t("email")} value={profile.email} />
        <InfoRow label={t("studentCode")} value={profile.username} />
        <InfoRow
          label={t("phone")}
          value={formatProfilePhone(profile.phoneNumber, profile.phoneCountryCode)}
        />
        <InfoRow label={t("school")} value={profile.schoolName} />
        <InfoRow
          label={t("joinedAt")}
          value={formatProfileJoinDate(profile.createdAt, locale)}
        />
      </div>

      <button
        type="button"
        onClick={onEdit}
        className="mt-auto flex w-full items-center justify-center gap-2 rounded-2xl bg-[#2b415e] py-3.5 text-sm font-bold text-white transition hover:brightness-105"
      >
        <span className="relative inline-block size-4 overflow-hidden">
          <Image
            src={STUDENT_PROFILE_ASSETS.edit}
            alt=""
            fill
            unoptimized
            className="object-contain"
          />
        </span>
        {t("edit")}
      </button>
    </div>
  );
}
