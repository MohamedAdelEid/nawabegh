"use client";

import { Lightbulb } from "lucide-react";
import { useTranslations } from "next-intl";
import { getTeacherSkillIcon } from "./teacherSkillIcons";

type TeacherPublicProfileSkillsProps = {
  subjectsTaught: string[];
};

export function TeacherPublicProfileSkills({ subjectsTaught }: TeacherPublicProfileSkillsProps) {
  const t = useTranslations("student.dashboard.teacherPublicProfile.skills");

  if (subjectsTaught.length === 0) return null;

  return (
    <section className="rounded-[24px] bg-white p-6 shadow-[0px_8px_0px_0px_rgba(0,0,0,0.05)] md:p-8">
      <div className="mb-6 flex items-center gap-2">
        <Lightbulb className="size-5 text-[#c7a55b]" aria-hidden />
        <h2 className="text-xl font-bold text-[#2b415e]">{t("title")}</h2>
      </div>

      <ul className="space-y-4">
        {subjectsTaught.map((subject, index) => {
          const Icon = getTeacherSkillIcon(index);
          return (
            <li
              key={`${subject}-${index}`}
              className="flex items-center gap-3 rounded-2xl bg-[#f8fafc] px-4 py-3 text-start"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#2b415e] shadow-sm">
                <Icon className="size-4" aria-hidden />
              </span>
              <span className="text-sm font-bold text-[#2b415e]">{subject}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
