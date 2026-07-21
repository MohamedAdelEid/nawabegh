import { SchoolEventLiveView } from "@/modules/school/presentation/components/events/SchoolEventLiveView";
import { SchoolPageTransition } from "@/modules/school/presentation/components/shared/SchoolPageTransition";

export function SchoolEventLivePage({ eventId }: { eventId: string }) {
  return (
    <SchoolPageTransition>
      <SchoolEventLiveView eventId={eventId} />
    </SchoolPageTransition>
  );
}
