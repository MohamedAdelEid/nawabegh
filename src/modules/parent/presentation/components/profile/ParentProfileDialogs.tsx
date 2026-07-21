"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import type {
  ParentChangePasswordPayload,
  ParentProfile,
  UpdateParentProfilePayload,
} from "@/modules/parent/domain/types/parentProfile.types";
import { extractApiErrorMessage } from "@/shared/infrastructure/api/apiResponse.utils";
import { getCountriesDropdown } from "@/shared/infrastructure/api/country.api";
import { notify } from "@/shared/application/lib/toast";
import { Button } from "@/shared/presentation/components/ui/button";
import { Input } from "@/shared/presentation/components/ui/input";
import { Label } from "@/shared/presentation/components/ui/label";
import {
  ModalClose,
  ModalDescription,
  ModalShell,
  ModalTitle,
} from "@/shared/presentation/components/ui/modal-shell";

type ProfileDialogsProps = {
  profile: ParentProfile;
  editOpen: boolean;
  passwordOpen: boolean;
  onEditOpenChange: (open: boolean) => void;
  onPasswordOpenChange: (open: boolean) => void;
  onUpdate: (payload: UpdateParentProfilePayload) => Promise<void>;
  onChangePassword: (payload: ParentChangePasswordPayload) => Promise<void>;
  isUpdating: boolean;
  isChangingPassword: boolean;
};

type FieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

function Field({ label, type, className, ...props }: FieldProps) {
  const id = props.id ?? props.name;

  return (
    <div className="space-y-2 text-sm font-semibold text-slate-700">
      <Label htmlFor={id}>{label}</Label>
      <Input
        {...props}
        id={id}
        type={type}
        className={`h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 font-normal focus-visible:ring-[#C7AF6E]/15 ${className ?? ""}`}
      />
    </div>
  );
}

