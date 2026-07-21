"use client";

import { Award, GraduationCap, Info } from "lucide-react";
import { useTranslations } from "next-intl";
import type { TeacherCertificateGroups } from "@/shared/domain/utils/teacher.utils";

type TeacherPublicProfileAboutProps = {
  about: string;
  certificateGroups: TeacherCertificateGroups;
};

function CertificateCard({
  title,
  items,
  icon: Icon,
}: {
  title: string;
  items: Array<{ title: string; description: string; year: number | null }>;
  icon: typeof GraduationCap;
}) {
  if (items.length === 0) return null;

  return (
    <div className="rounded-2xl bg-[#f8fafc] p-5">
      <div className="mb-4 flex items-center gap-2">
        <Icon className="size-4 text-[#c7a55b]" aria-hidden />
        <h3 className="text-sm font-bold text-[#2b415e]">{title}</h3>
      </div>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={`${item.title}-${item.year ?? "na"}`} className="text-start">
            <p className="text-sm font-bold text-[#2b415e]">{item.title}</p>
            {item.description ? (
              <p className="mt-0.5 text-xs text-[#64748b]">{item.description}</p>
            ) : null}
            {item.year ? (
              <p className="mt-0.5 text-[10px] font-medium text-[#94a3b8]">{item.year}</p>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function TeacherPublicProfileAbout({
  about,
  certificateGroups,
}: TeacherPublicProfileAboutProps) {
  const t = useTranslations("student.dashboard.teacherPublicProfile.about");

  return (
    <section className="rounded-[24px] bg-white p-6 shadow-[0px_8px_0px_0px_rgba(0,0,0,0.05)] md:p-8">
      <div className="mb-6 flex items-center gap-2">
        <Info className="size-5 text-[#2b415e]" aria-hidden />
        <h2 className="text-xl font-bold text-[#2b415e]">{t("title")}</h2>
      </div>

      {about ? (
        <p className="whitespace-pre-line text-start text-sm leading-7 text-[#64748b]">{about}</p>
      ) : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <CertificateCard
          title={t("education")}
          items={certificateGroups.education}
          icon={GraduationCap}
        />
        <CertificateCard
          title={t("achievements")}
          items={certificateGroups.achievements}
          icon={Award}
        />
      </div>
    </section>
  );
}
