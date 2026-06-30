import { SchoolAnnouncementDetailPage } from "@/modules/school/presentation/pages/SchoolAnnouncementDetailPage";

type PageProps = {
  params: Promise<{ announcementId: string }>;
};

export default async function Page({ params }: PageProps) {
  const { announcementId } = await params;
  return <SchoolAnnouncementDetailPage announcementId={announcementId} />;
}
