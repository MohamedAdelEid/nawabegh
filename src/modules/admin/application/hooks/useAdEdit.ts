"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { DEFAULT_AD_CREATE_WIZARD_VALUES } from "@/modules/admin/domain/types/adCreateWizard.types";
import { getAdById, updateAd } from "@/modules/admin/infrastructure/api/adsApi";
import { uploadAdminFile } from "@/modules/admin/infrastructure/api/fileUploadApi";
import {
  buildUpdateAdPayload,
  mapAdDetailToEditValues,
  type AdEditFormValues,
} from "@/modules/admin/presentation/lib/adEditMappers";
import { validateAdCreateStep } from "@/modules/admin/presentation/lib/adCreateMappers";
import { notify } from "@/shared/application/lib/toast";
import { ROUTES } from "@/shared/infrastructure/config/routes";

const AD_MEDIA_UPLOAD_FOLDER = "ads/media";

export function useAdEdit(adId: string) {
  const t = useTranslations("admin.dashboard.adManagement.edit");
  const router = useRouter();
  const [values, setValues] = useState<AdEditFormValues>(DEFAULT_AD_CREATE_WIZARD_VALUES);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lifecycleStatus, setLifecycleStatus] = useState<"active" | "scheduled" | "draft">("active");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoadState("loading");
      const result = await getAdById(adId);
      if (cancelled) return;
      if (!result.data) {
        setLoadState("error");
        return;
      }
      setValues(mapAdDetailToEditValues(result.data));
      setLifecycleStatus(
        result.data.status === "draft"
          ? "draft"
          : result.data.status === "scheduled"
            ? "scheduled"
            : "active",
      );
      setLoadState("ready");
    })();
    return () => {
      cancelled = true;
    };
  }, [adId]);

  const patchValues = useCallback((patch: Partial<AdEditFormValues>) => {
    setValues((current) => ({ ...current, ...patch }));
  }, []);

  const submit = useCallback(async () => {
    const code = validateAdCreateStep("content", values);
    if (code) {
      notify.error(t(`validation.${code}`));
      return;
    }

    setIsSubmitting(true);
    let mediaUrl = values.mediaUrl.trim();
    if (values.mediaFile) {
      const upload = await uploadAdminFile(values.mediaFile, AD_MEDIA_UPLOAD_FOLDER);
      if (!upload.ok) {
        setIsSubmitting(false);
        notify.error(upload.errorMessage ?? t("validation.mediaUploadFailed"));
        return;
      }
      mediaUrl = upload.filePath;
    }

    const payload = buildUpdateAdPayload(adId, { ...values, mediaUrl }, lifecycleStatus);
    const result = await updateAd(payload);
    setIsSubmitting(false);

    const isSuccess =
      Boolean(result.data) || (result.status === "Success" && !result.errorMessage);

    if (!isSuccess) {
      notify.error(result.errorMessage ?? t("toast.error"));
      return;
    }

    notify.success(t("toast.saved"));
    router.push(ROUTES.ADMIN.ADS.VIEW(adId));
  }, [adId, lifecycleStatus, router, t, values]);

  return {
    values,
    patchValues,
    loadState,
    isSubmitting,
    submit,
  };
}
