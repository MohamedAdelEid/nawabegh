"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  AD_CREATE_WIZARD_STEPS,
  DEFAULT_AD_CREATE_WIZARD_VALUES,
  type AdCreateWizardStepId,
  type AdCreateWizardValues,
} from "@/modules/admin/domain/types/adCreateWizard.types";
import { createAd, publishAd } from "@/modules/admin/infrastructure/api/adsApi";
import { uploadAdminFile } from "@/modules/admin/infrastructure/api/fileUploadApi";
import {
  buildCreateAdPayload,
  validateAdCreateStep,
} from "@/modules/admin/presentation/lib/adCreateMappers";
import { notify } from "@/shared/application/lib/toast";
import { ROUTES } from "@/shared/infrastructure/config/routes";

const AD_MEDIA_UPLOAD_FOLDER = "ads/media";

export function useAdCreateWizard() {
  const t = useTranslations("admin.dashboard.adManagement.create");
  const router = useRouter();
  const [values, setValues] = useState<AdCreateWizardValues>(DEFAULT_AD_CREATE_WIZARD_VALUES);
  const [activeStep, setActiveStep] = useState<AdCreateWizardStepId>("content");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);

  const stepIndex = AD_CREATE_WIZARD_STEPS.indexOf(activeStep);
  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === AD_CREATE_WIZARD_STEPS.length - 1;
  const nextStepId = !isLastStep ? AD_CREATE_WIZARD_STEPS[stepIndex + 1] : null;
  const previousStepId = !isFirstStep ? AD_CREATE_WIZARD_STEPS[stepIndex - 1] : null;

  const patchValues = useCallback((patch: Partial<AdCreateWizardValues>) => {
    setValues((current) => ({ ...current, ...patch }));
  }, []);

  const goToStep = useCallback((step: AdCreateWizardStepId) => {
    setActiveStep(step);
  }, []);

  const goNext = useCallback(() => {
    const code = validateAdCreateStep(activeStep, values);
    if (code) {
      notify.error(t(`validation.${code}`));
      return;
    }
    if (nextStepId) setActiveStep(nextStepId);
  }, [activeStep, nextStepId, t, values]);

  const goBack = useCallback(() => {
    if (previousStepId) setActiveStep(previousStepId);
  }, [previousStepId]);

  const ensureMediaUrl = useCallback(async (): Promise<string | null> => {
    if (values.mediaUrl.trim()) return values.mediaUrl.trim();
    if (!values.mediaFile) return "";

    setIsUploadingMedia(true);
    const upload = await uploadAdminFile(values.mediaFile, AD_MEDIA_UPLOAD_FOLDER);
    setIsUploadingMedia(false);

    if (!upload.ok) {
      notify.error(upload.errorMessage ?? t("validation.mediaUploadFailed"));
      return null;
    }

    patchValues({ mediaUrl: upload.filePath });
    return upload.filePath;
  }, [patchValues, t, values.mediaFile, values.mediaUrl]);

  const submit = useCallback(
    async (status: "draft" | "scheduled" | "active") => {
      const code = validateAdCreateStep("content", values);
      if (code) {
        notify.error(t(`validation.${code}`));
        return;
      }

      setIsSubmitting(true);
      const mediaUrl = await ensureMediaUrl();
      if (mediaUrl === null) {
        setIsSubmitting(false);
        return;
      }

      const payload = buildCreateAdPayload({ ...values, mediaUrl }, status);
      const createResult = await createAd(payload);

      const isCreateSuccess =
        Boolean(createResult.data) ||
        (createResult.status === "Success" && !createResult.errorMessage);

      if (!isCreateSuccess) {
        setIsSubmitting(false);
        notify.error(createResult.errorMessage ?? t("toast.error"));
        return;
      }

      if (status === "active") {
        const adId = createResult.data?.id?.trim();
        if (!adId) {
          setIsSubmitting(false);
          notify.error(t("toast.publishError"));
          return;
        }

        const publishResult = await publishAd(adId);
        const isPublishSuccess =
          Boolean(publishResult.data) ||
          (publishResult.status === "Success" && !publishResult.errorMessage);

        if (!isPublishSuccess) {
          setIsSubmitting(false);
          notify.error(publishResult.errorMessage ?? t("toast.publishError"));
          return;
        }
      }

      setIsSubmitting(false);
      notify.success(
        status === "draft" ? t("toast.savedDraft") : t("toast.published"),
      );
      router.push(ROUTES.ADMIN.ADS.LIST);
    },
    [ensureMediaUrl, router, t, values],
  );

  return {
    values,
    patchValues,
    activeStep,
    stepIndex,
    isFirstStep,
    isLastStep,
    nextStepId,
    previousStepId,
    goToStep,
    goNext,
    goBack,
    submit,
    isSubmitting,
    isUploadingMedia,
  };
}
