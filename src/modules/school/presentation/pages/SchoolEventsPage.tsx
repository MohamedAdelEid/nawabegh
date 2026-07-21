import { SchoolEventsOverviewDashboard } from "@/modules/school/presentation/components/events/SchoolEventsOverviewDashboard";
import { SchoolPageTransition } from "@/modules/school/presentation/components/shared/SchoolPageTransition";

export function SchoolEventsPage() {
  return (
    <SchoolPageTransition>
      <SchoolEventsOverviewDashboard />
    </SchoolPageTransition>
  );
}
