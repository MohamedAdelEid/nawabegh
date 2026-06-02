import { cn } from "@/shared/application/lib/cn";

export const inputFocusMotionTransition = {
  duration: 0.28,
  ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
};

type InputFieldClassOptions = {
  isFocused: boolean;
  isInvalid: boolean;
  isSuccess: boolean;
  isDisabled: boolean;
  paddingClass: string;
  className?: string;
};

export function inputFieldClasses({
  isFocused,
  isInvalid,
  isSuccess,
  isDisabled,
  paddingClass,
  className,
}: InputFieldClassOptions) {
  return cn(
    "relative z-10 w-full outline-none",
    "h-[var(--field-input-height)] rounded-[var(--field-input-radius)]",
    "border-[length:var(--field-input-border-width)] bg-[var(--field-input-bg)]",
    "text-base font-medium text-[var(--field-input-text)]",
    "placeholder:text-[var(--field-input-placeholder)]",
    "caret-[var(--dashboard-primary)]",
    "transition-[border-color,background-color,color,transform] duration-300 ease-[var(--field-input-ease)]",
    paddingClass,
    isDisabled &&
      "cursor-not-allowed border-[var(--field-input-border-disabled)] bg-[var(--field-input-bg-disabled)] text-[var(--field-input-text-disabled)]",
    !isDisabled &&
      !isInvalid &&
      !isSuccess &&
      (isFocused
        ? "border-[var(--field-input-border-focus)]"
        : "border-[var(--border-input)]"),
    !isDisabled && isInvalid && "border-[var(--field-input-border-error)]",
    !isDisabled && isSuccess && !isInvalid && "border-[var(--field-input-border-success)]",
    className,
  );
}

export function inputFocusRingShadow(isInvalid: boolean, isSuccess: boolean) {
  if (isInvalid) return "var(--field-input-ring-error)";
  if (isSuccess) return "var(--field-input-ring-success)";
  return "var(--field-input-ring-focus)";
}
