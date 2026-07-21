"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import type { StudentProfileNotificationPrefs } from "@/modules/student/domain/profile/profile.types";
import { STUDENT_PROFILE_ASSETS } from "@/modules/student/presentation/components/profile/student-profile.assets";
import { StatusSwitch } from "@/shared/presentation/components/ui/StatusSwitch";

type ProfileNotificationPrefsProps = {
  prefs: StudentProfileNotificationPrefs;
  onChange: (key: keyof StudentProfileNotificationPrefs, value: boolean) => void;
};

type PrefRowProps = {
  title: string;
  description: string;
  iconSrc: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
};

function PrefRow({
  title,
  description,
  iconSrc,
  checked,
  onCheckedChange,
}: PrefRowProps) {
  const t = useTranslations("student.dashboard.profile.prefs");

  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-[#f8fafc] px-4 py-4">
      <StatusSwitch
        checked={checked}
        onChange={onCheckedChange}
        activeLabel={t("on")}
        inactiveLabel={t("off")}
        activeClassName="bg-[#58cc02]"
      />
      <div className="flex min-w-0 flex-1 items-center justify-end gap-3">
        <div className="min-w-0 text-end">
          <p className="truncate text-sm font-bold text-[#2b415e]">{title}</p>
          <p className="truncate text-xs text-[#64748b]">{description}</p>
        </div>
        <span className="relative inline-block size-5 shrink-0 overflow-hidden">
          <Image src={iconSrc} alt="" fill unoptimized className="object-contain" />
        </span>
      </div>
    </div>
  );
}

export function ProfileNotificationPrefs({
  prefs,
  onChange,
}: ProfileNotificationPrefsProps) {
  const t = useTranslations("student.dashboard.profile.prefs");

  return (
    <div className="flex h-full flex-col gap-8">
      <div className="flex items-center justify-end gap-2 border-b-2 border-[rgba(43,65,94,0.1)] pb-2.5">
        <h3 className="text-lg font-bold text-[#2b415e]">{t("title")}</h3>
        <span className="relative inline-block size-4 overflow-hidden">
          <Image
            src={STUDENT_PROFILE_ASSETS.bell}
            alt=""
            fill
            unoptimized
            className="object-contain"
          />
        </span>
      </div>

      <div className="flex flex-col gap-4">
        <PrefRow
          title={t("live.title")}
          description={t("live.description")}
          iconSrc={STUDENT_PROFILE_ASSETS.notifLive}
          checked={prefs.liveSessionAlerts}
          onCheckedChange={(value) => onChange("liveSessionAlerts", value)}
        />
        <PrefRow
          title={t("quiz.title")}
          description={t("quiz.description")}
          iconSrc={STUDENT_PROFILE_ASSETS.notifQuiz}
          checked={prefs.quizResults}
          onCheckedChange={(value) => onChange("quizResults", value)}
        />
        <PrefRow
          title={t("achievements.title")}
          description={t("achievements.description")}
          iconSrc={STUDENT_PROFILE_ASSETS.notifBadge}
          checked={prefs.achievementMessages}
          onCheckedChange={(value) => onChange("achievementMessages", value)}
        />
      </div>

      <p className="mt-auto text-end text-xs text-[#94a3b8]">{t("localOnly")}</p>
    </div>
  );
}
