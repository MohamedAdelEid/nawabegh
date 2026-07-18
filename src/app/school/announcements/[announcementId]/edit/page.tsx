import { SchoolAnnouncementEditPage } from "@/modules/school/presentation/pages/SchoolAnnouncementEditPage";

type PageProps = {
  params: Promise<{ announcementId: string }>;
};

export default async function Page({ params }: PageProps) {
  const { announcementId } = await params;
  return <SchoolAnnouncementEditPage announcementId={announcementId} />;
}
