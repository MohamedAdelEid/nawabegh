import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import type { PaginatedQueryParams } from "@/shared/domain/types/paginated-query.types";
import { pickDefaultCountryId } from "@/shared/domain/utils/country.utils";
import { getCountriesDropdown } from "@/shared/infrastructure/api/country.api";
import { getEducationLevels } from "@/shared/infrastructure/api/education-level.api";
import { getGrades } from "@/shared/infrastructure/api/grade.api";
import { getSchoolsDropdown } from "@/shared/infrastructure/api/school.api";
import { RegisterPage } from "@/modules/auth/presentation/pages/register/RegisterPage";
import { auth } from "@/shared/infrastructure/auth/nextAuth";
import { getRedirectPathForRole } from "@/modules/auth/infrastructure/authSession";

const LIST_PARAMS: PaginatedQueryParams = {
  keyword: " ",
  pageNumber: 1,
  pageSize: 200,
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.registration");
  return { title: t("meta.title") };
}

export default async function AuthRegisterRoute() {
  const session = await auth();
  if (session?.user) {
    redirect(getRedirectPathForRole(session.user.role));
  }

  let countries: Awaited<ReturnType<typeof getCountriesDropdown>> = [];
  try {
    countries = await getCountriesDropdown(LIST_PARAMS);
  } catch {
    countries = [];
  }

  const defaultCountryId = pickDefaultCountryId(countries);

  let schools: Awaited<ReturnType<typeof getSchoolsDropdown>> = [];
  let educationLevels: Awaited<ReturnType<typeof getEducationLevels>> = [];
  let grades: Awaited<ReturnType<typeof getGrades>> = [];
  let defaultEducationLevelId: number | null = null;
  let defaultGradeId: number | null = null;

  if (defaultCountryId != null) {
    try {
      schools = await getSchoolsDropdown({
        ...LIST_PARAMS,
        countryId: defaultCountryId,
      });
    } catch {
      schools = [];
    }

    try {
      educationLevels = await getEducationLevels({
        ...LIST_PARAMS,
        countryId: defaultCountryId,
      });
      defaultEducationLevelId = educationLevels[0]?.id ?? null;

      if (defaultEducationLevelId != null) {
        grades = await getGrades({
          ...LIST_PARAMS,
          educationLevelId: defaultEducationLevelId,
        });
        defaultGradeId = grades[0]?.id ?? null;
      }
    } catch {
      educationLevels = [];
      grades = [];
    }
  }

  return (
    <RegisterPage
      initial={{
        countries,
        schools,
        educationLevels,
        grades,
        defaults: {
          countryId: defaultCountryId ?? 0,
          educationLevelId: defaultEducationLevelId ?? 0,
          gradeId: defaultGradeId ?? 0,
          schoolId: "",
        },
      }}
    />
  );
}
