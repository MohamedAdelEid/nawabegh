import { SchoolEventCreateView } from "@/modules/school/presentation/components/events/SchoolEventCreateView";
import { SchoolPageTransition } from "@/modules/school/presentation/components/shared/SchoolPageTransition";

export function SchoolEventCreatePage({ eventId }: { eventId?: string }) {
  return (
    <SchoolPageTransition>
      <SchoolEventCreateView eventId={eventId} />
    </SchoolPageTransition>
  );
}
