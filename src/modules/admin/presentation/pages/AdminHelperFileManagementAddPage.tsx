"use client";

import { useEffect, useRef, useState } from "react";
import { CircleAlert, UploadCloud } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  createResourceFile,
  getResourceFileCoursesDropdown,
  getStationsList,
} from "@/modules/admin/infrastructure/api/resourceFileApi";
import { uploadAdminFile } from "@/modules/admin/infrastructure/api/fileUploadApi";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { notify } from "@/shared/application/lib/toast";
import { AccessPolicy, ResourceFileType } from "@/shared/domain/enums/cms.enums";
import { DashboardPageHeader } from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { LabeledInput } from "@/shared/presentation/components/ui/labeled-input";
import { LabeledSelect } from "@/shared/presentation/components/ui/labeled-select";

const RESOURCE_FILE_UPLOAD_FOLDER = "resource-files";

interface AdminHelperFileManagementAddPageProps {
  stationContext?: {
    journeyId: string;
    stationId: string;
    returnHref: string;
  };
}

function inferFileType(fileName: string): string {
  const ext = fileName.split(".").pop()?.trim().toUpperCase();
  return ext || "FILE";
}

export function AdminHelperFileManagementAddPage({
  stationContext,
}: AdminHelperFileManagementAddPageProps) {
  const t = useTranslations("admin.dashboard.contentManagement");
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const routeConfig = ROUTES.ADMIN.HELPER_FILE_MANAGEMENT;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [stationId, setStationId] = useState(stationContext?.stationId ?? "");
  const [courseId, setCourseId] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [fileType, setFileType] = useState("");
  const [accessPolicy, setAccessPolicy] = useState<AccessPolicy>(AccessPolicy.All);
  const [resourceFileType, setResourceFileType] = useState<ResourceFileType>(
    stationContext ? ResourceFileType.ForStation : ResourceFileType.ForCourse,
  );

  const [stationOptions, setStationOptions] = useState<Array<{ value: string; label: string }>>(
    [],
  );
  const [courseOptions, setCourseOptions] = useState<Array<{ value: string; label: string }>>([]);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      setLoading(true);
      const [stationsResult, coursesResult] = await Promise.all([
        getStationsList(),
        getResourceFileCoursesDropdown(),
      ]);
      if (!alive) return;

      if (stationsResult.errorMessage) {
        notify.error(stationsResult.errorMessage);
      } else if (stationsResult.data) {
        setStationOptions(
          stationsResult.data.map((station) => ({
            value: station.id,
            label: station.learningPathTitle
              ? `${station.name} — ${station.learningPathTitle}`
              : station.name,
          })),
        );
      }

      if (coursesResult.errorMessage) {
        notify.error(coursesResult.errorMessage);
      } else if (coursesResult.data) {
        setCourseOptions(
          coursesResult.data.map((course) => ({
            value: course.id,
            label: course.teacherName
              ? `${course.courseName} — ${course.teacherName}`
              : course.courseName,
          })),
        );
      }

      setLoading(false);
    };
    void load();
    return () => {
      alive = false;
    };
  }, []);

  const handleFilePick = async (file: File | null) => {
    if (!file) return;
    setUploading(true);
    const upload = await uploadAdminFile(file, RESOURCE_FILE_UPLOAD_FOLDER);
    setUploading(false);
    if (!upload.ok) {
      notify.error(upload.errorMessage);
      return;
    }
    setFileUrl(upload.filePath);
    if (!fileName.trim()) {
      setFileName(file.name.replace(/\.[^/.]+$/, "") || file.name);
    }
    setFileType(inferFileType(file.name));
  };

  const submit = async () => {
    if (submitting) return;
    if (!stationId.trim()) {
      notify.error(t("form.validation.stationRequired"));
      return;
    }
    if (!courseId.trim()) {
      notify.error(t("form.validation.courseRequired"));
      return;
    }
    if (!fileName.trim()) {
      notify.error(t("form.validation.fileNameRequired"));
      return;
    }
    if (!fileUrl.trim()) {
      notify.error(t("form.validation.fileRequired"));
      return;
    }

    setSubmitting(true);
    try {
      const result = await createResourceFile({
        stationId: stationId.trim(),
        courseId: courseId.trim(),
        fileName: fileName.trim(),
        fileUrl: fileUrl.trim(),
        fileType: (fileType.trim() || inferFileType(fileName)).toUpperCase(),
        accessPolicy,
        resourceFileType,
      });

      if (result.errorMessage || !result.data?.id) {
        notify.error(result.errorMessage ?? t("form.messages.createError"));
        return;
      }

      notify.success(t("form.messages.createSuccess"));
      router.push(stationContext?.returnHref ?? routeConfig.VIEW(result.data.id));
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
      <DashboardPageHeader
        title={
          stationContext ? t("form.stationContext.addTitle") : t("form.addTitle")
        }
        description={
          stationContext ? t("form.stationContext.pageDescription") : t("form.pageDescription")
        }
        breadcrumbs={[
          { label: t("breadcrumbs.home"), href: ROUTES.ADMIN.HOME },
          ...(stationContext
            ? [
                {
                  label: t("form.breadcrumbs.journeyEditor"),
                  href: ROUTES.ADMIN.JOURNEY_EDITOR.EDITOR(stationContext.journeyId),
                },
              ]
            : [{ label: t("breadcrumbs.content"), href: routeConfig.LIST }]),
          { label: t("breadcrumbs.add") },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-6">
          <Card className="rounded-2xl border-white/80 bg-white shadow-[0px_8px_0px_0px_#0000000D]">
            <CardContent className="space-y-4 p-6 text-right">
              <h3 className="font-bold text-[#1E3A66]">{t("form.sections.linkCourse")}</h3>
              {!stationContext ? (
                <LabeledSelect
                  label={t("form.fields.station")}
                  value={stationId}
                  onChange={setStationId}
                  options={[
                    { value: "", label: t("form.fields.stationPlaceholder") },
                    ...stationOptions,
                  ]}
                />
              ) : null}
              <LabeledSelect
                label={t("form.fields.course")}
                value={courseId}
                onChange={setCourseId}
                options={[
                  { value: "", label: t("form.fields.coursePlaceholder") },
                  ...courseOptions,
                ]}
              />
              <LabeledSelect
                label={t("form.fields.resourceFileType")}
                value={String(resourceFileType)}
                onChange={(value) => setResourceFileType(Number(value) as ResourceFileType)}
                options={[
                  {
                    value: String(ResourceFileType.ForStation),
                    label: t("filters.resourceFileType.station"),
                  },
                  {
                    value: String(ResourceFileType.ForCourse),
                    label: t("filters.resourceFileType.course"),
                  },
                ]}
              />
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-white/80 bg-white shadow-[0px_8px_0px_0px_#0000000D]">
            <CardContent className="space-y-4 p-6 text-right">
              <h3 className="font-bold text-[#1E3A66]">{t("form.sections.upload")}</h3>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(event) => void handleFilePick(event.target.files?.[0] ?? null)}
              />
              <button
                type="button"
                className="w-full rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center transition-colors hover:border-[#243B5A]/30"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                <UploadCloud className="mx-auto h-9 w-9 text-slate-400" />
                <p className="mt-2 font-semibold text-slate-700">
                  {uploading ? t("form.upload.uploading") : t("form.upload.title")}
                </p>
                <p className="text-sm text-slate-400">{t("form.upload.subtitle")}</p>
                {fileUrl ? (
                  <p className="mt-3 truncate text-xs text-emerald-700">{fileUrl}</p>
                ) : null}
              </button>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-white/80 bg-white shadow-[0px_8px_0px_0px_#0000000D]">
            <CardContent className="space-y-4 p-6 text-right">
              <h3 className="font-bold text-[#1E3A66]">{t("form.sections.identity")}</h3>
              <LabeledInput
                label={t("form.fields.fileName")}
                value={fileName}
                placeholder={t("form.fields.fileNamePlaceholder")}
                onChange={setFileName}
              />
              <LabeledInput
                label={t("form.fields.fileType")}
                value={fileType}
                placeholder={t("form.fields.fileTypePlaceholder")}
                onChange={setFileType}
              />
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-white/80 bg-white shadow-[0px_8px_0px_0px_#0000000D]">
            <CardContent className="space-y-4 p-6 text-right">
              <h3 className="font-bold text-[#1E3A66]">{t("form.sections.accessPolicy")}</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setAccessPolicy(AccessPolicy.All)}
                  className={[
                    "rounded-xl border-2 p-4 text-right transition-colors",
                    accessPolicy === AccessPolicy.All
                      ? "border-[#243B5A] bg-[#EEF4FD]"
                      : "border-slate-200 bg-white text-slate-500",
                  ].join(" ")}
                >
                  <p className="font-bold">{t("form.access.public.title")}</p>
                  <p className="text-xs">{t("form.access.public.description")}</p>
                </button>
                <button
                  type="button"
                  onClick={() => setAccessPolicy(AccessPolicy.Subscribers)}
                  className={[
                    "rounded-xl border-2 p-4 text-right transition-colors",
                    accessPolicy === AccessPolicy.Subscribers
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
                  <p className="font-semibold text-[#1E3A66]">{t("form.stationContext.title")}</p>
                  <p className="mt-1 font-mono">{stationContext.stationId}</p>
                </div>
              ) : null}
              <Button
                type="button"
                className="h-12 w-full rounded-xl bg-[#2B415E] text-white hover:bg-[#243B5A]"
                onClick={() => void submit()}
                disabled={submitting || uploading}
              >
                {submitting ? t("form.actions.saving") : t("form.actions.publish")}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="h-10 w-full text-slate-500"
                onClick={() =>
                  router.push(stationContext?.returnHref ?? routeConfig.LIST)
                }
              >
                {t("form.actions.cancel")}
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
