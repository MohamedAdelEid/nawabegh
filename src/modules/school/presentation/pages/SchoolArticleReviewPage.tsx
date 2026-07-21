import { SchoolArticleReviewView } from "@/modules/school/presentation/components/article-editor/SchoolArticleReviewView";
import { SchoolPageTransition } from "@/modules/school/presentation/components/shared/SchoolPageTransition";

export function SchoolArticleReviewPage({ articleId }: { articleId: string }) {
  return (
    <SchoolPageTransition>
      <SchoolArticleReviewView articleId={articleId} />
    </SchoolPageTransition>
  );
}
