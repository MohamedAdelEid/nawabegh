"use client";

import type React from "react";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/shared/presentation/components/ui/input";
import { AddUserField } from "./AddUserField";

export function AddUserInputField({
  label,
  hint,
  className,
  icon: Icon,
  type,
  ...props
}: React.ComponentProps<typeof Input> & {
  label: string;
  hint?: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const isPassword = type === "password";
  const resolvedType = isPassword && passwordVisible ? "text" : type;
  const showTrailingControl = isPassword || Boolean(Icon);

  return (
    <AddUserField label={label} hint={hint}>
      <div className="relative">
        <Input
          {...props}
          type={resolvedType}
          className={`h-14 rounded-2xl border-[var(--dashboard-border-soft)] bg-[var(--dashboard-surface-soft)] px-4 text-right placeholder:text-slate-400 focus-visible:ring-[var(--dashboard-gold)]/25 ${
            showTrailingControl ? "ps-12" : ""
          } ${className ?? ""}`}
        />
        {isPassword ? (
          <button
            type="button"
            className="absolute top-1/2 left-3 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/70 hover:text-slate-700"
            aria-label={passwordVisible ? "Hide password" : "Show password"}
            onClick={() => setPasswordVisible((current) => !current)}
          >
            {passwordVisible ? (
              <EyeOff className="h-5 w-5" aria-hidden />
            ) : (
              <Eye className="h-5 w-5" aria-hidden />
            )}
          </button>
        ) : Icon ? (
          <div className="absolute top-1/2 left-4 -translate-y-1/2">
            <Icon className="h-5 w-5" aria-hidden />
          </div>
        ) : null}
      </div>
    </AddUserField>
  );
}
