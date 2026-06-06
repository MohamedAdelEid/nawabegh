"use client";

import {
  useCallback,
  useId,
  useRef,
  useState,
  type ClipboardEvent,
  type KeyboardEvent,
} from "react";
import { motion } from "framer-motion";
import { cn } from "@/shared/application/lib/cn";

export type OtpInputProps = {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  invalid?: boolean;
  success?: boolean;
  autoFocus?: boolean;
  className?: string;
  "aria-label"?: string;
};

function sanitizeDigits(value: string, maxLength: number) {
  return value.replace(/\D/g, "").slice(0, maxLength);
}

export function OtpInput({
  length = 4,
  value,
  onChange,
  disabled = false,
  invalid = false,
  success = false,
  autoFocus = true,
  className,
  "aria-label": ariaLabel,
}: OtpInputProps) {
  const id = useId();
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(
    autoFocus ? 0 : null,
  );

  const sanitized = sanitizeDigits(value, length);
  const digits = Array.from({ length }, (_, index) => sanitized[index] ?? "");

  const updateValue = useCallback(
    (next: string) => {
      onChange(sanitizeDigits(next, length));
    },
    [length, onChange],
  );

  const focusIndex = (index: number) => {
    const clamped = Math.max(0, Math.min(index, length - 1));
    inputRefs.current[clamped]?.focus();
    setFocusedIndex(clamped);
  };

  const handleChange = (index: number, raw: string) => {
    const chunk = sanitizeDigits(raw, length);
    if (!chunk) {
      const next = digits.slice();
      next[index] = "";
      updateValue(next.join(""));
      return;
    }

    if (chunk.length > 1) {
      updateValue(chunk);
      focusIndex(Math.min(chunk.length, length - 1));
      return;
    }

    const next = digits.slice();
    next[index] = chunk;
    updateValue(next.join(""));
    if (index < length - 1) focusIndex(index + 1);
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace") {
      event.preventDefault();
      if (digits[index]) {
        const next = digits.slice();
        next[index] = "";
        updateValue(next.join(""));
        return;
      }
      if (index > 0) {
        const next = digits.slice();
        next[index - 1] = "";
        updateValue(next.join(""));
        focusIndex(index - 1);
      }
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusIndex(index - 1);
      return;
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      focusIndex(index + 1);
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = sanitizeDigits(event.clipboardData.getData("text"), length);
    if (!pasted) return;
    updateValue(pasted);
    focusIndex(Math.min(pasted.length, length - 1));
  };

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn("flex items-center justify-center gap-3 sm:gap-4", className)}
    >
      {Array.from({ length }, (_, index) => {
        const digit = digits[index]?.trim() ?? "";
        const isFocused = focusedIndex === index;

        return (
          <motion.div
            key={`${id}-${index}`}
            animate={
              invalid
                ? { x: [0, -6, 6, -4, 4, 0] }
                : success
                  ? { scale: [1, 1.04, 1] }
                  : { scale: isFocused ? 1.02 : 1 }
            }
            transition={
              invalid
                ? { duration: 0.45, ease: "easeInOut" }
                : { duration: 0.2, ease: [0.22, 1, 0.36, 1] }
            }
            className="relative"
          >
            {isFocused && !invalid && !success ? (
              <motion.span
                layoutId={`${id}-otp-ring`}
                className="pointer-events-none absolute inset-0 rounded-[var(--field-input-radius)] shadow-[var(--field-input-ring-focus)]"
                transition={{ duration: 0.2 }}
              />
            ) : null}

            <input
              ref={(element) => {
                inputRefs.current[index] = element;
              }}
              type="text"
              inputMode="numeric"
              autoComplete={index === 0 ? "one-time-code" : "off"}
              maxLength={length}
              disabled={disabled}
              aria-invalid={invalid || undefined}
              value={digit || ""}
              onChange={(event) => handleChange(index, event.target.value)}
              onKeyDown={(event) => handleKeyDown(index, event)}
              onPaste={handlePaste}
              onFocus={() => setFocusedIndex(index)}
              onBlur={() =>
                setFocusedIndex((current) => (current === index ? null : current))
              }
              className={cn(
                "relative z-10 size-14 rounded-[var(--field-input-radius)] border-[length:var(--field-input-border-width)] bg-[var(--field-input-bg)] text-center text-xl font-bold text-[var(--field-input-text)] outline-none transition-[border-color,box-shadow] duration-300 ease-[var(--field-input-ease)] sm:size-16 sm:text-2xl",
                invalid
                  ? "border-[var(--field-input-border-error)]"
                  : success
                    ? "border-[var(--field-input-border-success)]"
                    : isFocused
                      ? "border-[var(--field-input-border-focus)]"
                      : "border-[var(--auth-border)]",
                disabled && "cursor-not-allowed opacity-60",
              )}
            />
          </motion.div>
        );
      })}
    </div>
  );
}
