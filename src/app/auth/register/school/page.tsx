import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import type { PaginatedQueryParams } from "@/shared/domain/types/paginated-query.types";
import { pickDefaultCountryId } from "@/shared/domain/utils/country.utils";
import { getCountriesDropdown } from "@/shared/infrastructure/api/country.api";
import { getSchoolsDropdown } from "@/shared/infrastructure/api/school.api";
import { SchoolActivationPage } from "@/modules/auth/presentation/pages/register/SchoolActivationPage";
import { auth } from "@/shared/infrastructure/auth/nextAuth";
import { getRedirectPathForRole } from "@/modules/auth/infrastructure/authSession";

const LIST_PARAMS: PaginatedQueryParams = {
  keyword: " ",
  pageNumber: 1,
  pageSize: 200,
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.schoolActivation");
  return { title: t("meta.title") };
}

export default async function AuthRegisterSchoolRoute() {
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
  if (defaultCountryId != null) {
    try {
      schools = await getSchoolsDropdown({
        ...LIST_PARAMS,
        countryId: defaultCountryId,
      });
    } catch {
      schools = [];
    }
  }

  return (
    <SchoolActivationPage schools={schools} defaultCountryId={defaultCountryId} />
  );
}
