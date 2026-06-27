"use client";

import { useEffect, useState } from "react";
import { CircleAlert, Link2, UploadCloud } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  getContentFileDetailsById,
  submitContentFile,
  updateContentFile,
  type ContentFileAccessId,
} from "@/modules/admin/domain/data/contentManagementData";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import {DashboardPageHeader,
  DashboardBreadcrumb,} from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { LabeledInput } from "@/shared/presentation/components/ui/labeled-input";
import { LabeledTextarea } from "@/shared/presentation/components/ui/labeled-textarea";

interface AdminContentManagementAddPageProps {
  mode?: "create" | "edit";
  fileId?: string;
  routeConfig?: {
    LIST: string;
    VIEW: (fileId: string) => string;
  };
  stationContext?: {
    journeyId: string;
    stationId: string;
    returnHref: string;
  };
}

export function AdminContentManagementAddPage({
  mode = "create",
  fileId,
  routeConfig = ROUTES.ADMIN.CONTENT_MANAGEMENT,
  stationContext,
}: AdminContentManagementAddPageProps) {
  const t = useTranslations("admin.dashboard.contentManagement");
  const router = useRouter();
  const [courseLink, setCourseLink] = useState("https://indigoscholar.edu/course/ph-2024-001");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [access, setAccess] = useState<ContentFileAccessId>("subscribersOnly");
  const [loading, setLoading] = useState(mode === "edit");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (mode !== "edit" || !fileId) return;
    let alive = true;
    const load = async () => {
      setLoading(true);
      const detail = await getContentFileDetailsById(fileId);
      if (!alive || !detail) return;
      setTitle(detail.title);
      setDescription(t("form.defaults.editDescription"));
      setAccess(detail.policyLabel === "Public" ? "public" : "subscribersOnly");
      setLoading(false);
    };
    void load();
    return () => {
      alive = false;
    };
  }, [mode, fileId, t]);

  const submit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const payload = {
        courseLink,
        title: title.trim(),
        description: description.trim(),
        access,
      };
      if (mode === "edit" && fileId) {
        await updateContentFile(fileId, payload);
        router.push(routeConfig.VIEW(fileId));
      } else {
        const created = await submitContentFile(payload);
        router.push(stationContext?.returnHref ?? routeConfig.VIEW(created.id));
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-slate-500">
        {t("form.loading")}
      </div>
    );
  }

  return (
    <div className="space-y-6">
            <div className="space-y-2">
        <DashboardBreadcrumb items={[
          { label: t("breadcrumbs.home"), href: ROUTES.ADMIN.HOME },
          ...(stationContext
            ? [
                {
                  label: t("form.breadcrumbs.journeyEditor"),
                  href: ROUTES.ADMIN.JOURNEY_EDITOR.EDITOR(stationContext.journeyId),
                },
              ]
            : [{ label: t("breadcrumbs.content"), href: routeConfig.LIST }]),
          { label: mode === "edit" ? t("breadcrumbs.edit") : t("breadcrumbs.add") },
        ]} />
        <DashboardPageHeader
        title={
          stationContext
            ? t("form.stationContext.addTitle")
            : mode === "edit"
              ? t("form.editTitle")
              : t("form.addTitle")
        }
        description={
          stationContext ? t("form.stationContext.pageDescription") : t("form.pageDescription")
        }
      />
      </div>

      <div className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <aside className="space-y-4">
          <Card className="rounded-2xl border-white/80 bg-white shadow-[0px_8px_0px_0px_#0000000D]">
            <CardContent className="space-y-4 p-5 text-right">
              <h3 className="font-bold text-[#1E3A66]">{t("form.summary.title")}</h3>
              <div className="space-y-2 text-sm text-slate-500">
                <p>{t(stationContext ? "form.stationContext.step1" : "form.summary.step1")}</p>
                <p>{t(stationContext ? "form.stationContext.step2" : "form.summary.step2")}</p>
                <p>{t(stationContext ? "form.stationContext.step3" : "form.summary.step3")}</p>
              </div>
              {stationContext ? (
                <div className="rounded-xl bg-[#EEF4FD] p-3 text-xs text-slate-600">
                  <p className="font-semibold text-[#1E3A66]">
                    {t("form.stationContext.title")}
                  </p>
                  <p className="mt-1 font-mono">{stationContext.stationId}</p>
                  <p className="mt-2 leading-5">{t("form.stationContext.note")}</p>
                </div>
              ) : null}
              <Button
                type="button"
                className="h-12 w-full rounded-xl bg-[#2B415E] text-white hover:bg-[#243B5A]"
                onClick={() => void submit()}
                disabled={submitting}
              >
                {submitting ? t("form.actions.saving") : t("form.actions.publish")}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="h-10 w-full text-slate-500"
                onClick={() => router.push(routeConfig.LIST)}
              >
                {t("form.actions.cancel")}
              </Button>
            </CardContent>
          </Card>
        </aside>

        <div className="space-y-6">
          {/* <Card className="rounded-2xl border-white/80 bg-white shadow-[0px_8px_0px_0px_#0000000D]">
            <CardContent className="space-y-4 p-6 text-right">
              <h3 className="font-bold text-[#1E3A66]">{t("form.sections.linkCourse")}</h3>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 rounded-xl border-[#E2E8F0] text-sm font-semibold text-[#8F6C0B]"
                >
                  {t("form.actions.verifyLink")}
                </Button>
                <div className="relative flex-1">
                  <LabeledInput
                    label={t("form.fields.courseLink")}
                    value={courseLink}
                    placeholder=""
                    onChange={setCourseLink}
                    inputClassName="pe-10"
                  />
                  <Link2 className="pointer-events-none absolute left-3 top-[2.8rem] h-4 w-4 text-slate-400" />
                </div>
              </div>
            </CardContent>
          </Card> */}

          <Card className="rounded-2xl border-white/80 bg-white shadow-[0px_8px_0px_0px_#0000000D]">
            <CardContent className="space-y-4 p-6 text-right">
              <h3 className="font-bold text-[#1E3A66]">{t("form.sections.upload")}</h3>
              <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                <UploadCloud className="mx-auto h-9 w-9 text-slate-400" />
                <p className="mt-2 font-semibold text-slate-700">{t("form.upload.title")}</p>
                <p className="text-sm text-slate-400">{t("form.upload.subtitle")}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-white/80 bg-white shadow-[0px_8px_0px_0px_#0000000D]">
            <CardContent className="space-y-4 p-6 text-right">
              <h3 className="font-bold text-[#1E3A66]">{t("form.sections.identity")}</h3>
              <LabeledInput
                label={t("form.fields.fileName")}
                value={title}
                placeholder={t("form.fields.fileNamePlaceholder")}
                onChange={setTitle}
              />
              <LabeledTextarea
                label={t("form.fields.description")}
                value={description}
                placeholder={t("form.fields.descriptionPlaceholder")}
                onChange={setDescription}
                rows={4}
              />
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-white/80 bg-white shadow-[0px_8px_0px_0px_#0000000D]">
            <CardContent className="space-y-4 p-6 text-right">
              <h3 className="font-bold text-[#1E3A66]">{t("form.sections.accessPolicy")}</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setAccess("public")}
                  className={[
                    "rounded-xl border-2 p-4 text-right transition-colors",
                    access === "public"
                      ? "border-[#243B5A] bg-[#EEF4FD]"
                      : "border-slate-200 bg-white text-slate-500",
                  ].join(" ")}
                >
                  <p className="font-bold">{t("form.access.public.title")}</p>
                  <p className="text-xs">{t("form.access.public.description")}</p>
                </button>
                <button
                  type="button"
                  onClick={() => setAccess("subscribersOnly")}
                  className={[
                    "rounded-xl border-2 p-4 text-right transition-colors",
                    access === "subscribersOnly"
                      ? "border-[#243B5A] bg-[#EEF4FD]"
                      : "border-slate-200 bg-white text-slate-500",
                  ].join(" ")}
                >
                  <p className="font-bold">{t("form.access.subscribers.title")}</p>
                  <p className="text-xs">{t("form.access.subscribers.description")}</p>
                </button>
              </div>
            </CardContent>
          </Card>

          <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-right text-sm text-[#B42318]">
            <div className="flex items-start gap-2">
              <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{t("form.warning")}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
