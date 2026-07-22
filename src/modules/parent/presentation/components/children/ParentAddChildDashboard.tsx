"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  CalendarRange,
  CheckCircle2,
  GraduationCap,
  Layers,
  Lock,
  Mail,
  MapPin,
  Phone,
  Plus,
  School as SchoolIcon,
  Search,
  User,
} from "lucide-react";
import {
  useEducationLevels,
  useGrades,
  useSchoolsByCountry,
} from "@/modules/auth/presentation/hooks/useRegistrationFormQueries";
import {
  confirmEmailOtp,
  resendEmailOtp,
} from "@/modules/auth/infrastructure/api/student-registration.api";
import {
  useCreateParentChild,
  useLinkParentChild,
} from "@/modules/parent/application/hooks/useParentChildrenMutations";
import { useParentChildren } from "@/modules/parent/application/hooks/useParentChildren";
import {
  useParentChildrenSearch,
  useParentCreateChildDefaults,
} from "@/modules/parent/application/hooks/useParentChildrenSearch";
import { getChildGradeLabel } from "@/modules/parent/application/lib/parentChildren.utils";
import { formatPercent } from "@/modules/parent/application/lib/parentHome.utils";
import { ParentAvatar } from "@/modules/parent/presentation/components/home/ParentAvatar";
import type {
  ParentChildListItem,
  ParentChildSearchItem,
  ParentCreateChildRequest,
} from "@/modules/parent/domain/types/parentChildren.types";
import { notify } from "@/shared/application/lib/toast";
import { cn } from "@/shared/application/lib/cn";
import {
  buildE164FromApiParts,
  countryIdToPhoneCountry,
  splitPhoneForApi,
} from "@/shared/domain/utils/phoneCountry.utils";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { Button } from "@/shared/presentation/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/shared/presentation/components/ui/field";
import { Input } from "@/shared/presentation/components/ui/input";
import { ModalShell } from "@/shared/presentation/components/ui/modal-shell";
import { OtpInput } from "@/shared/presentation/components/ui/otp-input";
import { PhoneInput } from "@/shared/presentation/components/ui/phone-input";
import { SearchableSelect } from "@/shared/presentation/components/ui/searchable-select";
import { Skeleton } from "@/shared/presentation/components/ui/skeleton";

const CREATE_FORM_ID = "parent-add-child-form";

type AddChildTab = "create" | "link";

export function ParentAddChildDashboard() {
  const t = useTranslations("parent.dashboard.childrenManagement");
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AddChildTab>("create");
  const [isCreateSaving, setIsCreateSaving] = useState(false);

  return (
    <div className="mx-auto flex w-full flex-col gap-8 pb-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1 text-start">
          <p className="text-xs text-[#64748b]">
            {activeTab === "create" ? t("add.breadcrumbCreate") : t("add.breadcrumbLink")}
          </p>
          <h1 className="text-[30px] font-bold leading-9 text-[#2b415e]">
            {activeTab === "create" ? t("add.titleCreate") : t("add.titleLink")}
          </h1>
          <p className="text-base text-[#64748b]">
            {activeTab === "create" ? t("add.subtitleCreate") : t("add.subtitleLink")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            className="h-12 rounded-xl border-[#e2e8f0] px-6 font-bold text-[#2b415e]"
            onClick={() => router.push(ROUTES.USER.PARENT.CHILDREN)}
          >
            {t("add.cancel")}
          </Button>
          {activeTab === "create" ? (
            <Button
              type="submit"
              form={CREATE_FORM_ID}
              disabled={isCreateSaving}
              className="h-12 rounded-xl bg-[#2b415e] px-6 text-sm font-bold text-white hover:bg-[#24384f]"
            >
              {t("add.save")}
            </Button>
          ) : null}
        </div>
      </div>

      <div className="flex items-center gap-8 border-b border-[#e2e8f0]">
        <TabButton active={activeTab === "create"} onClick={() => setActiveTab("create")}>
          {t("add.tabCreate")}
        </TabButton>
        <TabButton active={activeTab === "link"} onClick={() => setActiveTab("link")}>
          {t("add.tabLink")}
        </TabButton>
      </div>

      {activeTab === "create" ? (
        <CreateChildSection formId={CREATE_FORM_ID} onSavingChange={setIsCreateSaving} />
      ) : (
        <LinkChildSection />
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative pb-4 text-sm font-bold transition-colors",
        active ? "text-[#2b415e]" : "text-[#64748b] hover:text-[#2b415e]",
      )}
    >
      {children}
      {active ? (
        <span className="absolute inset-x-0 -bottom-px h-[3px] rounded-full bg-[#c7af6d]" />
      ) : null}
    </button>
  );
}

function SectionCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5 rounded-[20px] border border-[#e2e8f0] bg-white p-6 shadow-[0px_8px_0px_rgba(0,0,0,0.05)] sm:p-8">
      <div className="flex items-center gap-2 text-[#2b415e]">
        {icon}
        <h2 className="text-lg font-bold">{title}</h2>
      </div>
      {children}
    </div>
  );
}

