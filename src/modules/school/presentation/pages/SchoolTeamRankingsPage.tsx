import { SchoolTeamRankingsDashboard } from "@/modules/school/presentation/components/events/SchoolTeamRankingsDashboard";
import { SchoolPageTransition } from "@/modules/school/presentation/components/shared/SchoolPageTransition";

export function SchoolTeamRankingsPage() {
  return (
    <SchoolPageTransition>
      <SchoolTeamRankingsDashboard />
    </SchoolPageTransition>
  );
}
