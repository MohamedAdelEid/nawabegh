import { SchoolHonorFormPage } from "@/modules/school/presentation/pages/SchoolHonorFormPage";

type PageProps = {
  params: Promise<{ honorId: string }>;
};

export default async function Page({ params }: PageProps) {
  const { honorId } = await params;
  return <SchoolHonorFormPage honorId={honorId} />;
}
