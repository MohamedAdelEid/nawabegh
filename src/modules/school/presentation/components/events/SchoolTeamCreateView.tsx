"use client";

import { useDeferredValue, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Camera,
  Globe2,
  Lock,
  School,
  Search,
  UserPlus,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";
import {
  useSchoolTeamMeta,
  useSchoolTeamMutations,
  useSchoolTeamStudentSearch,
} from "@/modules/school/application/hooks/useSchoolEvents";
import type {
  SchoolTeamPrivacy,
  SchoolTeamStudentSearchResult,
} from "@/modules/school/domain/types/schoolEvents.types";
import { cn } from "@/shared/application/lib/cn";
import { notify } from "@/shared/application/lib/toast";
import { resolveFileUrl } from "@/shared/infrastructure/files/fileUrl";
import { ROUTES } from "@/shared/infrastructure/config/routes";
import { Button } from "@/shared/presentation/components/ui/button";
import { LabeledInput } from "@/shared/presentation/components/ui/labeled-input";
import { UserAvatarImageOrInitials } from "@/shared/presentation/components/user/UserAvatarImageOrInitials";
import { SchoolTeamFormSkeleton } from "./SchoolEventsSkeletons";

type FormState = {
  name: string;
  description: string;
  logoUrl: string | null;
  privacy: SchoolTeamPrivacy;
  minLevel: string;
  minChallengesCompleted: string;
  members: SchoolTeamStudentSearchResult[];
};

const EMPTY: FormState = {
  name: "",
  description: "",
  logoUrl: null,
  privacy: "public",
  minLevel: "",
  minChallengesCompleted: "",
  members: [],
};

export function SchoolTeamCreateView() {
  const t = useTranslations("school.dashboard.events.teams");
  const common = useTranslations("school.dashboard.events.common");
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventIdParam = searchParams.get("eventId");
  const schoolEventId = eventIdParam ? Number(eventIdParam) : null;
  const metaQuery = useSchoolTeamMeta();
  const mutations = useSchoolTeamMutations();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [keyword, setKeyword] = useState("");
  const deferredKeyword = useDeferredValue(keyword);
  const searchQuery = useSchoolTeamStudentSearch(deferredKeyword);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const completion = useMemo(() => {
    let score = 0;
    if (form.name.trim()) score += 30;
    if (form.description.trim()) score += 15;
    if (form.logoUrl) score += 15;
    if (form.privacy) score += 20;
    if (form.members.length > 0) score += 20;
    return score;
  }, [form]);

  const privacyOptions = metaQuery.data?.privacyOptions ?? [
    { value: "public" as const, label: t("fields.public"), description: t("fields.publicHint") },
    { value: "school" as const, label: t("fields.school"), description: t("fields.schoolHint") },
    { value: "private" as const, label: t("fields.private"), description: t("fields.privateHint") },
  ];

  const logoPreview = resolveFileUrl(form.logoUrl);

  const addMember = (member: SchoolTeamStudentSearchResult) => {
    setForm((current) => {
      if (current.members.some((item) => item.userId === member.userId)) return current;
      return { ...current, members: [...current.members, member] };
    });
    setKeyword("");
  };

  const handleUpload = async (file: File | undefined) => {
    if (!file) return;
    try {
      const result = await mutations.uploadLogo.mutateAsync(file);
      if (!result.ok) {
        notify.error(result.errorMessage || t("messages.uploadError"));
        return;
      }
      setForm((current) => ({ ...current, logoUrl: result.filePath }));
    } catch (error) {
      notify.error(error instanceof Error ? error.message : t("messages.uploadError"));
    }
  };

  const submit = async () => {
    if (!form.name.trim() || !form.privacy) {
      notify.error(t("messages.validation"));
      return;
    }
    setSubmitting(true);
    try {
      await mutations.create.mutateAsync({
        name: form.name.trim(),
        description: form.description.trim(),
        logoUrl: form.logoUrl,
        privacy: form.privacy,
        minLevel: form.minLevel ? Number(form.minLevel) : null,
        minChallengesCompleted: form.minChallengesCompleted
          ? Number(form.minChallengesCompleted)
          : null,
        schoolEventId:
          schoolEventId && Number.isFinite(schoolEventId) ? schoolEventId : null,
        memberUserIds: form.members.map((member) => member.userId),
      });
      notify.success(t("messages.created"));
      if (schoolEventId && Number.isFinite(schoolEventId)) {
        router.push(ROUTES.USER.SCHOOL.EVENTS.VIEW(schoolEventId));
      } else {
        router.push(ROUTES.USER.SCHOOL.EVENTS.RANKINGS);
      }
    } catch (error) {
      notify.error(error instanceof Error ? error.message : common("actionError"));
    } finally {
      setSubmitting(false);
    }
  };

  if (metaQuery.isLoading) return <SchoolTeamFormSkeleton />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1e3a5f] md:text-3xl">{t("title")}</h1>
        <p className="mt-2 text-sm text-slate-500">{t("subtitle")}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.55fr_1fr]">
        <div className="space-y-5">
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 rounded-[1.5rem] border border-slate-200 bg-white p-5"
          >
            <h2 className="font-bold text-[#1e3a5f]">1. {t("steps.identity")}</h2>
            <div className="flex flex-wrap gap-4">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex size-28 flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50"
              >
                {logoPreview ? (
                  <div className="relative size-full">
                    <Image src={logoPreview} alt="" fill className="object-cover" unoptimized />
                  </div>
                ) : (
                  <>
                    <Camera className="size-6 text-slate-400" />
                    <span className="text-xs font-medium text-slate-500">{t("fields.logo")}</span>
                  </>
                )}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => void handleUpload(event.target.files?.[0])}
              />
              <div className="min-w-[16rem] flex-1 space-y-3">
                <LabeledInput
                  label={t("fields.name")}
                  value={form.name}
                  onChange={(name) =>
                    setForm((current) => ({ ...current, name }))
                  }
                  placeholder={t("fields.namePlaceholder")}
                />
                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-slate-700">
                    {t("fields.description")}
                  </span>
                  <textarea
                    value={form.description}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        description: event.target.value,
                      }))
                    }
                    placeholder={t("fields.descriptionPlaceholder")}
                    className="min-h-24 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none ring-[#1e3a5f]/20 focus:ring-2"
                  />
                </label>
              </div>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="space-y-4 rounded-[1.5rem] border border-slate-200 bg-white p-5"
          >
            <h2 className="font-bold text-[#1e3a5f]">2. {t("steps.rules")}</h2>
            <div className="grid gap-3 md:grid-cols-3">
              {privacyOptions.map((option) => {
                const selected = form.privacy === option.value;
                const Icon =
                  option.value === "private"
                    ? Lock
                    : option.value === "school"
                      ? School
                      : Globe2;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      setForm((current) => ({ ...current, privacy: option.value }))
                    }
                    className={cn(
                      "rounded-2xl border p-4 text-start transition",
                      selected
                        ? "border-[#c4a574] bg-[#c4a574]/10"
                        : "border-slate-200 hover:border-slate-300",
                    )}
                  >
                    <Icon className="mb-3 size-5 text-[#1e3a5f]" />
                    <p className="font-bold text-[#1e3a5f]">
                      {option.label || t(`fields.${option.value}`)}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {option.description || t(`fields.${option.value}Hint`)}
                    </p>
                  </button>
                );
              })}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <LabeledInput
                label={t("fields.minLevel")}
                type="number"
                value={form.minLevel}
                placeholder="0"
                onChange={(minLevel) =>
                  setForm((current) => ({ ...current, minLevel }))
                }
              />
              <LabeledInput
                label={t("fields.minChallenges")}
                type="number"
                value={form.minChallengesCompleted}
                placeholder="0"
                onChange={(minChallengesCompleted) =>
                  setForm((current) => ({
                    ...current,
                    minChallengesCompleted,
                  }))
                }
              />
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4 rounded-[1.5rem] border border-slate-200 bg-white p-5"
          >
            <h2 className="font-bold text-[#1e3a5f]">3. {t("steps.invite")}</h2>
            <div className="relative">
              <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder={t("fields.search")}
                className="min-h-11 w-full rounded-xl border border-slate-200 pe-4 ps-10 text-sm outline-none ring-[#1e3a5f]/20 focus:ring-2"
              />
            </div>
            {searchQuery.data && searchQuery.data.length > 0 ? (
              <div className="max-h-48 space-y-1 overflow-auto rounded-xl border border-slate-100">
                {searchQuery.data.map((student) => (
                  <button
                    key={student.userId}
                    type="button"
                    onClick={() => addMember(student)}
                    className="flex w-full items-center gap-3 px-3 py-2 text-start hover:bg-slate-50"
                  >
                    <UserAvatarImageOrInitials
                      trackKey={student.userId}
                      name={student.fullName}
                      imageUrl={resolveFileUrl(student.avatarUrl)}
                      size="sm"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{student.fullName}</p>
                      <p className="truncate text-xs text-slate-500">
                        {[student.email, student.gradeLabel].filter(Boolean).join(" • ")}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            ) : null}
            <div className="flex flex-wrap gap-2">
              {form.members.map((member) => (
                <span
                  key={member.userId}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-sm"
                >
                  <UserAvatarImageOrInitials
                    trackKey={`member-${member.userId}`}
                    name={member.fullName}
                    imageUrl={resolveFileUrl(member.avatarUrl)}
                    size="sm"
                  />
                  {member.fullName}
                  <button
                    type="button"
                    onClick={() =>
                      setForm((current) => ({
                        ...current,
                        members: current.members.filter(
                          (item) => item.userId !== member.userId,
                        ),
                      }))
                    }
                    aria-label="remove"
                  >
                    <X className="size-3.5" />
                  </button>
                </span>
              ))}
            </div>
          </motion.section>
        </div>

        <div className="space-y-5 lg:sticky lg:top-6 lg:self-start">
          <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
            <h2 className="font-bold text-[#1e3a5f]">{t("summary.title")}</h2>
            <div className="mt-4 flex items-center gap-3">
              <UserAvatarImageOrInitials
                trackKey="team-summary-logo"
                name={form.name || "Team"}
                imageUrl={logoPreview}
                size="md"
              />
              <div>
                <p className="font-bold text-slate-800">
                  {form.name || t("fields.namePlaceholder")}
                </p>
                <p className="text-xs text-slate-500">{t(`fields.${form.privacy}`)}</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span>{t("summary.completion")}</span>
                <span className="font-semibold">{completion}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-[#c4a574] transition-all"
                  style={{ width: `${completion}%` }}
                />
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-600">
              {t("summary.members", { count: form.members.length })}
            </p>
            <Button
              className="mt-5 min-h-12 w-full rounded-xl bg-[#c4a574] text-white hover:bg-[#b39463]"
              onClick={() => void submit()}
              disabled={submitting}
            >
              <UserPlus className="size-4" />
              {submitting ? common("saving") : t("summary.create")}
            </Button>
            <p className="mt-3 text-xs text-slate-400">{t("summary.note")}</p>
          </section>

          <section className="rounded-[1.5rem] bg-[#15233b] p-5 text-white">
            <h3 className="font-bold">{t("info.title")}</h3>
            <p className="mt-3 text-sm leading-7 text-slate-200">{t("info.body")}</p>
            <Link
              href={ROUTES.USER.SCHOOL.EVENTS.RANKINGS}
              className="mt-4 inline-flex text-sm font-semibold text-[#c4a574] hover:underline"
            >
              {t("info.link")}
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
