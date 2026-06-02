"use client";

import {
  createContext,
  useContext,
  type HTMLAttributes,
  type LabelHTMLAttributes,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/shared/application/lib/cn";
import {
  fieldRevealTextTransition,
  fieldRevealTransition,
} from "@/shared/presentation/components/ui/field/field-motion";

interface FieldContextValue {
  invalid: boolean;
  disabled: boolean;
  success: boolean;
}

const FieldContext = createContext<FieldContextValue>({
  invalid: false,
  disabled: false,
  success: false,
});

export function useFieldContext() {
  return useContext(FieldContext);
}

export type FieldProps = HTMLAttributes<HTMLDivElement> & {
  invalid?: boolean;
  disabled?: boolean;
  success?: boolean;
  orientation?: "vertical" | "horizontal";
};

export function Field({
  children,
  className,
  invalid = false,
  disabled = false,
  success = false,
  orientation = "vertical",
  ...props
}: FieldProps) {
  return (
    <FieldContext.Provider value={{ invalid, disabled, success }}>
      <div
        className={cn(
          orientation === "horizontal"
            ? "flex flex-row items-center gap-2"
            : "flex flex-col gap-2",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </FieldContext.Provider>
  );
}

export type FieldLabelProps = LabelHTMLAttributes<HTMLLabelElement> & {
  required?: boolean;
  icon?: ReactNode;
};

export function FieldLabel({
  className,
  required = false,
  icon,
  children,
  ...props
}: FieldLabelProps) {
  const { disabled } = useFieldContext();

  return (
    <label
      className={cn(
        "flex items-center gap-2 text-sm font-bold text-[var(--dashboard-primary)]",
        disabled && "text-[#b0babf]",
        className,
      )}
      {...props}
    >
      {icon ? (
        <span className="shrink-0 text-[var(--dashboard-primary)]">{icon}</span>
      ) : null}
      <span>{children}</span>
      {required ? <span className="text-[var(--dashboard-danger)]">*</span> : null}
    </label>
  );
}

export type FieldDescriptionProps = {
  children?: ReactNode;
  className?: string;
  variant?: "default" | "error" | "success";
};

export function FieldDescription({
  children,
  className,
  variant = "default",
}: FieldDescriptionProps) {
  const { invalid } = useFieldContext();
  const effectiveVariant = invalid ? "error" : variant;

  if (!children) return null;

  return (
    <AnimatePresence initial={false} mode="wait">
      <motion.div
        key="field-description"
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        transition={fieldRevealTransition}
        className="overflow-hidden"
      >
        <motion.p
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={fieldRevealTextTransition}
          className={cn(
            "text-sm",
            effectiveVariant === "error" && "text-[var(--dashboard-danger)]",
            effectiveVariant === "success" && "text-[#22c55e]",
            effectiveVariant === "default" && "text-muted-foreground",
            className,
          )}
        >
          {children}
        </motion.p>
      </motion.div>
    </AnimatePresence>
  );
}

export type FieldErrorProps = {
  message?: string;
  className?: string;
};

export function FieldError({ message, className }: FieldErrorProps) {
  return (
    <AnimatePresence initial={false} mode="wait">
      {message ? (
        <motion.div
          key={message}
          role="alert"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={fieldRevealTransition}
          className="overflow-hidden"
          style={{ transformOrigin: "top center" }}
        >
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={fieldRevealTextTransition}
            className={cn(
              "pt-0.5 text-xs font-medium leading-snug text-[var(--dashboard-danger)]",
              className,
            )}
          >
            {message}
          </motion.p>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

/** @deprecated Prefer `FieldError` — kept for existing imports */
export const FieldMessage = FieldError;

export function FieldGroup({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-6", className)} {...props} />;
}
