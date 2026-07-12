import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ROUTES } from "@/shared/infrastructure/config/routes";

type TeacherProfilePlaceholderPageProps = {
  params: Promise<{ teacherId: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("student.dashboard.teachersDiscovery");
  return { title: t("page.breadcrumbCurrent") };
}

export default async function StudentTeacherProfilePlaceholderPage({
  params,
}: TeacherProfilePlaceholderPageProps) {
  const { teacherId } = await params;
  const t = await getTranslations("student.dashboard.teachersDiscovery");

  return (
    <div className="mx-auto max-w-lg space-y-4 rounded-[20px] bg-white p-8 text-center shadow-sm">
      <h1 className="text-2xl font-bold text-[#2b415e]">{t("page.breadcrumbCurrent")}</h1>
      <p className="text-sm leading-6 text-[#64748b]">
        {t("empty.description")}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href={ROUTES.USER.STUDENT.TEACHERS}
          className="rounded-xl bg-[#2c4260] px-5 py-2.5 text-sm font-bold text-white"
        >
          {t("page.breadcrumbCurrent")}
        </Link>
        <Link
          href={`${ROUTES.USER.STUDENT.COURSES}?teacher=${encodeURIComponent(teacherId)}`}
          className="rounded-xl border border-[#e2e8f0] px-5 py-2.5 text-sm font-bold text-[#2b415e]"
        >
          {t("card.viewCourses")}
        </Link>
      </div>
    </div>
  );
}
