import type { ChangeEvent, ComponentType, InputHTMLAttributes } from "react";

export type InputIconComponent = ComponentType<{ className?: string }>;

export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  type?: InputHTMLAttributes<HTMLInputElement>["type"];
  icon?: InputIconComponent;
  iconPosition?: "start" | "end";
  isPasswordField?: boolean;
  invalid?: boolean;
  success?: boolean;
  onClear?: () => void;
  showClear?: boolean;
};

export type InputChangeEvent = ChangeEvent<HTMLInputElement>;
