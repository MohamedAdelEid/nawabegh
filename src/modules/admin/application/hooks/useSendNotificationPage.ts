"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  DEFAULT_SEND_NOTIFICATION_VALUES,
  type SendNotificationFormValues,
} from "@/modules/admin/domain/types/sendNotification.types";
import { getSchoolFilterOptions } from "@/modules/admin/infrastructure/api/schoolApi";
import { sendPushNotification } from "@/modules/admin/infrastructure/api/pushNotificationsApi";
import { getCountriesDropdown } from "@/modules/admin/infrastructure/api/userManagementApi";
import {
  buildPushNotificationPayload,
  resolvePushNotificationRoute,
  validateSendNotificationForm,
} from "@/modules/admin/presentation/lib/sendNotificationMappers";
import { notify } from "@/shared/application/lib/toast";

const SCHOOL_SEARCH_DEBOUNCE_MS = 350;

function estimateExpectedViews(audience: SendNotificationFormValues["audience"]): number {
  switch (audience) {
    case "students":
      return 820;
    case "teachers":
      return 210;
    case "parents":
      return 540;
    case "students_teachers_parents":
      return 1100;
    default:
      return 1240;
  }
}

export function useSendNotificationPage() {
  const t = useTranslations("admin.dashboard.sendNotification");
  const [values, setValues] = useState<SendNotificationFormValues>(DEFAULT_SEND_NOTIFICATION_VALUES);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingSchools, setIsLoadingSchools] = useState(false);
  const [countryOptions, setCountryOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [schoolOptions, setSchoolOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [countryNameById, setCountryNameById] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      setIsBootstrapping(true);
      const countriesResult = await getCountriesDropdown();
      if (cancelled) return;

      if (countriesResult.errorMessage) {
        notify.error(countriesResult.errorMessage);
      } else if (countriesResult.data?.length) {
        const names: Record<string, string> = {};
        const options = countriesResult.data.map((row) => {
          const value = String(row.id);
          names[value] = row.name;
          return { value, label: row.name };
        });
        setCountryNameById(names);
        setCountryOptions([
          { value: "", label: t("targeting.country.all") },
          ...options,
        ]);
      }

      setIsBootstrapping(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [t]);

  const selectedCountryName = values.countryId
    ? countryNameById[values.countryId] ?? ""
    : "";

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(() => {
      void (async () => {
        setIsLoadingSchools(true);
        const result = await getSchoolFilterOptions({
          keyword: values.schoolSearch.trim() || undefined,
          country: selectedCountryName || undefined,
          pageSize: 50,
        });
        if (cancelled) return;

        if (result.errorMessage) {
          notify.error(result.errorMessage);
          setSchoolOptions([]);
        } else {
          setSchoolOptions(
            (result.data ?? []).map((school) => ({
              value: school.id,
              label: school.name,
            })),
          );
        }
        setIsLoadingSchools(false);
      })();
    }, SCHOOL_SEARCH_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [selectedCountryName, values.schoolSearch]);

  const patchValues = useCallback((patch: Partial<SendNotificationFormValues>) => {
    setValues((current) => ({ ...current, ...patch }));
  }, []);

  const expectedViews = useMemo(() => estimateExpectedViews(values.audience), [values.audience]);

  const sendRoute = useMemo(() => resolvePushNotificationRoute(values), [values]);

  const submit = useCallback(async () => {
    const validationCode = validateSendNotificationForm(values);
    if (validationCode) {
      notify.error(t(`validation.${validationCode}`));
      return;
    }

    const route = resolvePushNotificationRoute(values);
    const payload = buildPushNotificationPayload(values);

    setIsSubmitting(true);
    const result = await sendPushNotification(route, payload);
    setIsSubmitting(false);

    const isSuccess =
      Boolean(result.data) || (result.status === "Success" && !result.errorMessage);

    if (!isSuccess) {
      notify.error(result.errorMessage ?? t("toast.sendError"));
      return;
    }

    notify.success(
      values.scheduleMode === "now" ? t("toast.sentNow") : t("toast.scheduled"),
    );
  }, [t, values]);

  return {
    values,
    patchValues,
    isBootstrapping,
    isSubmitting,
    isLoadingSchools,
    countryOptions,
    schoolOptions,
    expectedViews,
    sendRoute,
    submit,
  };
}
