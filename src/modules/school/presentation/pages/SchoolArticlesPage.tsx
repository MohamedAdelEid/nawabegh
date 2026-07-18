import { SchoolArticlesDashboard } from "@/modules/school/presentation/components/dashboard/SchoolArticlesDashboard";
import { SchoolPageTransition } from "@/modules/school/presentation/components/shared/SchoolPageTransition";

export function SchoolArticlesPage() {
  return (
    <SchoolPageTransition>
      <SchoolArticlesDashboard />
    </SchoolPageTransition>
  );
}
