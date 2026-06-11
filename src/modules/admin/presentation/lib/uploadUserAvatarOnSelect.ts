import { uploadUserImage } from "@/modules/admin/infrastructure/api/userManagementApi";
import { resolveFileUrl } from "@/shared/infrastructure/files/fileUrl";

export type UserAvatarUploadResult = {
  ok: boolean;
  filePath?: string;
  previewUrl?: string | null;
  errorMessage?: string;
};

export async function uploadUserAvatarOnSelect(file: File): Promise<UserAvatarUploadResult> {
  const uploadResult = await uploadUserImage(file);

  if (!uploadResult.data?.filePath) {
    return {
      ok: false,
      errorMessage: uploadResult.errorMessage ?? "Failed to upload image.",
    };
  }

  const previewUrl =
    uploadResult.data.fileUrl || resolveFileUrl(uploadResult.data.filePath) || null;

  return {
    ok: true,
    filePath: uploadResult.data.filePath,
    previewUrl,
  };
}
