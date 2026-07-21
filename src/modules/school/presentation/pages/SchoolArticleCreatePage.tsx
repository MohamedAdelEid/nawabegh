import { SchoolArticleCreateView } from "@/modules/school/presentation/components/article-editor/SchoolArticleCreateView";
import { SchoolPageTransition } from "@/modules/school/presentation/components/shared/SchoolPageTransition";

export function SchoolArticleCreatePage({ articleId }: { articleId?: string }) {
  return (
    <SchoolPageTransition>
      <SchoolArticleCreateView articleId={articleId} />
    </SchoolPageTransition>
  );
}
