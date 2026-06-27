"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlignLeft,
  FileText,
  ImageIcon,
  Plus,
  Settings2,
  UploadCloud,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import type { BundlePublishingMode } from "@/modules/admin/domain/types/bundleManagement.types";
import {
  createBundle,
  getBundleById,
  getBundleExploreCourses,
  resolveCoursePrice,
  updateBundle,
  updateBundleStatus,
  type BundleExploreCourse,
  type BundleStatus,
} from "@/modules/admin/infrastructure/api/bundlesApi";
import { uploadAdminFile } from "@/modules/admin/infrastructure/api/fileUploadApi";
import { BundlePreviewCard } from "./BundlePreviewCard";
import { notify } from "@/shared/application/lib/toast";
import { isValidAccessDurationDays } from "@/shared/domain/types/accessDuration.types";
import type { AccessDurationDays } from "@/shared/domain/types/accessDuration.types";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { DashboardPageHeader } from "@/shared/presentation/components/dashboard";
import { Button } from "@/shared/presentation/components/ui/button";
import { Card, CardContent } from "@/shared/presentation/components/ui/card";
import { LabeledInput } from "@/shared/presentation/components/ui/labeled-input";
import { AccessDurationField } from "@/shared/presentation/components/ui/access-duration-field";
import {
  SearchableSelect,
  type SearchableSelectOption,
} from "@/shared/presentation/components/ui/searchable-select";
import { DashboardFilterSelect } from "@/shared/presentation/components/dashboard";

const BUNDLE_COVER_UPLOAD_FOLDER = "bundles/covers";
const MAX_COVER_SIZE_BYTES = 5 * 1024 * 1024;

type SelectedCourse = {
  id: string;
  title: string;
  price: number;
};

function publishingModeToPayload(mode: BundlePublishingMode): {
  status: BundleStatus;
  isPublished: boolean;
} {
  switch (mode) {
    case "activePublished":
      return { status: 0, isPublished: true };
    case "activeDraft":
      return { status: 0, isPublished: false };
    case "inactive":
      return { status: 1, isPublished: false };
  }
}

function detailToPublishingMode(detail: {
  status: BundleStatus;
  isPublished: boolean;
}): BundlePublishingMode {
  if (detail.status === 1) return "inactive";
  return detail.isPublished ? "activePublished" : "activeDraft";
}

function courseIdsEqual(left: string[], right: string[]): boolean {
  if (left.length !== right.length) return false;
  const sortedLeft = [...left].sort();
  const sortedRight = [...right].sort();
  return sortedLeft.every((value, index) => value === sortedRight[index]);
}

function isCoursesLockedError(status: string, message?: string): boolean {
  if (status === "Conflict") return true;
  const normalized = (message ?? "").toLowerCase();
  return normalized.includes("دورات") || normalized.includes("course");
}

type BundleFormPageProps = {
  bundleId?: string;
};

