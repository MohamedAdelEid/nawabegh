import { SchoolHomeDashboard } from "@/modules/school/presentation/components/dashboard/SchoolHomeDashboard";
import { SchoolPageTransition } from "@/modules/school/presentation/components/shared/SchoolPageTransition";

export function SchoolHomePage() {
  return (
    <SchoolPageTransition>
      <SchoolHomeDashboard />
    </SchoolPageTransition>
  );
}