const emptyPassword: ParentChangePasswordPayload = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export function ParentProfileDialogs({
  profile,
  editOpen,
  passwordOpen,
  onEditOpenChange,
  onPasswordOpenChange,
  onUpdate,
  onChangePassword,
  isUpdating,
  isChangingPassword,
}: ProfileDialogsProps) {
  const t = useTranslations("parent.dashboard.profilePage");
  const [form, setForm] = useState<UpdateParentProfilePayload>({
    fullName: profile.fullName,
    profileImageUrl: profile.profileImageUrl,
    phoneNumber: profile.phoneNumber,
    phoneCountryCode: profile.phoneCountryCode,
    countryId: profile.countryId,
    address: profile.address,
  });
  const [password, setPassword] =
    useState<ParentChangePasswordPayload>(emptyPassword);
  const [countries, setCountries] = useState<Array<{ id: number; name: string }>>(
    [],
  );

  useEffect(() => {
    if (!editOpen) return;
    setForm({
      fullName: profile.fullName,
      profileImageUrl: profile.profileImageUrl,
      phoneNumber: profile.phoneNumber,
      phoneCountryCode: profile.phoneCountryCode,
      countryId: profile.countryId,
      address: profile.address,
    });
    void getCountriesDropdown().then(setCountries).catch(() => setCountries([]));
  }, [editOpen, profile]);

  const submitProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    if (
      !form.fullName.trim() ||
      !form.phoneNumber.trim() ||
      !form.phoneCountryCode ||
      !form.countryId
    ) {
      notify.error(t("messages.requiredFields"));
      return;
    }

    try {
      await onUpdate({
        ...form,
        fullName: form.fullName.trim(),
        phoneNumber: form.phoneNumber.trim(),
        address: form.address.trim(),
        profileImageUrl: form.profileImageUrl?.trim() || null,
      });
      notify.success(t("messages.updateSuccess"));
      onEditOpenChange(false);
    } catch (error) {
      notify.error(extractApiErrorMessage(error, t("messages.loadError")));
    }
  };

  const submitPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (
      !password.currentPassword ||
      !password.newPassword ||
      !password.confirmPassword
    ) {
      notify.error(t("messages.requiredFields"));
      return;
    }
    if (password.newPassword.length < 8) {
      notify.error(t("messages.passwordMin"));
      return;
    }
    if (password.newPassword !== password.confirmPassword) {
      notify.error(t("messages.passwordMismatch"));
      return;
    }

    try {
      await onChangePassword(password);
      notify.success(t("messages.passwordSuccess"));
      setPassword(emptyPassword);
      onPasswordOpenChange(false);
    } catch (error) {
      notify.error(extractApiErrorMessage(error, t("messages.loadError")));
    }
  };

  return (
    <>
      <ModalShell
        open={editOpen}
        onOpenChange={onEditOpenChange}
        panelClassName="max-h-[90vh] overflow-y-auto"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <ModalTitle className="text-xl font-bold text-slate-800">
              {t("dialogs.editTitle")}
            </ModalTitle>
            <ModalDescription className="mt-1 text-sm text-slate-500">
              {t("dialogs.editDescription")}
            </ModalDescription>
          </div>
          <ModalClose className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100">
            <X className="h-5 w-5" />
          </ModalClose>
        </div>

        <form className="space-y-4" onSubmit={submitProfile}>
          <Field
            label={t("fields.fullName")}
            value={form.fullName}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                fullName: event.target.value,
              }))
            }
          />
          <Field label={t("fields.email")} value={profile.email} disabled />
          <div className="grid gap-4 sm:grid-cols-[8rem_1fr]">
            <Field
              label={t("fields.phoneCountryCode")}
              type="number"
              value={form.phoneCountryCode}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  phoneCountryCode: Number(event.target.value),
                }))
              }
            />
            <Field
              label={t("fields.phoneNumber")}
              value={form.phoneNumber}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  phoneNumber: event.target.value,
                }))
              }
            />
          </div>
          <label className="block space-y-2 text-sm font-semibold text-slate-700">
            <span>{t("fields.country")}</span>
            <select
              value={form.countryId}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  countryId: Number(event.target.value),
                }))
              }
              className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 font-normal outline-none focus:border-[#C7AF6E]"
            >
              {countries.length === 0 ? (
                <option value={profile.countryId}>
                  {profile.countryNameAr || profile.countryId}
                </option>
              ) : null}
              {countries.map((country) => (
                <option key={country.id} value={country.id}>
                  {country.name}
                </option>
              ))}
            </select>
          </label>
          <Field
            label={t("fields.address")}
            value={form.address}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                address: event.target.value,
              }))
            }
          />
          <Field
            label={t("fields.profileImageUrl")}
            type="url"
            value={form.profileImageUrl ?? ""}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                profileImageUrl: event.target.value,
              }))
            }
          />
          <div className="flex justify-end gap-3 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onEditOpenChange(false)}
            >
              {t("actions.cancel")}
            </Button>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? t("actions.saving") : t("actions.save")}
            </Button>
          </div>
        </form>
      </ModalShell>

      <ModalShell open={passwordOpen} onOpenChange={onPasswordOpenChange}>
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <ModalTitle className="text-xl font-bold text-slate-800">
              {t("dialogs.passwordTitle")}
            </ModalTitle>
            <ModalDescription className="mt-1 text-sm text-slate-500">
              {t("dialogs.passwordDescription")}
            </ModalDescription>
          </div>
          <ModalClose className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100">
            <X className="h-5 w-5" />
          </ModalClose>
        </div>

        <form className="space-y-4" onSubmit={submitPassword}>
          <Field
            label={t("fields.currentPassword")}
            type="password"
            autoComplete="current-password"
            value={password.currentPassword}
            onChange={(event) =>
              setPassword((current) => ({
                ...current,
                currentPassword: event.target.value,
              }))
            }
          />
          <Field
            label={t("fields.newPassword")}
            type="password"
            autoComplete="new-password"
            value={password.newPassword}
            onChange={(event) =>
              setPassword((current) => ({
                ...current,
                newPassword: event.target.value,
              }))
            }
          />
          <Field
            label={t("fields.confirmPassword")}
            type="password"
            autoComplete="new-password"
            value={password.confirmPassword}
            onChange={(event) =>
              setPassword((current) => ({
                ...current,
                confirmPassword: event.target.value,
              }))
            }
          />
          <div className="flex justify-end gap-3 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onPasswordOpenChange(false)}
            >
              {t("actions.cancel")}
            </Button>
            <Button type="submit" disabled={isChangingPassword}>
              {isChangingPassword ? t("actions.saving") : t("actions.save")}
            </Button>
          </div>
        </form>
      </ModalShell>
    </>
  );
}
