export type SelectOption<T = string> = {
  label: string;
  value: T;
};

export type SortOrder = "asc" | "desc";
export type ID = string;

export type IconTone = "neutral" | "success" | "warning" | "info" | "primary" | "gold" | "danger";

export const iconToneClassNameMap: Record<IconTone, string> = {
  neutral: "bg-slate-100 text-slate-600",
  success: "bg-[#DCF4CB] text-[#58CC02]",
  warning: "bg-amber-100 text-amber-700",
  info: "bg-sky-100 text-sky-700",
  primary: "bg-[#DCE6F5] text-[#2C4260]",
  gold: "bg-[#F8EFD5] text-[#8F6C0B] border-1 border-[#8F6C0B]",
  danger: "bg-[#FFE4E4] text-[#D33131]",
};

export const iconToneTextClassNameMap: Record<IconTone, string> = {
  neutral: "text-slate-600",
  success: "text-emerald-600",
  warning: "text-amber-600",
  info: "text-sky-600",
  primary: "text-[#2C4260]",
  gold: "text-[#8F6C0B]",
  danger: "text-red-600",
};

export const iconToneBGColorClassNameMap: Record<IconTone, string> = {
  neutral: "bg-slate-100",
  primary: "bg-[#2C4260]",
  success: "bg-[#58CC02]",
  warning: "bg-amber-100",
  info: "bg-sky-100",
  gold: "bg-[#F8EFD5]",
  danger: "bg-[#FFE4E4]",
};