type CreateFormState = {
  fullName: string;
  schoolId: string | null;
  educationLevelId: number | null;
  gradeId: number | null;
  academicTerm: number;
  email: string;
  phone: string;
  address: string;
  password: string;
  confirmPassword: string;
};

const INITIAL_CREATE_FORM_STATE: CreateFormState = {
  fullName: "",
  schoolId: null,
  educationLevelId: null,
  gradeId: null,
  academicTerm: 1,
  email: "",
  phone: "",
  address: "",
  password: "",
  confirmPassword: "",
};

function CreateChildSection({
  formId,
  onSavingChange,
}: {
  formId: string;
  onSavingChange: (saving: boolean) => void;
}) {
  const t = useTranslations("parent.dashboard.childrenManagement");
  const tCommon = useTranslations("parent.dashboard.common");
  const locale = useLocale();
  const router = useRouter();

  const defaultsQuery = useParentCreateChildDefaults();
  const createMutation = useCreateParentChild();

  const [form, setForm] = useState<CreateFormState>(INITIAL_CREATE_FORM_STATE);
  const [errors, setErrors] = useState<Partial<Record<keyof CreateFormState, string>>>({});
  const prefilledRef = useRef(false);

  const [otpOpen, setOtpOpen] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [otpError, setOtpError] = useState<string | undefined>(undefined);
  const [otpSuccess, setOtpSuccess] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpResending, setOtpResending] = useState(false);
  const [createdEmail, setCreatedEmail] = useState("");
  const [createdStudentId, setCreatedStudentId] = useState<string | null>(null);

  const countryId = defaultsQuery.data?.countryId ?? null;
  const schoolsQuery = useSchoolsByCountry(countryId);
  const educationLevelsQuery = useEducationLevels(countryId);
  const gradesQuery = useGrades(form.educationLevelId);

  useEffect(() => {
    if (prefilledRef.current) return;
    const data = defaultsQuery.data;
    if (!data) return;
    setForm((current) => ({
      ...current,
      phone: data.phoneNumber
        ? buildE164FromApiParts(data.phoneNumber, data.phoneCountryCode)
        : current.phone,
      address: data.address ?? current.address,
      academicTerm: data.academicTerm ?? current.academicTerm,
    }));
    prefilledRef.current = true;
  }, [defaultsQuery.data]);

  const setField = <K extends keyof CreateFormState>(key: K, value: CreateFormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const schoolOptions = useMemo(
    () => (schoolsQuery.data ?? []).map((school) => ({ value: school.id, label: school.name })),
    [schoolsQuery.data],
  );

  const educationLevelOptions = useMemo(
    () =>
      (educationLevelsQuery.data ?? []).map((level) => ({
        value: level.id,
        label: resolveOptionLabel(locale, level.nameAr, level.nameEn),
      })),
    [educationLevelsQuery.data, locale],
  );

  const gradeOptions = useMemo(
    () =>
      (gradesQuery.data ?? []).map((grade) => ({
        value: grade.id,
        label: resolveOptionLabel(locale, grade.nameAr, grade.nameEn),
      })),
    [gradesQuery.data, locale],
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: Partial<Record<keyof CreateFormState, string>> = {};
    if (!form.fullName.trim()) nextErrors.fullName = t("add.required");
    if (!form.educationLevelId) nextErrors.educationLevelId = t("add.required");
    if (!form.gradeId) nextErrors.gradeId = t("add.required");
    if (!form.email.trim()) nextErrors.email = t("add.required");
    if (!form.address.trim()) nextErrors.address = t("add.required");

    const splitPhone = splitPhoneForApi(form.phone);
    if (!splitPhone) nextErrors.phone = t("add.required");

    if (form.password.length < 8) nextErrors.password = t("add.passwordMin");
    else if (form.password !== form.confirmPassword) {
      nextErrors.confirmPassword = t("add.passwordMismatch");
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      notify.error(t("add.required"));
      return;
    }
    if (!splitPhone) return;

    const payload: ParentCreateChildRequest = {
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      password: form.password,
      phoneNumber: splitPhone.phoneNumber,
      phoneCountryCode: splitPhone.phoneCountryCode,
      address: form.address.trim(),
      educationLevelId: form.educationLevelId as number,
      gradeId: form.gradeId as number,
      schoolId: form.schoolId,
      academicTerm: form.academicTerm,
      countryId,
    };

    onSavingChange(true);
    try {
      const result = await createMutation.mutateAsync(payload);
      setCreatedEmail(result.email);
      setCreatedStudentId(result.studentUserId ?? null);
      setOtpValue("");
      setOtpError(undefined);
      setOtpSuccess(false);
      setOtpOpen(true);
      notify.success(t("add.createSuccess"));
    } catch (error) {
      notify.error(error instanceof Error ? error.message : tCommon("error"));
    } finally {
      onSavingChange(false);
    }
  };

  const handleConfirmOtp = async () => {
    if (otpValue.length < 6) {
      setOtpError(t("add.otpRequired"));
      return;
    }
    setOtpVerifying(true);
    setOtpError(undefined);
    try {
      await confirmEmailOtp({ email: createdEmail, otp: otpValue }, tCommon("error"));
      setOtpSuccess(true);
      notify.success(t("add.otpSuccess"));
      setTimeout(() => {
        setOtpOpen(false);
        setForm(INITIAL_CREATE_FORM_STATE);
        prefilledRef.current = false;
        router.push(
          createdStudentId
            ? ROUTES.USER.PARENT.CHILD_DETAILS(createdStudentId)
            : ROUTES.USER.PARENT.CHILDREN,
        );
      }, 600);
    } catch (error) {
      setOtpError(error instanceof Error ? error.message : tCommon("error"));
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    setOtpResending(true);
    try {
      await resendEmailOtp({ email: createdEmail }, tCommon("error"));
      notify.success(t("add.otpResend"));
    } catch (error) {
      notify.error(error instanceof Error ? error.message : tCommon("error"));
    } finally {
      setOtpResending(false);
    }
  };

  return (
    <>
      <form id={formId} onSubmit={handleSubmit} className="flex flex-col gap-6">
        <SectionCard title={t("add.basicInfo")} icon={<User className="size-5" />}>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field invalid={Boolean(errors.fullName)}>
              <FieldLabel required>{t("add.fullName")}</FieldLabel>
              <Input
                value={form.fullName}
                onChange={(event) => setField("fullName", event.target.value)}
                invalid={Boolean(errors.fullName)}
                placeholder={t("add.fullName")}
              />
              <FieldError message={errors.fullName} />
            </Field>

            <SearchableSelect
              label={t("add.school")}
              icon={<SchoolIcon className="size-4" />}
              value={form.schoolId}
              onChange={(value) => setField("schoolId", value)}
              options={schoolOptions}
              isLoading={schoolsQuery.isLoading}
              placeholder={t("add.school")}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <SearchableSelect
              label={t("add.educationLevel")}
              required
              icon={<GraduationCap className="size-4" />}
              value={form.educationLevelId}
              onChange={(value) => {
                setField("educationLevelId", value);
                setField("gradeId", null);
              }}
              options={educationLevelOptions}
              isLoading={educationLevelsQuery.isLoading}
              isError={educationLevelsQuery.isError}
              error={errors.educationLevelId}
              placeholder={t("add.educationLevel")}
            />

            <SearchableSelect
              label={t("add.grade")}
              required
              icon={<Layers className="size-4" />}
              value={form.gradeId}
              onChange={(value) => setField("gradeId", value)}
              options={gradeOptions}
              isLoading={gradesQuery.isLoading}
              isError={gradesQuery.isError}
              disabled={!form.educationLevelId}
              error={errors.gradeId}
              placeholder={t("add.grade")}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field>
              <FieldLabel icon={<CalendarRange className="size-4" />}>
                {t("add.academicTerm")}
              </FieldLabel>
              <select
                value={form.academicTerm}
                onChange={(event) => setField("academicTerm", Number(event.target.value))}
                className="h-12 rounded-xl border-2 border-[#e2e8f0] bg-[#f8f9fa] px-4 text-sm font-medium text-[#0f172a] outline-none focus-visible:ring-2 focus-visible:ring-[#2b415e]"
              >
                <option value={1}>{t("add.term1")}</option>
                <option value={2}>{t("add.term2")}</option>
              </select>
            </Field>
          </div>
        </SectionCard>

        <SectionCard title={t("add.contactInfo")} icon={<Mail className="size-5" />}>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field invalid={Boolean(errors.email)}>
              <FieldLabel required icon={<Mail className="size-4" />}>
                {t("add.email")}
              </FieldLabel>
              <Input
                type="email"
                value={form.email}
                onChange={(event) => setField("email", event.target.value)}
                invalid={Boolean(errors.email)}
                placeholder={t("add.email")}
              />
              <FieldError message={errors.email} />
            </Field>

            <Field invalid={Boolean(errors.phone)}>
              <FieldLabel required icon={<Phone className="size-4" />}>
                {t("add.phone")}
              </FieldLabel>
              <PhoneInput
                value={form.phone}
                onChange={(value) => setField("phone", value)}
                defaultCountry={countryIdToPhoneCountry(countryId ?? undefined)}
                locale={locale}
                invalid={Boolean(errors.phone)}
                placeholder={t("add.phone")}
              />
              <FieldError message={errors.phone} />
            </Field>
          </div>

          <Field invalid={Boolean(errors.address)}>
            <FieldLabel required icon={<MapPin className="size-4" />}>
              {t("add.address")}
            </FieldLabel>
            <Input
              value={form.address}
              onChange={(event) => setField("address", event.target.value)}
              invalid={Boolean(errors.address)}
              placeholder={t("add.address")}
            />
            <FieldError message={errors.address} />
          </Field>
        </SectionCard>

        <SectionCard title={t("add.accountInfo")} icon={<Lock className="size-5" />}>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field invalid={Boolean(errors.password)}>
              <FieldLabel required icon={<Lock className="size-4" />}>
                {t("add.password")}
              </FieldLabel>
              <Input
                type="password"
                value={form.password}
                onChange={(event) => setField("password", event.target.value)}
                invalid={Boolean(errors.password)}
                placeholder={t("add.password")}
              />
              <FieldError message={errors.password} />
            </Field>

            <Field invalid={Boolean(errors.confirmPassword)}>
              <FieldLabel required icon={<Lock className="size-4" />}>
                {t("add.confirmPassword")}
              </FieldLabel>
              <Input
                type="password"
                value={form.confirmPassword}
                onChange={(event) => setField("confirmPassword", event.target.value)}
                invalid={Boolean(errors.confirmPassword)}
                placeholder={t("add.confirmPassword")}
              />
              <FieldError message={errors.confirmPassword} />
            </Field>
          </div>
          <p className="text-xs text-[#64748b]">{t("add.passwordHint")}</p>
        </SectionCard>
      </form>

      <ModalShell
        open={otpOpen}
        onOpenChange={(open) => {
          setOtpOpen(open);
          if (!open) setOtpError(undefined);
        }}
        panelClassName="w-full max-w-md rounded-[24px] bg-white p-6 sm:p-8"
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <h2 className="text-xl font-bold text-[#2b415e]">{t("add.otpTitle")}</h2>
          <p className="text-sm text-[#64748b]">
            {t("add.otpDescription", { email: createdEmail })}
          </p>
        </div>

        <div className="mt-6">
          <OtpInput
            length={6}
            value={otpValue}
            onChange={(value) => {
              setOtpValue(value);
              setOtpError(undefined);
            }}
            invalid={Boolean(otpError)}
            success={otpSuccess}
            disabled={otpVerifying || otpSuccess}
          />
          {otpError ? (
            <p className="mt-3 text-center text-xs font-medium text-[var(--dashboard-danger)]">
              {otpError}
            </p>
          ) : null}
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <Button
            type="button"
            disabled={otpVerifying || otpSuccess}
            onClick={handleConfirmOtp}
            className="h-12 rounded-xl bg-[#2b415e] text-sm font-bold text-white hover:bg-[#24384f]"
          >
            {t("add.otpSubmit")}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={otpResending || otpSuccess}
            onClick={handleResendOtp}
            className="h-12 rounded-xl border-[#e2e8f0] text-sm font-bold text-[#2b415e]"
          >
            {t("add.otpResend")}
          </Button>
        </div>
      </ModalShell>
    </>
  );
}

function resolveOptionLabel(
  locale: string,
  nameAr?: string | null,
  nameEn?: string | null,
): string {
  if (locale === "en") return (nameEn?.trim() || nameAr?.trim() || "").trim();
  return (nameAr?.trim() || nameEn?.trim() || "").trim();
}

function LinkChildSection() {
  const t = useTranslations("parent.dashboard.childrenManagement");
  const tCommon = useTranslations("parent.dashboard.common");
  const locale = useLocale();
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [searchInput, setSearchInput] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selected, setSelected] = useState<ParentChildSearchItem | null>(null);

  const searchQuery = useParentChildrenSearch({ keyword: searchKeyword });
  const linkedQuery = useParentChildren();
  const linkMutation = useLinkParentChild();

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSelected(null);
    setSearchKeyword(searchInput.trim());
  };

  const handleConfirmLink = async () => {
    if (!selected) return;
    try {
      await linkMutation.mutateAsync({ studentUserId: selected.studentUserId });
      notify.success(t("add.linkSuccess"));
      router.push(ROUTES.USER.PARENT.CHILD_DETAILS(selected.studentUserId));
    } catch (error) {
      notify.error(error instanceof Error ? error.message : tCommon("error"));
    }
  };

  const showResults = searchKeyword.trim().length >= 2 && !selected;

  return (
    <div className="flex flex-col gap-8">
      <form
        onSubmit={handleSearchSubmit}
        className="flex flex-col gap-4 rounded-[20px] border border-[#e2e8f0] bg-white p-6 shadow-[0px_8px_0px_rgba(0,0,0,0.05)] sm:flex-row sm:items-start"
      >
        <div className="flex-1">
          <div className="relative">
            <Search className="pointer-events-none absolute start-4 top-1/2 size-[18px] -translate-y-1/2 text-[#6b7280]" />
            <Input
              ref={searchInputRef}
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder={t("add.searchPlaceholder")}
              className="h-12 rounded-xl border-2 border-[#e2e8f0] bg-[#f8f9fa] ps-11"
            />
          </div>
          <p className="mt-2 text-xs text-[#64748b]">{t("add.searchHint")}</p>
        </div>
        <Button
          type="submit"
          disabled={searchInput.trim().length < 2}
          className="h-12 shrink-0 rounded-xl bg-[#2b415e] px-6 text-sm font-bold text-white hover:bg-[#24384f]"
        >
          <Search className="size-4" />
          {t("add.searchButton")}
        </Button>
      </form>

      {showResults ? (
        <div className="flex flex-col gap-3">
          {searchQuery.isLoading ? (
            <>
              <Skeleton className="h-20 rounded-2xl" />
              <Skeleton className="h-20 rounded-2xl" />
            </>
          ) : searchQuery.isError ? (
            <p className="rounded-2xl border border-red-100 bg-white p-6 text-sm text-red-600">
              {tCommon("error")}
            </p>
          ) : (searchQuery.data?.items.length ?? 0) === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#cbd5e1] bg-white p-8 text-center text-sm text-[#64748b]">
              {t("add.noResults")}
            </div>
          ) : (
            searchQuery.data?.items.map((item) => (
              <SearchResultRow
                key={item.studentUserId}
                item={item}
                locale={locale}
                onSelect={() => setSelected(item)}
                label={t("add.selectStudent")}
                alreadyLinkedLabel={t("add.alreadyLinked")}
              />
            ))
          )}
        </div>
      ) : null}

      {selected ? (
        <ConfirmLinkCard
          student={selected}
          locale={locale}
          isPending={linkMutation.isPending}
          onCancel={() => setSelected(null)}
          onConfirm={handleConfirmLink}
          t={t}
        />
      ) : null}

      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#2b415e]">{t("add.linkedStudents")}</h2>
          <span className="text-sm text-[#64748b]">
            {t("add.studentsCount", { count: linkedQuery.data?.length ?? 0 })}
          </span>
        </div>

        {linkedQuery.isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-20 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {(linkedQuery.data ?? []).map((child) => (
              <LinkedChildCard
                key={child.studentUserId}
                child={child}
                locale={locale}
                label={t("add.viewDetails")}
              />
            ))}
            <button
              type="button"
              onClick={() => searchInputRef.current?.focus()}
              className="flex min-h-[92px] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#cbd5e1] bg-[rgba(219,227,243,0.25)] p-4 text-center transition hover:border-[#2b415e]"
            >
              <Plus className="size-5 text-[#2b415e]" />
              <span className="text-sm font-bold text-[#2b415e]">{t("add.startLink")}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function SearchResultRow({
  item,
  locale,
  onSelect,
  label,
  alreadyLinkedLabel,
}: {
  item: ParentChildSearchItem;
  locale: string;
  onSelect: () => void;
  label: string;
  alreadyLinkedLabel: string;
}) {
  const gradeLabel = getChildGradeLabel(locale, item);

  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-[#e2e8f0] bg-white p-4">
      <div className="flex min-w-0 items-center gap-3">
        <ParentAvatar
          url={item.profileImageUrl}
          name={item.fullName}
          className="size-12"
          roundedClassName="rounded-full"
        />
        <div className="min-w-0">
          <p className="truncate font-bold text-[#2b415e]">{item.fullName}</p>
          <p className="truncate text-xs text-[#64748b]">
            {[gradeLabel, item.schoolName].filter(Boolean).join(" · ") || "—"}
          </p>
        </div>
      </div>
      {item.alreadyLinked ? (
        <span className="shrink-0 rounded-full bg-[#f1f3f5] px-3 py-1 text-xs font-bold text-[#94a3b8]">
          {alreadyLinkedLabel}
        </span>
      ) : (
        <Button
          type="button"
          onClick={onSelect}
          className="h-10 shrink-0 rounded-xl bg-[#2b415e] px-4 text-sm font-bold text-white hover:bg-[#24384f]"
        >
          {label}
        </Button>
      )}
    </div>
  );
}

function ConfirmLinkCard({
  student,
  locale,
  isPending,
  onCancel,
  onConfirm,
  t,
}: {
  student: ParentChildSearchItem;
  locale: string;
  isPending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  t: ReturnType<typeof useTranslations>;
}) {
  const gradeLabel = getChildGradeLabel(locale, student);
  const hasStats = student.averageScorePercent != null || student.schoolRank != null;

  return (
    <div className="flex flex-col gap-6 rounded-[20px] border border-[#e2e8f0] bg-white p-6 shadow-[0px_8px_0px_rgba(0,0,0,0.05)] sm:p-8">
      <div className="flex items-start gap-3">
        <CheckCircle2 className="mt-0.5 size-6 shrink-0 text-[#58cc02]" />
        <div>
          <p className="text-lg font-bold text-[#2b415e]">{t("add.confirmTitle")}</p>
          <p className="text-sm text-[#64748b]">{t("add.confirmSubtitle")}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 rounded-2xl bg-[#f8f9fa] p-4">
        <ParentAvatar
          url={student.profileImageUrl}
          name={student.fullName}
          className="size-16"
          roundedClassName="rounded-full"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold text-[#2b415e]">{student.fullName}</p>
          <p className="truncate text-sm text-[#64748b]">
            {[gradeLabel, student.schoolName].filter(Boolean).join(" · ") || "—"}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-[rgba(43,65,94,0.08)] px-3 py-1 text-xs font-bold text-[#2b415e]">
          {t("add.verifiedAccount")}
        </span>
      </div>

      {hasStats ? (
        <div className="grid grid-cols-2 gap-4">
          {student.averageScorePercent != null ? (
            <div className="rounded-xl bg-[rgba(199,175,109,0.12)] p-4 text-center">
              <p className="text-2xl font-bold text-[#2b415e]">
                {formatPercent(student.averageScorePercent)}
              </p>
              <p className="text-xs text-[#64748b]">{t("add.averageScore")}</p>
            </div>
          ) : null}
          {student.schoolRank != null ? (
            <div className="rounded-xl bg-[rgba(43,65,94,0.06)] p-4 text-center">
              <p className="text-2xl font-bold text-[#2b415e]">#{student.schoolRank}</p>
              <p className="text-xs text-[#64748b]">{t("add.rankInNawabegh")}</p>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1 rounded-xl border-[#e2e8f0] font-bold text-[#2b415e]"
        >
          {t("add.cancelProcess")}
        </Button>
        <Button
          type="button"
          disabled={isPending}
          onClick={onConfirm}
          className="flex-1 rounded-xl bg-[#2b415e] font-bold text-white hover:bg-[#24384f]"
        >
          {t("add.confirmLink")}
        </Button>
      </div>
    </div>
  );
}

function LinkedChildCard({
  child,
  locale,
  label,
}: {
  child: ParentChildListItem;
  locale: string;
  label: string;
}) {
  const gradeLabel = getChildGradeLabel(locale, child);

  return (
    <Link
      href={ROUTES.USER.PARENT.CHILD_DETAILS(child.studentUserId)}
      className="flex items-center gap-3 rounded-2xl border border-[#e2e8f0] bg-white p-4 transition hover:border-[#2b415e]"
    >
      <ParentAvatar
        url={child.profileImageUrl}
        name={child.fullName}
        className="size-12"
        roundedClassName="rounded-full"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate font-bold text-[#2b415e]">{child.fullName}</p>
        <p className="truncate text-xs text-[#64748b]">{gradeLabel || "—"}</p>
      </div>
      <span className="shrink-0 text-xs font-semibold text-[#2b415e]">{label}</span>
    </Link>
  );
}
