"use client";

import type { TeachersDiscoveryInitialData } from "@/modules/student/application/hooks/useTeachersDiscovery";
import { TeachersDiscoveryDashboard } from "@/modules/student/presentation/components/teachers-discovery/TeachersDiscoveryDashboard";

type StudentTeachersDiscoveryPageProps = {
  initial?: TeachersDiscoveryInitialData;
};

export function StudentTeachersDiscoveryPage({ initial }: StudentTeachersDiscoveryPageProps) {
  return <TeachersDiscoveryDashboard initial={initial} />;
}
