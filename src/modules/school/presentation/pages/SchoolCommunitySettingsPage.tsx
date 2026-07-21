import { SchoolCommunitySettingsView } from "@/modules/school/presentation/components/article-editor/SchoolCommunitySettingsView";
import { SchoolPageTransition } from "@/modules/school/presentation/components/shared/SchoolPageTransition";

export function SchoolCommunitySettingsPage() {
  return (
    <SchoolPageTransition>
      <SchoolCommunitySettingsView />
    </SchoolPageTransition>
  );
}
