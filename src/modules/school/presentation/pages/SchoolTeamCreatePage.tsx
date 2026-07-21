import { Suspense } from "react";
import { SchoolTeamCreateView } from "@/modules/school/presentation/components/events/SchoolTeamCreateView";
import { SchoolTeamFormSkeleton } from "@/modules/school/presentation/components/events/SchoolEventsSkeletons";
import { SchoolPageTransition } from "@/modules/school/presentation/components/shared/SchoolPageTransition";

export function SchoolTeamCreatePage() {
  return (
    <SchoolPageTransition>
      <Suspense fallback={<SchoolTeamFormSkeleton />}>
        <SchoolTeamCreateView />
      </Suspense>
    </SchoolPageTransition>
  );
}
