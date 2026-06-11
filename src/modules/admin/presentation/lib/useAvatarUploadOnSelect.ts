"use client";

import { useCallback, useState, type Dispatch, type SetStateAction } from "react";
import { notify } from "@/shared/application/lib/toast";
import { uploadUserAvatarOnSelect } from "@/modules/admin/presentation/lib/uploadUserAvatarOnSelect";

type AvatarFieldValues = {
  avatarFile: File | null;
  avatarPreviewUrl: string | null;
  avatarFilePath: string | null;
};

export function useAvatarUploadOnSelect(isEditMode: boolean) {
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const handleAvatarChange = useCallback(
    async <T extends AvatarFieldValues>(
      next: { file: File | null; previewUrl: string | null },
      setValues: Dispatch<SetStateAction<T>>,
    ) => {
      if (!next.file) {
        setValues((current) => ({
          ...current,
          avatarFile: null,
          avatarPreviewUrl: next.previewUrl,
        }));
        return;
      }

      setValues((current) => ({
        ...current,
        avatarFile: next.file,
        avatarPreviewUrl: next.previewUrl,
        avatarFilePath: isEditMode ? current.avatarFilePath : null,
      }));

      if (!isEditMode) return;

      setUploadingAvatar(true);
      const result = await uploadUserAvatarOnSelect(next.file);
      setUploadingAvatar(false);
      console.log("result", result);
      if (!result.ok) {
        notify.error(result.errorMessage ?? "Failed to upload image.");
        setValues((current) => ({
          ...current,
          avatarFile: null,
          avatarPreviewUrl: current.avatarPreviewUrl,
        }));
        return;
      }

      setValues((current) => ({
        ...current,
        avatarFile: null,
        avatarFilePath: result.filePath ?? current.avatarFilePath,
        avatarPreviewUrl: result.previewUrl ?? next.previewUrl,
      }));
    },
    [isEditMode],
  );

  return { uploadingAvatar, handleAvatarChange };
}
