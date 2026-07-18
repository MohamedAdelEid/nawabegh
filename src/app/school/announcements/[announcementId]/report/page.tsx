import { SchoolAnnouncementReportPage } from "@/modules/school/presentation/pages/SchoolAnnouncementReportPage";

type PageProps = {
  params: Promise<{ announcementId: string }>;
};

export default async function Page({ params }: PageProps) {
  const { announcementId } = await params;
  return <SchoolAnnouncementReportPage announcementId={announcementId} />;
}
