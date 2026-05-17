"use client";

import { AlertCircle } from "lucide-react";
import { cn } from "@/shared/application/lib/cn";

type ValidationErrors = Record<string, string[]> | null | undefined;
type ValidationErrorItem = { propertyName?: string; errorMessage?: string };
type ValidationErrorsInput = ValidationErrors | ValidationErrorItem[] | unknown;

interface ApiFailureAlertProps {
  message?: string | null;
  validationErrors?: ValidationErrorsInput;
  fallbackMessage?: string;
  className?: string;
}

function flattenValidationErrors(validationErrors: ValidationErrorsInput): string[] {
  if (!validationErrors) return [];

  if (Array.isArray(validationErrors)) {
    return validationErrors
      .map((item) => (typeof item?.errorMessage === "string" ? item.errorMessage : ""))
      .filter((item) => item.trim().length > 0);
  }

  if (typeof validationErrors !== "object") return [];

  return Object.values(validationErrors)
    .flatMap((items) => items)
    .filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

export function ApiFailureAlert({
  message,
  validationErrors,
  fallbackMessage = "Something went wrong. Please try again.",
  className,
}: ApiFailureAlertProps) {
  const details = flattenValidationErrors(validationErrors);
  const primaryMessage = (message ?? "").trim() || fallbackMessage;

  if (!primaryMessage && details.length === 0) return null;

  return (
    <div
      className={cn(
        "rounded-2xl border border-red-200 bg-red-50 p-4 text-right text-red-900",
        className,
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
        <div className="space-y-2">
          <p className="text-sm font-semibold">{primaryMessage}</p>
          {details.length > 0 ? (
            <ul className="list-disc space-y-1 pr-5 text-sm font-medium text-red-800">
              {details.map((detail, index) => (
                <li key={`${detail}-${index}`}>{detail}</li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </div>
  );
}
