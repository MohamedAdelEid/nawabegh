"use client";

import { useCallback, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { ADMIN_ADS_TABLE_QUERY_KEY } from "@/modules/admin/application/hooks/useAdsTable";
import type { AdAnalytics, AdDetail } from "@/modules/admin/domain/types/adManagement.types";
import {
  deleteAd,
  getAdAnalytics,
  getAdById,
  mergeAdDetailWithAnalytics,
  pauseAd,
} from "@/modules/admin/infrastructure/api/adsApi";
import { notify } from "@/shared/application/lib/toast";

export function useAdDetail(adId: string) {
  const t = useTranslations("admin.dashboard.adManagement.detail");
  const queryClient = useQueryClient();
  const [detail, setDetail] = useState<AdDetail | null>(null);
  const [analytics, setAnalytics] = useState<AdAnalytics | null>(null);
  const [status, setStatus] = useState<string>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPausing, setIsPausing] = useState(false);

  const load = useCallback(async () => {
    setStatus("loading");
    const [detailResult, analyticsResult] = await Promise.all([
      getAdById(adId),
      getAdAnalytics(adId),
    ]);

    if (detailResult.data) {
      const mergedDetail = analyticsResult.data
        ? mergeAdDetailWithAnalytics(detailResult.data, analyticsResult.data)
        : detailResult.data;
      setDetail(mergedDetail);
      setAnalytics(analyticsResult.data);
      setStatus(detailResult.status);
      setErrorMessage(null);
      return;
    }

    setDetail(null);
    setAnalytics(analyticsResult.data);
    setStatus(detailResult.status);
    setErrorMessage(detailResult.errorMessage ?? t("states.error"));
  }, [adId, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const remove = useCallback(async () => {
    setIsDeleting(true);
    const result = await deleteAd(adId);
    setIsDeleting(false);
    if (result.errorMessage) {
      notify.error(result.errorMessage);
      return false;
    }
    await queryClient.invalidateQueries({ queryKey: [ADMIN_ADS_TABLE_QUERY_KEY] });
    notify.success(result.message ?? t("toast.deleted"));
    return true;
  }, [adId, queryClient, t]);

  const pause = useCallback(async () => {
    setIsPausing(true);
    const result = await pauseAd(adId);
    setIsPausing(false);
    if (result.errorMessage) {
      notify.error(result.errorMessage);
      return;
    }
    notify.success(result.message ?? t("toast.paused"));
    if (result.data) {
      setDetail((current) =>
        current && analytics ? mergeAdDetailWithAnalytics(result.data!, analytics) : result.data,
      );
    } else {
      void load();
    }
  }, [adId, analytics, load, t]);

  return {
    detail,
    analytics,
    status,
    errorMessage,
    isDeleting,
    isPausing,
    reload: load,
    remove,
    pause,
  };
}
