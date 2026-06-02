"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import Lottie, { type LottieRefCurrentProps } from "lottie-react";
import { CircleX } from "lucide-react";
import { cn } from "@/shared/application/lib/cn";
import visibilityAnimation from "@/shared/presentation/assets/animations/visibility.json";
import { useFieldContext } from "@/shared/presentation/components/ui/field";
import {
  inputFieldClasses,
  inputFocusMotionTransition,
  inputFocusRingShadow,
} from "@/shared/presentation/components/ui/input/input.styles";
import type { InputProps } from "@/shared/presentation/components/ui/input/input.types";

function getInputPadding(options: {
  isPasswordField: boolean;
  hasIcon: boolean;
  iconPosition: "start" | "end";
  showClear: boolean;
}) {
  const { isPasswordField, hasIcon, iconPosition, showClear } = options;
  const px = "px-[var(--field-input-padding-x)]";

  if (isPasswordField && hasIcon) return "ps-10 pe-10";
  if (isPasswordField) return "ps-[var(--field-input-padding-x)] pe-10";
  if (hasIcon && showClear) return "ps-10 pe-10";
  if (hasIcon && iconPosition === "start") return "ps-10 pe-[var(--field-input-padding-x)]";
  if (hasIcon && iconPosition === "end") return "ps-[var(--field-input-padding-x)] pe-10";
  if (showClear) return "ps-[var(--field-input-padding-x)] pe-10";
  return px;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      value,
      defaultValue,
      onChange,
      onClear,
      onFocus,
      onBlur,
      disabled,
      icon: Icon,
      iconPosition = "end",
      isPasswordField = false,
      invalid: invalidProp,
      success: successProp,
      showClear: showClearProp = true,
      ...props
    },
    ref,
  ) => {
    const field = useFieldContext();
    const isDisabled = disabled ?? field.disabled;
    const isInvalid = invalidProp ?? field.invalid;
    const isSuccess = successProp ?? field.success;

    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = useState(
      () => (defaultValue as string | undefined) ?? "",
    );
    const [showPassword, setShowPassword] = useState(false);
    const [isFirstRender, setIsFirstRender] = useState(true);
    const [isClearing, setIsClearing] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const internalRef = useRef<HTMLInputElement>(null);
    const lottieRef = useRef<LottieRefCurrentProps>(null);
    const inputRef = (ref as React.RefObject<HTMLInputElement>) ?? internalRef;

    const currentValue = isControlled ? value : internalValue;
    const hasValue = String(currentValue ?? "").length > 0;
    const showFocusRing = isFocused && !isDisabled;

    const handleChange = useCallback(
      (event: ChangeEvent<HTMLInputElement>) => {
        if (!isControlled) setInternalValue(event.target.value);
        onChange?.(event);
      },
      [isControlled, onChange],
    );

    const handleFocus = useCallback(
      (event: FocusEvent<HTMLInputElement>) => {
        setIsFocused(true);
        onFocus?.(event);
      },
      [onFocus],
    );

    const handleBlur = useCallback(
      (event: FocusEvent<HTMLInputElement>) => {
        setIsFocused(false);
        onBlur?.(event);
      },
      [onBlur],
    );

    const handleClear = useCallback(() => {
      setIsClearing(true);
      window.setTimeout(() => {
        if (!isControlled) setInternalValue("");
        onChange?.({ target: { value: "" } } as ChangeEvent<HTMLInputElement>);
        onClear?.();
        setIsClearing(false);
        inputRef.current?.focus();
      }, 150);
    }, [isControlled, onChange, onClear, inputRef]);

    const togglePasswordVisibility = useCallback(() => {
      if (isFirstRender) setIsFirstRender(false);
      setShowPassword((previous) => !previous);
    }, [isFirstRender]);

    useEffect(() => {
      if (!isPasswordField || !lottieRef.current) return;
      if (isFirstRender) {
        lottieRef.current.goToAndStop(0, true);
        return;
      }

      if (showPassword) {
        lottieRef.current.setDirection(1);
        lottieRef.current.play();
      } else {
        lottieRef.current.setDirection(-1);
        lottieRef.current.play();
      }
    }, [showPassword, isFirstRender, isPasswordField]);

    const showClear = hasValue && !isDisabled && !isPasswordField && showClearProp;
    const inputType = isPasswordField ? (showPassword ? "text" : "password") : type;
    const paddingClass = getInputPadding({
      isPasswordField,
      hasIcon: Boolean(Icon),
      iconPosition,
      showClear,
    });

    return (
      <div className="relative flex w-full items-center">
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 rounded-[var(--field-input-radius)]"
          initial={false}
          animate={{
            opacity: showFocusRing ? 1 : 0,
            scale: showFocusRing ? 1 : 0.985,
          }}
          transition={inputFocusMotionTransition}
          style={{ boxShadow: inputFocusRingShadow(isInvalid, isSuccess) }}
        />

        <input
          ref={inputRef}
          type={inputType}
          value={isControlled ? value : internalValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={isDisabled}
          aria-invalid={isInvalid || undefined}
          style={{
            color: isClearing ? "transparent" : undefined,
            transition: "color 0.15s ease-out",
          }}
          className={inputFieldClasses({
            isFocused,
            isInvalid,
            isSuccess,
            isDisabled,
            paddingClass,
            className,
          })}
          {...props}
        />

        {Icon ? (
          <span
            className={cn(
              "pointer-events-none absolute z-20 flex items-center text-[var(--field-input-placeholder)]",
              iconPosition === "start" ? "inset-s-3" : "inset-e-3",
              isPasswordField && "inset-s-3",
            )}
          >
            <Icon className="size-5" aria-hidden />
          </span>
        ) : null}

        <AnimatePresence>
          {showClear ? (
            <motion.button
              type="button"
              onClick={handleClear}
              tabIndex={-1}
              aria-label="Clear"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute inset-e-3 z-20 flex items-center justify-center text-[var(--field-input-placeholder)] transition-colors hover:text-[var(--field-input-text)]"
            >
              <CircleX className="size-5" aria-hidden />
            </motion.button>
          ) : null}
        </AnimatePresence>

        {isPasswordField && !isDisabled ? (
          <button
            type="button"
            tabIndex={-1}
            onClick={togglePasswordVisibility}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute inset-e-3 z-20 flex cursor-pointer items-center text-[var(--field-input-placeholder)] transition-colors hover:text-[var(--field-input-text)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dashboard-primary)]"
          >
            <Lottie
              lottieRef={lottieRef}
              animationData={visibilityAnimation}
              loop={false}
              autoplay={false}
              className="size-6"
            />
          </button>
        ) : null}
      </div>
    );
  },
);

Input.displayName = "Input";

export { Input };
