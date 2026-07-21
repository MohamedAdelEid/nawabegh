import { SchoolArticleEditorDashboard } from "@/modules/school/presentation/components/article-editor/SchoolArticleEditorDashboard";
import { SchoolPageTransition } from "@/modules/school/presentation/components/shared/SchoolPageTransition";

export function SchoolArticlesPage() {
  return (
    <SchoolPageTransition>
      <SchoolArticleEditorDashboard />
    </SchoolPageTransition>
  );
}