export function BundleFormPage({ bundleId }: BundleFormPageProps) {
  const t = useTranslations("admin.dashboard.bundleManagement.form");
  const tPage = useTranslations("admin.dashboard.bundleManagement");
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEditMode = Boolean(bundleId);

  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [coursesLocked, setCoursesLocked] = useState(false);
  const [initialCourseIds, setInitialCourseIds] = useState<string[]>([]);
  const [initialStatus, setInitialStatus] = useState<BundleStatus>(0);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [bundlePrice, setBundlePrice] = useState("0.00");
  const [accessDurationDays, setAccessDurationDays] = useState<AccessDurationDays>(null);
  const [publishingMode, setPublishingMode] = useState<BundlePublishingMode>("activePublished");
  const [selectedCourses, setSelectedCourses] = useState<SelectedCourse[]>([]);
  const [coursePickerValue, setCoursePickerValue] = useState<string | null>(null);
  const [courseSearchQuery, setCourseSearchQuery] = useState("");
  const [exploreCourses, setExploreCourses] = useState<BundleExploreCourse[]>([]);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      setLoading(true);

      const coursesResult = await getBundleExploreCourses({ pageNumber: 1, pageSize: 100 });
      if (!alive) return;
      if (coursesResult.errorMessage) {
        notify.error(coursesResult.errorMessage);
      } else if (coursesResult.data) {
        setExploreCourses(coursesResult.data);
      }

      if (bundleId) {
        const detailResult = await getBundleById(bundleId);
        if (!alive) return;
        if (detailResult.errorMessage || !detailResult.data) {
          notify.error(detailResult.errorMessage ?? t("messages.loadError"));
          router.push(ROUTES.ADMIN.BUNDLES.LIST);
          return;
        }

        const detail = detailResult.data;
        const loadedCourseIds = detail.courses.map((course) => course.courseId);
        setName(detail.name);
        setDescription(detail.description ?? "");
        setCoverImageUrl(detail.coverImageUrl ?? "");
        setBundlePrice(detail.bundlePrice.toFixed(2));
        setAccessDurationDays(detail.accessDurationDays);
        setPublishingMode(detailToPublishingMode(detail));
        setInitialCourseIds(loadedCourseIds);
        setInitialStatus(detail.status);
        setSelectedCourses(
          detail.courses.map((course) => ({
            id: course.courseId,
            title: course.title,
            price: course.coursePriceAtCreation,
          })),
        );
      }

      setLoading(false);
    };

    void load();
    return () => {
      alive = false;
    };
  }, [bundleId, router, t]);

  const courseSelectOptions = useMemo<SearchableSelectOption<string>[]>(() => {
    const selectedIds = new Set(selectedCourses.map((course) => course.id));
    return exploreCourses
      .filter((course) => !selectedIds.has(course.id))
      .map((course) => ({
        value: course.id,
        label: course.title,
      }));
  }, [exploreCourses, selectedCourses]);

  const filteredCourseSelectOptions = useMemo(() => {
    const query = courseSearchQuery.trim().toLowerCase();
    if (!query) return courseSelectOptions;
    return courseSelectOptions.filter((option) => option.label.toLowerCase().includes(query));
  }, [courseSelectOptions, courseSearchQuery]);

  const coursesTotalPrice = useMemo(
    () => selectedCourses.reduce((total, course) => total + course.price, 0),
    [selectedCourses],
  );

  const parsedBundlePrice = useMemo(() => {
    const parsed = Number(bundlePrice);
    return Number.isFinite(parsed) ? parsed : 0;
  }, [bundlePrice]);

  const addCourse = (courseId: string) => {
    if (coursesLocked) return;
    const course = exploreCourses.find((item) => item.id === courseId);
    if (!course) return;
    setSelectedCourses((current) => [
      ...current,
      {
        id: course.id,
        title: course.title,
        price: resolveCoursePrice(course),
      },
    ]);
    setCoursePickerValue(null);
    setCourseSearchQuery("");
  };

  const removeCourse = (courseId: string) => {
    if (coursesLocked) return;
    setSelectedCourses((current) => current.filter((course) => course.id !== courseId));
  };

  const handleCoverPick = async (file: File | null) => {
    if (!file) return;
    if (file.size > MAX_COVER_SIZE_BYTES) {
      notify.error(t("validation.coverInvalid"));
      return;
    }
    setUploadingCover(true);
    const upload = await uploadAdminFile(file, BUNDLE_COVER_UPLOAD_FOLDER);
    setUploadingCover(false);
    if (!upload.ok) {
      notify.error(upload.errorMessage ?? t("validation.coverInvalid"));
      return;
    }
    setCoverImageUrl(upload.filePath);
  };

  const validateForm = (): boolean => {
    if (!name.trim()) {
      notify.error(t("validation.nameRequired"));
      return false;
    }
    if (selectedCourses.length < 2) {
      notify.error(t("validation.coursesMin"));
      return false;
    }
    if (parsedBundlePrice <= 0 || parsedBundlePrice >= coursesTotalPrice) {
      notify.error(t("validation.priceInvalid"));
      return false;
    }
    if (!isValidAccessDurationDays(accessDurationDays)) {
      notify.error(t("validation.accessDurationInvalid"));
      return false;
    }
    return true;
  };

  const submit = async () => {
    if (submitting || !validateForm()) return;

    setSubmitting(true);
    try {
      const publishing = publishingModeToPayload(publishingMode);
      const selectedIds = selectedCourses.map((course) => course.id);
      const payloadBase = {
        name: name.trim(),
        description: description.trim() || null,
        coverImageUrl: coverImageUrl.trim() || null,
        bundlePrice: parsedBundlePrice,
        accessDurationDays,
        isPublished: publishing.isPublished,
      };

      if (isEditMode && bundleId) {
        const coursesChanged = !courseIdsEqual(selectedIds, initialCourseIds);
        const updatePayload = {
          ...payloadBase,
          ...(coursesChanged && !coursesLocked ? { courseIds: selectedIds } : {}),
        };

        let result = await updateBundle(bundleId, updatePayload);

        if (
          result.errorMessage &&
          isCoursesLockedError(String(result.status), result.errorMessage) &&
          coursesChanged
        ) {
          setCoursesLocked(true);
          setSelectedCourses((current) => {
            const byId = new Map(exploreCourses.map((course) => [course.id, course]));
            return initialCourseIds.map((id) => {
              const existing = current.find((course) => course.id === id);
              if (existing) return existing;
              const explore = byId.get(id);
              return {
                id,
                title: explore?.title ?? id,
                price: explore ? resolveCoursePrice(explore) : 0,
              };
            });
          });
          notify.error(result.errorMessage ?? t("messages.coursesLockedError"));

          result = await updateBundle(bundleId, payloadBase);
        }

        if (result.errorMessage || !result.data) {
          notify.error(result.errorMessage ?? t("messages.updateError"));
          return;
        }

        if (publishing.status !== initialStatus) {
          const statusResult = await updateBundleStatus(bundleId, publishing.status);
          if (statusResult.errorMessage) {
            notify.error(statusResult.errorMessage);
            return;
          }
        }

        notify.success(t("messages.updateSuccess"));
        router.push(ROUTES.ADMIN.BUNDLES.LIST);
        return;
      }

      const result = await createBundle({
        ...payloadBase,
        status: publishing.status,
        courseIds: selectedIds,
      });

      if (result.errorMessage || !result.data) {
        notify.error(result.errorMessage ?? t("messages.createError"));
        return;
      }

      notify.success(t("messages.createSuccess"));
      router.push(ROUTES.ADMIN.BUNDLES.LIST);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-slate-500">
        {t("loading")}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title={isEditMode ? t("editTitle") : t("createTitle")}
        description={t("pageDescription")}
        breadcrumbs={[
          { label: tPage("breadcrumbs.home"), href: ROUTES.ADMIN.HOME },
          { label: tPage("breadcrumbs.bundles"), href: ROUTES.ADMIN.BUNDLES.LIST },
          { label: isEditMode ? t("breadcrumbs.edit") : t("breadcrumbs.create") },
        ]}
        action={
          <Button
            type="button"
            disabled={submitting}
            className="h-12 gap-2 rounded-2xl bg-[#C7AF6E] px-5 text-base font-bold text-white shadow-[0px_4px_0px_0px_#A89354] hover:bg-[#B9A064]"
            onClick={() => void submit()}
          >
            <Plus className="h-5 w-5" aria-hidden />
            {t("save")}
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-6">
          <Card className="rounded-2xl border-white/80 bg-white shadow-[0px_8px_0px_0px_#0000000D]">
            <CardContent className="space-y-4 p-6 text-right">
              <div className="flex items-center gap-2 font-bold text-[#1E3A66]">
                <ImageIcon className="h-5 w-5" aria-hidden />
                {t("sections.cover")}
              </div>
              <button
                type="button"
                className="flex min-h-[12rem] w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-6 py-8 text-center transition-colors hover:border-[#C7AF6E]/50"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingCover}
              >
                <UploadCloud className="h-10 w-10 text-slate-300" aria-hidden />
                <div className="space-y-1">
                  <p className="font-semibold text-slate-700">{t("cover.dropTitle")}</p>
                  <p className="text-sm text-slate-400">
                    {uploadingCover ? t("cover.uploading") : t("cover.dropHint")}
                  </p>
                </div>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(event) => {
                  void handleCoverPick(event.target.files?.[0] ?? null);
                  event.target.value = "";
                }}
              />
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-white/80 bg-white shadow-[0px_8px_0px_0px_#0000000D]">
            <CardContent className="space-y-5 p-6 text-right">
              <div className="flex items-center gap-2 font-bold text-[#1E3A66]">
                <AlignLeft className="h-5 w-5" aria-hidden />
                {t("sections.basicInfo")}
              </div>

              <LabeledInput
                label={t("fields.name")}
                value={name}
                placeholder={t("fields.namePlaceholder")}
                onChange={setName}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <LabeledInput
                  label={t("fields.price")}
                  value={bundlePrice}
                  placeholder="0.00"
                  onChange={setBundlePrice}
                />
                {!coursesLocked ? (
                  <SearchableSelect
                    label={t("fields.courses")}
                    value={coursePickerValue}
                    options={filteredCourseSelectOptions}
                    onChange={(value) => {
                      setCoursePickerValue(value);
                      if (value) addCourse(value);
                    }}
                    placeholder={t("fields.coursesPlaceholder")}
                    searchPlaceholder={t("fields.coursesSearchPlaceholder")}
                    emptyMessage={t("fields.coursesEmpty")}
                    searchValue={courseSearchQuery}
                    onSearchValueChange={setCourseSearchQuery}
                  />
                ) : null}
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-[#64748B]">{t("fields.selectedCourses")}</p>
                <div className="flex flex-wrap gap-2">
                  {selectedCourses.map((course) => (
                    <span
                      key={course.id}
                      className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700"
                    >
                      {course.title}
                      {!coursesLocked ? (
                        <button
                          type="button"
                          className="rounded-full p-0.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                          onClick={() => removeCourse(course.id)}
                          aria-label={course.title}
                        >
                          <X className="h-3.5 w-3.5" aria-hidden />
                        </button>
                      ) : null}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-slate-400">
                  {coursesLocked ? t("coursesLockedHint") : t("coursesHint")}
                </p>
              </div>

              <LabeledInput
                label={t("fields.coursesTotalPrice")}
                value={`${coursesTotalPrice.toFixed(2)} ر.ع.`}
                placeholder=""
                onChange={() => undefined}
                readOnly
              />

              <AccessDurationField
                value={accessDurationDays}
                onChange={setAccessDurationDays}
                labels={{
                  title: t("accessDuration.title"),
                  lifetime: t("accessDuration.lifetime"),
                  limited: t("accessDuration.limited"),
                  daysLabel: t("accessDuration.daysLabel"),
                  daysPlaceholder: t("accessDuration.daysPlaceholder"),
                  helpText: t("accessDuration.helpText"),
                  presetDays: t("accessDuration.presetDays"),
                }}
              />
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-white/80 bg-white shadow-[0px_8px_0px_0px_#0000000D]">
            <CardContent className="space-y-4 p-6 text-right">
              <div className="flex items-center gap-2 font-bold text-[#1E3A66]">
                <FileText className="h-5 w-5" aria-hidden />
                {t("sections.description")}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#64748B]" htmlFor="bundle-description">
                  {t("fields.description")}
                </label>
                <textarea
                  id="bundle-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder={t("fields.descriptionPlaceholder")}
                  rows={6}
                  className="min-h-[10rem] w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-right text-sm text-slate-700 placeholder:text-[#94A3B8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C7AF6E]/40"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-2xl border-white/80 bg-white shadow-[0px_8px_0px_0px_#0000000D]">
            <CardContent className="space-y-4 p-6 text-right">
              <div className="flex items-center gap-2 font-bold text-[#1E3A66]">
                <Settings2 className="h-5 w-5" aria-hidden />
                {t("sections.publishing")}
              </div>
              <DashboardFilterSelect
                label={t("fields.publishingMode")}
                value={publishingMode}
                options={[
                  { id: "activePublished", label: t("publishingModes.activePublished") },
                  { id: "activeDraft", label: t("publishingModes.activeDraft") },
                  { id: "inactive", label: t("publishingModes.inactive") },
                ]}
                onChange={(value) => setPublishingMode(value as BundlePublishingMode)}
              />
            </CardContent>
          </Card>

          <div className="space-y-3">
            <p className="text-right text-sm font-bold text-[#1E3A66]">{t("sections.preview")}</p>
            <BundlePreviewCard
              name={name}
              description={description}
              coverImageUrl={coverImageUrl || null}
              courseCount={selectedCourses.length}
              bundlePrice={parsedBundlePrice > 0 ? parsedBundlePrice : null}
              coursesTotalPrice={coursesTotalPrice}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
