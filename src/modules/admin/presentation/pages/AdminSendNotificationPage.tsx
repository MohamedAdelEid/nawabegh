"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useSendNotificationPage } from "@/modules/admin/application/hooks/useSendNotificationPage";
import {
  SendNotificationAnimatedSection,
  SendNotificationForm,
  SendNotificationMobilePreview,
  SendNotificationPageSkeleton,
} from "@/modules/admin/presentation/components/send-notification";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { DashboardPageHeader } from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";

export function AdminSendNotificationPage() {
  const t = useTranslations("admin.dashboard");
  const router = useRouter();
  const {
    values,
    patchValues,
    isBootstrapping,
    isSubmitting,
    isLoadingSchools,
    countryOptions,
    schoolOptions,
    expectedViews,
    submit,
  } = useSendNotificationPage();

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title={t("sendNotification.title")}
        description={t("sendNotification.description")}
        breadcrumbs={[
          { label: t("tabs.home.title"), href: ROUTES.ADMIN.HOME },
          { label: t("sendNotification.title") },
        ]}
        action={
          <Button
            variant="outline"
            className="h-12 rounded-xl border-slate-200 shadow-[0px_4px_0px_0px_#0000000D]"
            onClick={() => router.push(ROUTES.ADMIN.HOME)}
          >
            {t("sendNotification.actions.cancel")}
          </Button>
        }
      />

      {isBootstrapping ? (
        <SendNotificationPageSkeleton />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_min(100%,25rem)]">
          <SendNotificationAnimatedSection delay={0}>
            <SendNotificationForm
              values={values}
              onChange={patchValues}
              countryOptions={countryOptions}
              schoolOptions={schoolOptions}
              isLoadingSchools={isLoadingSchools}
              isSubmitting={isSubmitting}
              onSubmit={() => void submit()}
            />
          </SendNotificationAnimatedSection>

          <SendNotificationAnimatedSection delay={0.1} className="lg:sticky lg:top-6 lg:self-start">
            <SendNotificationMobilePreview values={values} expectedViews={expectedViews} />
          </SendNotificationAnimatedSection>
        </div>
      )}
    </div>
  );
}
