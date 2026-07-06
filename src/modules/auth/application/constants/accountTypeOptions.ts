import type { AccountTypeOption } from "@/modules/auth/domain/types/account-type.types";

export const ACCOUNT_TYPE_OPTIONS: AccountTypeOption[] = [
  {
    id: "student",
    iconSrc: "/images/auth/account-type/student-icon.svg",
    iconBgClass: "bg-[#dbe3f3]",
    supportsRegistration: true,
  },
  {
    id: "teacher",
    iconSrc: "/images/auth/account-type/teacher-icon.svg",
    iconBgClass: "bg-[#f4ecd8]",
    supportsRegistration: true,
  },
  {
    id: "parent",
    iconSrc: "/images/auth/account-type/parent-icon.svg",
    iconBgClass: "bg-[#dcf4cb]",
    supportsRegistration: true,
  },
  {
    id: "school",
    iconSrc: "/images/auth/account-type/school-icon.svg",
    iconBgClass: "bg-[rgba(88,204,2,0.2)]",
    supportsRegistration: true,
  },
];
