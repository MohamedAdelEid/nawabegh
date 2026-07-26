"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { StudentMyProfile } from "@/modules/student/domain/types/student-home.types";
import type { UpdateStudentProfilePayload } from "@/modules/student/domain/profile/profile.types";
import {
  ModalDescription,
  ModalShell,
  ModalTitle,
} from "@/shared/presentation/components/ui/modal-shell";
import { Button } from "@/shared/presentation/components/ui/button";
import { Input } from "@/shared/presentation/components/ui/input";
import { PhoneInput } from "@/shared/presentation/components/ui/phone-input";
import { ApiFailureAlert } from "@/shared/presentation/components/ui/ApiFailureAlert";
import { buildE164FromApiParts, splitPhoneForApi } from "@/shared/domain/utils/phoneCountry.utils";

type ProfileEditDialogProps = {
  open: boolean;
  profile: StudentMyProfile;
  isSaving: boolean;
  errorMessage: string | null;
  onClose: () => void;
  onSave: (payload: UpdateStudentProfilePayload) => Promise<void>;
};

export function ProfileEditDialog({
  open,
  profile,
  isSaving,
  errorMessage,
  onClose,
  onSave,
}: ProfileEditDialogProps) {
  const t = useTranslations("student.dashboard.profile.edit");
  const locale = useLocale();
  const [fullName, setFullName] = useState(profile.fullName);
  const [phoneValue, setPhoneValue] = useState(() =>
    buildE164FromApiParts(profile.phoneNumber ?? "", profile.phoneCountryCode),
  );
  const [address, setAddress] = useState(profile.address);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setFullName(profile.fullName);
    setPhoneValue(buildE164FromApiParts(profile.phoneNumber ?? "", profile.phoneCountryCode));
    setAddress(profile.address);
    setLocalError(null);
  }, [open, profile]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmedName = fullName.trim();
    if (!trimmedName) {
      setLocalError(t("errors.fullNameRequired"));
      return;
    }

    const phoneParts = phoneValue.trim() ? splitPhoneForApi(phoneValue) : null;
    if (phoneValue.trim() && !phoneParts) {
      setLocalError(t("errors.invalidCountryCode"));
      return;
    }

    setLocalError(null);
    await onSave({
      fullName: trimmedName,
      phoneNumber: phoneParts?.phoneNumber ?? null,
      phoneCountryCode: phoneParts?.phoneCountryCode ?? null,
      address: address.trim() || null,
      profileImageUrl: profile.profileImageUrl,
      whatsAppNumber: profile.whatsAppNumber || null,
      whatsAppCountryCode: profile.whatsAppCountryCode,
      educationLevelId: profile.educationLevelId || null,
      gradeId: profile.gradeId || null,
      schoolId: profile.schoolId || null,
      academicTerm: profile.academicTerm,
    });
  }

  return (
    <ModalShell open={open} onOpenChange={(next) => !next && onClose()}>
      <div className="mb-6 space-y-1 text-end">
        <ModalTitle className="text-xl font-bold text-[#2b415e]">{t("title")}</ModalTitle>
        <ModalDescription className="text-sm text-[#64748b]">
          {t("description")}
        </ModalDescription>
      </div>

      <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)}>
        {localError || errorMessage ? (
          <ApiFailureAlert
            message={localError || errorMessage}
            fallbackMessage={t("errors.save")}
          />
        ) : null}

        <label className="block space-y-1.5 text-end">
          <span className="text-sm font-medium text-[#64748b]">{t("fullName")}</span>
          <Input
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            className="h-11 rounded-xl text-end"
            disabled={isSaving}
          />
        </label>

        <label className="block space-y-1.5 text-end">
          <span className="text-sm font-medium text-[#64748b]">{t("emailReadonly")}</span>
          <Input
            value={profile.email}
            readOnly
            disabled
            className="h-11 rounded-xl text-end opacity-70"
          />
        </label>

        <label className="block space-y-1.5 text-end">
          <span className="text-sm font-medium text-[#64748b]">{t("usernameReadonly")}</span>
          <Input
            value={profile.username}
            readOnly
            disabled
            className="h-11 rounded-xl text-end opacity-70"
          />
        </label>

        <label className="block space-y-1.5 text-end">
          <span className="text-sm font-medium text-[#64748b]">{t("phone")}</span>
          <PhoneInput
            value={phoneValue}
            onChange={setPhoneValue}
            locale={locale}
            disabled={isSaving}
          />
        </label>

        <label className="block space-y-1.5 text-end">
          <span className="text-sm font-medium text-[#64748b]">{t("address")}</span>
          <Input
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            className="h-11 rounded-xl text-end"
            disabled={isSaving}
          />
        </label>

        <div className="flex flex-wrap justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-xl"
          >
            {t("cancel")}
          </Button>
          <Button
            type="submit"
            disabled={isSaving}
            className="rounded-xl bg-[#2b415e] hover:bg-[#2b415e]/90"
          >
            {isSaving ? t("saving") : t("save")}
          </Button>
        </div>
      </form>
    </ModalShell>
  );
}
